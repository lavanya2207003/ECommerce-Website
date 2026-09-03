import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { customerAPI } from '../services/api';
import Icon from '../components/Icon';
import ImageWithFallback from '../components/ImageWithFallback';

export default function PaymentPage() {
  const { cart, clearCart, placeOrder } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(7);
  const paymentInFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const loadPaymentData = async () => {
      try {
        const profileRes = await customerAPI.getProfile();
        const profile = profileRes?.data?.customer;
        if (!cancelled && profile) {
          setAddress(prev => ({
            ...prev,
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
          }));
        }
        const cartRes = await customerAPI.getCart();
        const cartData = cartRes?.data?.data || cartRes?.data || [];
        if (!cancelled && (!Array.isArray(cartData) || cartData.length === 0)) {
          navigate('/cart', { replace: true });
        }
      } catch (err) {
        if (!cancelled) {
          if (err?.status === 401 || err?.status === 403) {
            navigate('/login', { replace: true });
          } else {
            setError('Failed to load checkout data. Please try again.');
          }
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    };
    loadPaymentData();
    return () => { cancelled = true; };
  }, [navigate]);

  const totalMRP = cart.reduce((s, x) => s + x.price * x.quantity, 0);
  const itemDiscount = cart.reduce((s, x) => s + ((x.discount || 0) * x.quantity), 0);
  const baseDelivery = totalMRP >= 999 ? 0 : 99;
  const deliveryCharges = baseDelivery + (deliveryDays === 3 ? 99 : 0);
  const platformFee = 0;
  const gstTax = Math.round(totalMRP * 0.05);
  const finalAmount = totalMRP - couponDiscount + deliveryCharges + platformFee + gstTax;

  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + deliveryDays);
  const formattedDate = expectedDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  const coupons = {
    'WELCOME100': { discount: 100, type: 'flat', description: 'Flat ₹100 off' },
    'SAVE10': { discount: 0.10, type: 'percent', max: 500, description: '10% off (up to ₹500)' },
    'FLAT200': { discount: 200, type: 'flat', description: 'Flat ₹200 off' },
    'FREESHIP': { discount: 0, type: 'freeship', description: 'Free shipping' },
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const coupon = coupons[code];
    if (!coupon) { setError('Invalid coupon code'); return; }
    let disc = 0;
    if (coupon.type === 'flat') disc = coupon.discount;
    else if (coupon.type === 'percent') disc = Math.min(Math.round(totalMRP * coupon.discount), coupon.max);
    else if (coupon.type === 'freeship') disc = 0;
    setAppliedCoupon({ code, ...coupon });
    setCouponDiscount(disc);
    setError('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout. Check your internet connection.'));
      document.body.appendChild(script);
    });
  };

  const validateAddress = () => {
    const required = ['name', 'email', 'phone', 'line', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!address[field] || !address[field].trim()) {
        return `Please enter your ${field === 'line' ? 'address' : field === 'pincode' ? 'pincode' : field === 'phone' ? 'phone number' : field === 'email' ? 'email address' : field}`;
      }
    }
    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      return 'Please enter a valid 10-digit mobile number';
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      return 'Please enter a valid 6-digit pincode';
    }
    if (!/^\S+@\S+\.\S+$/.test(address.email.trim())) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handlePayment = async () => {
    setError('');

    if (!cart.length) {
      setError('Your cart is empty. Please add items before placing an order.');
      return;
    }

    const validationError = validateAddress();
    if (validationError) {
      setError(validationError);
      setStep(1);
      return;
    }

    if (paymentInFlight.current) {
      return;
    }
    paymentInFlight.current = true;
    setLoading(true);

    try {
      const orderId = `LY${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
      const orderData = {
        amount: finalAmount,
        currency: 'INR',
        receipt: orderId,
        order_id: orderId,
        customer_details: {
          name: address.name,
          phone: address.phone,
          email: address.email || '',
        },
        delivery_address: {
          full_name: address.name,
          phone: address.phone,
          email: address.email || '',
          house_flat: address.line || '',
          street: address.street || '',
          area: address.area || '',
          landmark: address.landmark || '',
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          address_type: address.address_type || 'home',
        },
        ordered_products: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          image: item.image || '',
          brand: item.brand || '',
          size: item.size || '',
          color: item.color || '',
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          total_price: item.price * item.quantity - (item.discount || 0) * item.quantity,
        })),
        price_breakdown: {
          total_mrp: totalMRP,
          discount: itemDiscount,
          coupon_code: appliedCoupon?.code || '',
          coupon_discount: couponDiscount,
          delivery_charges: deliveryCharges,
          platform_fee: platformFee,
          gst_tax: gstTax,
          final_amount: finalAmount,
        },
        delivery_info: {
          expected_date: formattedDate,
          shipping_method: 'Standard Delivery',
          delivery_charges: deliveryCharges,
          estimated_time: deliveryDays === 3 ? '3-5 business days' : '5-7 business days',
        },
        order_notes: orderNotes,
      };

      const result = await customerAPI.createOrder(orderData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment order.');
      }

      if (!result.key || !result.order?.id) {
        throw new Error('Payment gateway returned an incomplete order');
      }

      await loadRazorpayScript();

      const options = {
        key: result.key,
        amount: result.order.amount,
        currency: result.order.currency,
        order_id: result.order.id,
        name: 'LayaStore',
        description: 'Order Payment',
        handler: async (razorpayResponse) => {
          const verifyData = {
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            order_id: orderData.order_id,
            amount: finalAmount,
            currency: 'INR',
            customer_details: orderData.customer_details,
            delivery_address: orderData.delivery_address,
            ordered_products: orderData.ordered_products,
            price_breakdown: orderData.price_breakdown,
            delivery_info: orderData.delivery_info,
            order_notes: orderData.order_notes,
          };

          try {
            const verifyResult = await customerAPI.verifyPayment(verifyData);

            if (verifyResult.success && verifyResult.verified) {
              const order = {
                id: orderData.order_id,
                date: new Date().toISOString(),
                items: cart,
                total: finalAmount,
                status: 'confirmed',
                address,
                delivery_address: orderData.delivery_address,
                paymentId: razorpayResponse.razorpay_payment_id,
                price_breakdown: orderData.price_breakdown,
                delivery_info: orderData.delivery_info,
                order_notes: orderNotes,
                paymentMethod: verifyResult.payment?.method || 'razorpay',
                coupon: appliedCoupon,
              };
              placeOrder(order);

              try {
                await customerAPI.clearCart();
              } catch (clearErr) {
                clearCart();
              }

              clearCart();
              navigate('/order-success', {
                state: {
                  orderId: order.id,
                  razorpayOrderId: razorpayResponse.razorpay_order_id,
                  amount: finalAmount,
                  paymentId: razorpayResponse.razorpay_payment_id,
                  signature: razorpayResponse.razorpay_signature,
                  paymentMethod: verifyResult.payment?.method || 'razorpay',
                  paymentStatus: 'Paid',
                  transactionDate: new Date().toISOString(),
                  orderItems: cart,
                  delivery_address: orderData.delivery_address,
                  price_breakdown: orderData.price_breakdown,
                  delivery_info: orderData.delivery_info,
                  order_notes: orderNotes,
                  coupon: appliedCoupon,
                  address,
                },
              });
            } else {
              setError(verifyResult.error || 'Payment verification failed. Please try again.');
            }
          } catch (verifyError) {
            setError(verifyError.message || 'Payment verification failed. Please try again or contact support.');
          } finally {
            setLoading(false);
            paymentInFlight.current = false;
          }
        },
        prefill: {
          name: address.name,
          email: address.email || '',
          contact: address.phone,
        },
        theme: { color: '#7C3AED' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            paymentInFlight.current = false;
            setError('Payment was cancelled. Your cart is still saved; you can try again.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (event) => {
        setError(event.error.description || 'Payment failed. Please try again.');
        setLoading(false);
        paymentInFlight.current = false;
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
      paymentInFlight.current = false;
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!cart.length) return <div className="react-empty"><h2>Your cart is empty</h2><Link to="/shop">Shop now</Link></div>;

  return <section className="checkout-section">
    <div className="checkout-container">
      <div className="checkout-hero">
        <div className="checkout-badge"><Icon name="lock" /> Secure Checkout</div>
        <h1>Checkout</h1>
        <p className="checkout-subtitle">Complete your order securely in just a few simple steps.</p>
        <div className="checkout-stepper">
          <div className="stepper-track">
            <div className="stepper-progress" style={{ width: step === 1 ? '0%' : '100%' }} />
            <div className="stepper-remaining" style={{ left: step === 1 ? '0%' : '100%' }} />
          </div>
          <div className="stepper-steps">
            {'Delivery\u0001Shipping Details,Review\u0001Confirm & Pay'.split(',').map((s, i) => {
              const [t, d] = s.split('\u0001');
              return <div className={`stepper-step ${step === i + 1 ? 'active' : ''} ${step >= i + 1 ? 'completed' : ''}`} key={i}>
                <div className="stepper-circle">
                  <span className="stepper-num">{i + 1}</span>
                  {step >= i + 1 && <Icon name="check" />}
                </div>
                <div className="stepper-info">
                  <div className="stepper-title">{t}</div>
                  <div className="stepper-desc">{d}</div>
                </div>
              </div>;
            })}
          </div>
        </div>
        <div className="checkout-trust">
          <div className="trust-item"><Icon name="shield-halved" /> Secure Payment</div>
          <div className="trust-item"><Icon name="truck-fast" /> Fast Delivery</div>
          <div className="trust-item"><Icon name="rotate-left" /> Easy Returns</div>
        </div>
      </div>
      <div className="checkout-body">
        <form className="checkout-main" onSubmit={e => e.preventDefault()}>

          {step === 1 && <div className="checkout-step-content">
            <h2>Delivery Address</h2>
            {error && <div className="payment-error"><Icon name="circle-exclamation" /> {error}</div>}

            <div className="addr-form-section">
              <h3><Icon name="user" /> Contact Details</h3>
              <div className="addr-form-row">
                <div className="addr-group">
                  <label htmlFor="name">Full Name <span className="req">*</span></label>
                  <input id="name" type="text" placeholder="Enter your full name" value={address.name || ''} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
                </div>
                <div className="addr-group">
                  <label htmlFor="phone">Mobile Number <span className="req">*</span></label>
                  <input id="phone" type="tel" placeholder="10-digit mobile number" value={address.phone || ''} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                </div>
              </div>
              <div className="addr-form-row">
                <div className="addr-group addr-full">
                  <label htmlFor="email">Email Address <span className="req">*</span></label>
                  <input id="email" type="email" placeholder="your@email.com" value={address.email || ''} onChange={(e) => setAddress({ ...address, email: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="addr-form-section">
              <h3><Icon name="house" /> Delivery Address</h3>
              <div className="addr-form-row">
                <div className="addr-group">
                  <label htmlFor="line">House / Flat No. <span className="req">*</span></label>
                  <input id="line" type="text" placeholder="Flat / House No." value={address.line || ''} onChange={(e) => setAddress({ ...address, line: e.target.value })} />
                </div>
                <div className="addr-group">
                  <label htmlFor="street">Street Address</label>
                  <input id="street" type="text" placeholder="Street name" value={address.street || ''} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                </div>
              </div>
              <div className="addr-form-row">
                <div className="addr-group">
                  <label htmlFor="area">Area / Locality</label>
                  <input id="area" type="text" placeholder="Area or locality" value={address.area || ''} onChange={(e) => setAddress({ ...address, area: e.target.value })} />
                </div>
                <div className="addr-group">
                  <label htmlFor="landmark">Landmark <span className="req-optional">(Optional)</span></label>
                  <input id="landmark" type="text" placeholder="Nearby landmark" value={address.landmark || ''} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} />
                </div>
              </div>
              <div className="addr-form-row">
                <div className="addr-group">
                  <label htmlFor="city">City <span className="req">*</span></label>
                  <input id="city" type="text" placeholder="City" value={address.city || ''} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div className="addr-group">
                  <label htmlFor="state">State <span className="req">*</span></label>
                  <input id="state" type="text" placeholder="State" value={address.state || ''} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                </div>
              </div>
              <div className="addr-form-row">
                <div className="addr-group addr-full">
                  <label htmlFor="pincode">PIN Code <span className="req">*</span></label>
                  <input id="pincode" type="text" placeholder="6-digit PIN code" value={address.pincode || ''} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="addr-form-section">
              <h3><Icon name="tag" /> Address Type</h3>
              <div className="addr-type-row">
                {[['home', 'Home', 'house'], ['office', 'Office', 'building'], ['other', 'Other', 'location-dot']].map(([val, lbl, icon]) =>
                  <label key={val} className={`addr-type-btn ${address.address_type === val ? 'active' : ''}`}>
                    <input type="radio" name="address_type" value={val} checked={address.address_type === val} onChange={(e) => setAddress({ ...address, address_type: e.target.value })} />
                    <Icon name={icon} /> {lbl}
                  </label>
                )}
              </div>
            </div>
          </div>}

          {step === 2 && <div className="checkout-step-content review-step">
            <div className="review-header-bar">
              <h2>Review Your Order</h2>
              <button type="button" className="review-edit-btn" onClick={() => setStep(1)}>
                <Icon name="pen-to-square" /> Edit Address
              </button>
            </div>
            {error && <div className="review-error"><Icon name="circle-exclamation" /> {error}</div>}

            <div className="review-layout">
              <div className="review-left-col">

                <div className="review-card">
                  <div className="review-card-head">
                    <div className="review-card-head-icon"><Icon name="location-dot" /></div>
                    <div>
                      <h3>Delivery Address</h3>
                      <span className={`review-addr-type-badge ${address.address_type || 'home'}`}>
                        <Icon name={address.address_type === 'office' ? 'building' : address.address_type === 'other' ? 'location-dot' : 'house'} />
                        {address.address_type === 'office' ? 'Office' : address.address_type === 'other' ? 'Other' : 'Home'}
                      </span>
                    </div>
                  </div>
                  <div className="review-card-body">
                    <p className="review-addr-name">{address.name}</p>
                    <p>{address.line}{address.street ? `, ${address.street}` : ''}{address.area ? `, ${address.area}` : ''}</p>
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                    {address.landmark && <p className="review-landmark"><Icon name="map-pin" /> {address.landmark}</p>}
                    <div className="review-contact">
                      <div className="review-contact-row"><Icon name="phone" /><span>{address.phone}</span></div>
                      <div className="review-contact-row"><Icon name="envelope" /><span>{address.email}</span></div>
                    </div>
                  </div>
                </div>

                <div className="review-card">
                  <div className="review-card-head">
                    <div className="review-card-head-icon"><Icon name="bag-shopping" /></div>
                    <div>
                      <h3>Ordered Products</h3>
                      <span className="review-product-count">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>
                  <div className="review-card-body">
                    <div className="review-products-list">
                      {cart.map(item => <div key={item.id} className="review-product-item">
                        <ImageWithFallback src={item.image} alt={item.name} className="review-product-img" />
                        <div className="review-product-info">
                          {item.brand && <span className="review-product-brand">{item.brand}</span>}
                          <h4>{item.name}</h4>
                          <div className="review-product-meta">
                            {item.size && <span><Icon name="ruler" /> {item.size}</span>}
                            {item.color && <span><Icon name="tag" /> {item.color}</span>}
                            <span><Icon name="layer-group" /> Qty: {item.quantity}</span>
                          </div>
                          <div className="review-product-pricing">
                            <span className="review-unit-price">₹{item.price} × {item.quantity}</span>
                            {(item.discount || 0) > 0 && <span className="review-discount-tag"><Icon name="tag" /> -{item.discount}%</span>}
                            <strong className="review-item-total">₹{item.price * item.quantity - (item.discount || 0) * item.quantity}</strong>
                          </div>
                        </div>
                      </div>)}
                    </div>
                  </div>
                </div>

                <div className="review-card">
                  <div className="review-card-head">
                    <div className="review-card-head-icon"><Icon name="truck-fast" /></div>
                    <div>
                      <h3>Delivery Details</h3>
                    </div>
                  </div>
                  <div className="review-card-body">
                    <div className="review-delivery-grid">
                      <div className="review-delivery-cell">
                        <Icon name="calendar-check" />
                        <div>
                          <strong>Expected Delivery</strong>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                      <div className="review-delivery-cell">
                        <Icon name="truck" />
                        <div>
                          <strong>Shipping Method</strong>
                          <span>Standard Delivery</span>
                        </div>
                      </div>
                      <div className="review-delivery-cell">
                        <Icon name="dollar-sign" />
                        <div>
                          <strong>Delivery Charges</strong>
                          <span>{deliveryCharges === 0 ? 'Free' : `₹${deliveryCharges}`}</span>
                        </div>
                      </div>
                    </div>
                    <div className="review-delivery-speed">
                      <button type="button" className={`speed-btn ${deliveryDays === 7 ? 'active' : ''}`} onClick={() => setDeliveryDays(7)}>
                        <Icon name="box" /> Standard (5-7 days)
                      </button>
                      <button type="button" className={`speed-btn ${deliveryDays === 3 ? 'active' : ''}`} onClick={() => setDeliveryDays(3)}>
                        <Icon name="bolt" /> Express (3-5 days, +₹99)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="review-card">
                  <div className="review-card-head">
                    <div className="review-card-head-icon"><Icon name="tag" /></div>
                    <div>
                      <h3>Coupon</h3>
                    </div>
                  </div>
                  <div className="review-card-body">
                    {appliedCoupon ? (
                      <div className="review-applied-coupon">
                        <div className="coupon-badge"><Icon name="circle-check" /> {appliedCoupon.code}</div>
                        <span>{appliedCoupon.description} — ₹{couponDiscount} off</span>
                        <button type="button" className="coupon-remove" onClick={removeCoupon}><Icon name="xmark" /></button>
                      </div>
                    ) : (
                      <div className="review-coupon-input">
                        <input type="text" placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                        <button type="button" className="coupon-apply-btn" onClick={applyCoupon}>Apply</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="review-card">
                  <div className="review-card-head">
                    <div className="review-card-head-icon"><Icon name="note-sticky" /></div>
                    <div>
                      <h3>Order Notes</h3>
                    </div>
                  </div>
                  <div className="review-card-body">
                    <textarea className="review-notes-input" placeholder="Special instructions for delivery — e.g., ring the doorbell, leave at reception..." value={orderNotes} onChange={e => setOrderNotes(e.target.value)} rows={3} />
                    {!orderNotes && <p className="review-notes-hint">No special instructions.</p>}
                  </div>
                </div>

                <div className="review-card review-security-card">
                  <div className="review-security-body">
                    <Icon name="lock" />
                    <div>
                      <strong>Secure Payment</strong>
                      <span>Your payment is processed securely by Razorpay using 256-bit encryption.</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>}

          <div className="step-btns">
            {step > 1 && <button type="button" className="checkout-back-btn" onClick={() => setStep(step - 1)}>Back</button>}
            <button type="button" className="checkout-next-btn" disabled={loading} onClick={() => {
              if (step === 1) {
                const validationError = validateAddress();
                if (validationError) {
                  setError(validationError);
                  return;
                }
              }
              setError('');
              if (step < 2) {
                setStep(step + 1);
              } else {
                handlePayment();
              }
            }}>
              {loading ? 'Processing...' : step === 1 ? 'Continue' : <><Icon name="lock" /> Place Order · ₹{finalAmount}</>}
            </button>
          </div>
        </form>

        <aside className="checkout-sidebar">
          <div className="order-summary">
            <div className="order-summary-header"><h3><Icon name="receipt" /> Price Summary</h3></div>
            <div className="order-summary-body">
              {cart.map(item => <div key={item.id} className="order-summary-item">
                <ImageWithFallback src={item.image} alt={item.name} className="order-summary-thumb" />
                <div className="order-summary-item-info">
                  <span className="order-summary-item-name">{item.name}</span>
                  <span className="order-summary-item-qty">Qty: {item.quantity}</span>
                </div>
                <strong className="order-summary-item-price">₹{item.price * item.quantity}</strong>
              </div>)}
              <div className="order-summary-divider" />
              <div className="order-summary-row"><span>Total MRP</span><span>₹{totalMRP}</span></div>
              {itemDiscount > 0 && <div className="order-summary-row discount"><span>Product Discount</span><span className="text-green-600">-₹{itemDiscount}</span></div>}
              {couponDiscount > 0 && <div className="order-summary-row discount"><span>Coupon Discount</span><span className="text-green-600">-₹{couponDiscount}</span></div>}
              <div className="order-summary-row"><span>Delivery Charges</span><span className="text-green-600">{deliveryCharges === 0 ? 'Free' : `₹${deliveryCharges}`}</span></div>
              {platformFee > 0 && <div className="order-summary-row"><span>Platform Fee</span><span>₹{platformFee}</span></div>}
              {gstTax > 0 && <div className="order-summary-row"><span>GST</span><span>₹{gstTax}</span></div>}
              <div className="order-summary-divider" />
              <div className="order-summary-total">
                <span>Grand Total</span>
                <strong>₹{finalAmount}</strong>
              </div>
              {(itemDiscount + couponDiscount) > 0 && (
                <div className="order-summary-savings">
                  <Icon name="tags" /> You save ₹{itemDiscount + couponDiscount}
                </div>
              )}
              <div className="order-summary-security">
                <Icon name="lock" />
                <span>Secure payment powered by Razorpay.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>;
}