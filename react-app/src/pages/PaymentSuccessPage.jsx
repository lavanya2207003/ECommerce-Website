import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    orderId,
    amount,
    paymentId,
    orderItems,
    razorpayOrderId,
    signature,
    paymentMethod,
    paymentStatus,
    transactionDate,
    delivery_address,
    price_breakdown,
    delivery_info,
    order_notes,
    coupon,
    address,
  } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    try {
      return new Date(iso).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const deliveryAddr = delivery_address || address;

  return (
    <section className="checkout-success-page">
      <div className="checkout-success-container checkout-success-wide">
        <div className="checkout-success-icon">
          <i className="fa-solid fa-circle-check" />
        </div>
        <h1>Payment Successful!</h1>
        <p className="checkout-success-message">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        <div className="checkout-success-details">
          <div className="checkout-success-detail-row">
            <span>Order ID</span>
            <strong>{orderId}</strong>
          </div>
          {razorpayOrderId && (
            <div className="checkout-success-detail-row">
              <span>Razorpay Order ID</span>
              <strong>{razorpayOrderId}</strong>
            </div>
          )}
          {paymentId && (
            <div className="checkout-success-detail-row">
              <span>Payment ID</span>
              <strong>{paymentId}</strong>
            </div>
          )}
          {amount && (
            <div className="checkout-success-detail-row">
              <span>Amount Paid</span>
              <strong>₹{amount}</strong>
            </div>
          )}
          {paymentStatus && (
            <div className="checkout-success-detail-row">
              <span>Payment Status</span>
              <strong className="text-green-600">{paymentStatus}</strong>
            </div>
          )}
          {paymentMethod && (
            <div className="checkout-success-detail-row">
              <span>Payment Method</span>
              <strong>{paymentMethod}</strong>
            </div>
          )}
          {transactionDate && (
            <div className="checkout-success-detail-row">
              <span>Date &amp; Time</span>
              <strong>{formatDate(transactionDate)}</strong>
            </div>
          )}
        </div>

        {deliveryAddr && (
          <div className="success-section">
            <h3><i className="fa-solid fa-location-dot" /> Delivery Address</h3>
            <div className="success-address-card">
              <p><strong>{deliveryAddr.full_name || deliveryAddr.name}</strong></p>
              <p>{deliveryAddr.house_flat || deliveryAddr.line || deliveryAddr.address}{deliveryAddr.street ? `, ${deliveryAddr.street}` : ''}{deliveryAddr.area ? `, ${deliveryAddr.area}` : ''}</p>
              <p>{deliveryAddr.city}{deliveryAddr.district ? `, ${deliveryAddr.district}` : ''}, {deliveryAddr.state} - {deliveryAddr.pincode}</p>
              {deliveryAddr.landmark && <p>Landmark: {deliveryAddr.landmark}</p>}
              <p>{deliveryAddr.phone || address?.phone}</p>
            </div>
          </div>
        )}

        {orderItems && orderItems.length > 0 && (
          <div className="success-section">
            <h3><i className="fa-solid fa-bag-shopping" /> Ordered Products</h3>
            <div className="checkout-success-order-items">
              {orderItems.map((item) => (
                <div key={item.id || item.product_id} className="checkout-success-order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-success-order-info">
                    <h4>{item.name}</h4>
                    <p>
                      Qty: {item.quantity}
                      {item.size && ` · Size: ${item.size}`}
                      {item.color && ` · Color: ${item.color}`}
                    </p>
                  </div>
                  <span className="checkout-success-order-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {price_breakdown && (
          <div className="success-section">
            <h3><i className="fa-solid fa-indian-rupee-sign" /> Price Details</h3>
            <div className="success-price-breakdown">
              <div className="success-price-row"><span>Total MRP</span><span>₹{price_breakdown.total_mrp}</span></div>
              {price_breakdown.discount > 0 && <div className="success-price-row"><span>Discount</span><span className="text-green-600">-₹{price_breakdown.discount}</span></div>}
              {price_breakdown.coupon_discount > 0 && <div className="success-price-row"><span>Coupon ({price_breakdown.coupon_code})</span><span className="text-green-600">-₹{price_breakdown.coupon_discount}</span></div>}
              <div className="success-price-row"><span>Delivery</span><span>{price_breakdown.delivery_charges === 0 ? 'Free' : `₹${price_breakdown.delivery_charges}`}</span></div>
              {price_breakdown.gst_tax > 0 && <div className="success-price-row"><span>GST</span><span>₹{price_breakdown.gst_tax}</span></div>}
              <div className="success-price-divider" />
              <div className="success-price-row total"><span>Total Paid</span><strong>₹{price_breakdown.final_amount}</strong></div>
            </div>
          </div>
        )}

        {delivery_info && (
          <div className="success-section">
            <h3><i className="fa-solid fa-truck" /> Delivery Information</h3>
            <div className="success-delivery-info">
              <p><strong>Expected Delivery:</strong> {delivery_info.expected_date}</p>
              <p><strong>Shipping:</strong> {delivery_info.shipping_method}</p>
              <p><strong>Estimated Time:</strong> {delivery_info.estimated_time}</p>
            </div>
          </div>
        )}

        {coupon && (
          <div className="success-section">
            <h3><i className="fa-solid fa-tag" /> Coupon Applied</h3>
            <div className="success-coupon-badge">
              <span>{coupon.code}</span> — {coupon.description} (₹{coupon.discount || 0} off)
            </div>
          </div>
        )}

        {order_notes && (
          <div className="success-section">
            <h3><i className="fa-solid fa-note-sticky" /> Order Notes</h3>
            <p className="success-order-notes">{order_notes}</p>
          </div>
        )}

        {signature && (
          <div className="checkout-success-details" style={{ marginTop: '12px' }}>
            <div className="checkout-success-detail-row checkout-success-signature">
              <span>Signature</span>
              <strong>{signature}</strong>
            </div>
          </div>
        )}

        <div className="checkout-success-actions">
          <Link to="/orders" className="checkout-success-btn">
            View My Orders
          </Link>
          <Link to="/" className="checkout-success-link">
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
