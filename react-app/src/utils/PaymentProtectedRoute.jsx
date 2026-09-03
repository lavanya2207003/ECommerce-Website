import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useEffect, useState } from 'react';
import { customerAPI } from '../services/api';

export default function PaymentProtectedRoute({ children }) {
  const location = useLocation();
  const { cart, user } = useStore();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const hasValidCart = cart && cart.length > 0;
  const hasUser = user && user.id;

  useEffect(() => {
    const verifyAuth = async () => {
      if (!hasUser || !localStorage.getItem('userToken')) {
        setIsAuthenticated(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await customerAPI.getProfile();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [user, hasUser]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasValidCart) {
    return <Navigate to="/cart" replace state={{ from: location }} />;
  }

  return children;
}