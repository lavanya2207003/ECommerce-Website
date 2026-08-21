import React, { createContext, useContext, useReducer, useEffect } from 'react';

const WishlistContext = createContext();

function wishlistReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      if (state.some(id => id === action.payload)) {
        return state;
      }
      return [...state, action.payload];
    }
    case 'REMOVE_FROM_WISHLIST': {
      return state.filter(id => id !== action.payload);
    }
    case 'LOAD_WISHLIST': {
      return action.payload || [];
    }
    default:
      return state;
  }
}

function WishlistProvider({ children }) {
  const [wishlist, dispatch] = useReducer(wishlistReducer, []);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        dispatch({ type: 'LOAD_WISHLIST', payload: parsedWishlist });
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
        localStorage.removeItem('wishlist');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (productId) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: productId });
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist,
      addToWishlist,
      removeFromWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export { WishlistProvider, useWishlist };