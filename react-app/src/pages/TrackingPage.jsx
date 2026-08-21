import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function TrackingPage() {
  const { orders } = useStore();
  const [params] = useSearchParams();
  const [id, setId] = useState(params.get('order') || '');
  const order = orders.find(x => x.id === id.toUpperCase());
  return (
    <section className="tracking-page">
      <div className="tracking-header">
        <span className="section-tag">Order Status</span>
        <h1>Track Your Order</h1>
        <p>Real-time updates on your delivery status</p>
      </div>
      <div className="tracking-search">
        <input value={id} onChange={e => setId(e.target.value)} placeholder="Enter Order ID" />
        <button onClick={() => setId(id.toUpperCase())}>Track</button>
      </div>
      {id && (order
        ? <div className="tracking-result"><h3>Order #{order.id}</h3><p>Status: <strong>{order.status}</strong></p><p>Order total: ₹{order.total}</p></div>
        : <div className="tracking-error"><h3>Order Not Found</h3><p>Please check the order ID and try again.</p></div>)}
    </section>
  );
}
