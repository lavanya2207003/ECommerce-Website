import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Icon from '../components/Icon';
import ImageWithFallback from '../components/ImageWithFallback';

export default function OrdersPage() {
  const { orders } = useStore();
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const result = filter === 'all' ? orders : orders.filter(x => x.status === filter);

  const formatDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium' }); } catch { return ''; }
  };

  return (
    <section className="orders-page">
      <div className="orders-hero"><span className="section-tag">Order History</span><h1>My Orders</h1></div>
      <div className="orders-container">
        <div className="orders-tabs">
          {['all', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(x =>
            <button className={`orders-tab ${filter === x ? 'active' : ''}`} onClick={() => setFilter(x)} key={x}>{x === 'all' ? 'All Orders' : x}</button>
          )}
        </div>
        {result.length ? result.map(o => {
          const isExpanded = expandedOrder === o.id;
          const addr = o.delivery_address || o.address || {};
          const breakdown = o.price_breakdown;
          return (
            <div className="order-card" key={o.id}>
              <div className="order-card-top"><strong>Order #{o.id}</strong><span className={`tracking-status-badge ${o.status}`}>{o.status}</span></div>
              <p>{o.items.length} item(s) · ₹{o.total}{o.date ? ` · ${formatDate(o.date)}` : ''}</p>
              {o.paymentMethod && <p className="order-payment-method"><Icon name="credit-card" /> {o.paymentMethod}</p>}
              <button className="order-expand-btn" onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                {isExpanded ? 'Hide Details' : 'View Details'} <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} />
              </button>
              {isExpanded && <div className="order-details-expanded">
                {o.items.length > 0 && <div className="order-detail-section">
                  <h4><Icon name="bag-shopping" /> Products</h4>
                  {o.items.map((item, idx) => <div key={idx} className="order-detail-product">
                    {item.image && <ImageWithFallback src={item.image} alt={item.name} className="order-detail-thumb" />}
                    <div className="order-detail-product-info">
                      <strong>{item.name}</strong>
                      <span>Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}{item.color ? ` · Color: ${item.color}` : ''}</span>
                    </div>
                    <span className="order-detail-price">₹{item.price * item.quantity}</span>
                  </div>)}
                </div>}
                {addr && (addr.full_name || addr.name || addr.house_flat || addr.line || addr.city) && <div className="order-detail-section">
                  <h4><Icon name="location-dot" /> Delivery Address</h4>
                  <div className="order-detail-address">
                    <p><strong>{addr.full_name || addr.name}</strong></p>
                    <p>{addr.house_flat || addr.line || addr.address}{addr.street ? `, ${addr.street}` : ''}{addr.area ? `, ${addr.area}` : ''}</p>
                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                    {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                    {addr.phone && <p>Phone: {addr.phone}</p>}
                  </div>
                </div>}
                {breakdown && <div className="order-detail-section">
                  <h4><Icon name="dollar-sign" /> Price Breakdown</h4>
                  <div className="order-detail-pricing">
                    <div className="order-detail-price-row"><span>MRP</span><span>₹{breakdown.total_mrp}</span></div>
                    {breakdown.discount > 0 && <div className="order-detail-price-row"><span>Discount</span><span className="text-green-600">-₹{breakdown.discount}</span></div>}
                    {breakdown.coupon_discount > 0 && <div className="order-detail-price-row"><span>Coupon ({breakdown.coupon_code})</span><span className="text-green-600">-₹{breakdown.coupon_discount}</span></div>}
                    <div className="order-detail-price-row"><span>Delivery</span><span>{breakdown.delivery_charges === 0 ? 'Free' : `₹${breakdown.delivery_charges}`}</span></div>
                    {breakdown.gst_tax > 0 && <div className="order-detail-price-row"><span>GST</span><span>₹{breakdown.gst_tax}</span></div>}
                    <div className="order-detail-price-row total"><span>Total</span><strong>₹{breakdown.final_amount}</strong></div>
                  </div>
                </div>}
                {o.delivery_info && <div className="order-detail-section">
                  <h4><Icon name="truck" /> Delivery Info</h4>
                  <p>Expected: {o.delivery_info.expected_date} · {o.delivery_info.estimated_time}</p>
                </div>}
                {o.order_notes && <div className="order-detail-section">
                  <h4><Icon name="note-sticky" /> Order Notes</h4>
                  <p className="order-detail-notes">{o.order_notes}</p>
                </div>}
                {o.paymentId && <div className="order-detail-section">
                  <h4><Icon name="receipt" /> Payment Info</h4>
                  <p>Payment ID: {o.paymentId}</p>
                  {o.coupon && <p>Coupon: {o.coupon.code}</p>}
                </div>}
              </div>}
              <Link to={`/tracking?order=${o.id}`}>Track order</Link>
            </div>
          );
        }) : <div className="react-empty"><h3>No orders found</h3><Link to="/shop">Start Shopping</Link></div>}
      </div>
    </section>
  );
}
