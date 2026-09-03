import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useEffect, useState } from 'react';
import { customerAPI } from '../services/api';

export default function PaymentProtectedRoute({ children }) {
  const location = useLocation();
  const { cart, token } = useStore();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const verifyAuth = async () => {
      if (!token) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setCheckingAuth(false);
        }
        return;
      }
      try {
        await customerAPI.getProfile();
        if (!cancelled) setIsAuthenticated(true);
      } catch {
        if (!cancelled) setIsAuthenticated(false);
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    };
    verifyAuth();
    return () => { cancelled = true; };
  }, [token]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!cart || cart.length === 0) {
    return <Navigate to="/cart" replace state={{ from: location }} />;
  }

  return children;
}
