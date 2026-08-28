import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.name === action.payload.name);
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.name === action.payload.name
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        return { ...state, items: updatedItems, total, itemCount };
      }
      const newItems = [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }];
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return { ...state, items: newItems, total, itemCount };
    }
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.name !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return { ...state, items: newItems, total, itemCount };
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.name === action.payload.name
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      if (action.payload.quantity < 1) return state;
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return { ...state, items: newItems, total, itemCount };
    }
    case 'CLEAR_CART': {
      return initialState;
    }
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.length > 0) {
          dispatch({ type: 'ADD_TO_CART', payload: parsedCart[0] });
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (name) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: name });
  };

  const updateQuantity = (name, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { name, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ 
      cart: state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartProvider, useCart };