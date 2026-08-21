import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const StoreContext = createContext();

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

const cleanUniqueIds = arr =>
  Array.isArray(arr)
    ? [...new Set(arr.map(String).map(s => s.trim()).filter(Boolean))]
    : [];

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => read('shoppingCart', []));
  const [wishlist, setWishlist] = useState(() => cleanUniqueIds(read('layaWishlist', [])));
  const [orders, setOrders] = useState(() => read('layaOrders', []));
  const [message, setMessage] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => localStorage.setItem('shoppingCart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('layaWishlist', JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => localStorage.setItem('layaOrders', JSON.stringify(orders)), [orders]);

  const notify = text => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2500);
  };

  const addToCart = product => {
    setCart(items => {
      const item = items.find(x => x.id === product.id);
      if (item) {
        return items.map(x => x.id === product.id ? { ...x, quantity: x.quantity + (product.quantity || 1) } : x);
      }
      return [...items, { ...product, quantity: product.quantity || 1 }];
    });
    notify(`${product.name} added to cart`);
  };

  const value = useMemo(() => ({
    cart,
    wishlist,
    orders,
    addToCart,
    removeFromCart: id => setCart(x => x.filter(i => i.id !== id)),
    changeQuantity: (id, quantity) => setCart(x => quantity < 1 ? x.filter(i => i.id !== id) : x.map(i => i.id === id ? { ...i, quantity } : i)),
    clearCart: () => setCart([]),
    toggleWishlist: id => setWishlist(x => {
      const idStr = String(id).trim();
      if (!idStr) return x;
      return x.includes(idStr) ? x.filter(i => i !== idStr) : [...x, idStr];
    }),
    pruneWishlist: ids => setWishlist(x => {
      const valid = new Set(ids.map(String));
      const kept = x.filter(i => valid.has(i));
      return kept.length === x.length ? x : kept;
    }),
    placeOrder: order => setOrders(x => [order, ...x]),
    notify,
    quickViewProduct,
    openQuickView: setQuickViewProduct,
    closeQuickView: () => setQuickViewProduct(null),
  }), [cart, wishlist, orders, quickViewProduct]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      {message && <div className="toast">{message}</div>}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
