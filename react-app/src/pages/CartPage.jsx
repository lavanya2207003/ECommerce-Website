import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function CartPage() {
  const { cart, removeFromCart, changeQuantity, clearCart } = useStore();
  const navigate = useNavigate();
  const total = cart.reduce((s, x) => s + x.price * x.quantity, 0);
  return (
    <div className="cart-container">
      <div className="cart-title"><h2>Shopping Cart</h2></div>
      {cart.length ? (
        <>
          {cart.map(item => (
            <div className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div><h3>{item.name}</h3><p>₹{item.price}</p></div>
              <div><button onClick={() => changeQuantity(item.id, item.quantity - 1)}>-</button> {item.quantity} <button onClick={() => changeQuantity(item.id, item.quantity + 1)}>+</button></div>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          <div className="cart-footer"><span className="total-label">Total:</span><span className="total-amount">₹{total}</span></div>
          <div className="cart-actions">
            <Link className="continue-shopping" to="/shop">Continue Shopping</Link>
            <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
            <button className="checkout-btn" onClick={() => navigate('/payment')}>Proceed to Payment</button>
          </div>
        </>
      ) : <div className="react-empty"><h3>Your cart is empty</h3><Link className="empty-shop-btn" to="/shop">Start Shopping</Link></div>}
    </div>
  );
}
