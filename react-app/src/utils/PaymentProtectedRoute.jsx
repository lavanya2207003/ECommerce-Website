import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useEffect, useState } from 'react';
import { customerAPI } from '../services/api';

export default function PaymentProtectedRoute({ children }) {
  const location = useLocation();
  const { token } = useStore();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      setAuthError(null);

      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const profileRes = await customerAPI.getProfile();
        const cartRes = await customerAPI.getCart();
        const cartData = cartRes?.data?.data || cartRes?.data || [];
        if (!Array.isArray(cartData) || cartData.length === 0) {
          setCheckingAuth(false);
          return;
        }
      } catch (err) {
        setAuthError(err?.message || 'Verification failed');
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [token]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!token || authError) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}