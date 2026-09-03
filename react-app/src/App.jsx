import { Route, Routes, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { StoreProvider } from './context/StoreContext';
import { ProductProvider } from './context/ProductContext';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import ProtectedRoute from './admin/utils/ProtectedRoute';
import PaymentProtectedRoute from './utils/PaymentProtectedRoute';
import AdminLayout from './admin/layouts/AdminLayout';
import LoginPage from './admin/pages/LoginPage';
import Dashboard from './admin/pages/Dashboard';
import Products from './admin/pages/Products';
import Inventory from './admin/pages/Inventory';
import Orders from './admin/pages/Orders';
import Customers from './admin/pages/Customers';
import Categories from './admin/pages/Categories';
import Sales from './admin/pages/Sales';
import Payments from './admin/pages/Payments';
import Reports from './admin/pages/Reports';
import Analytics from './admin/pages/Analytics';
import ProductHistory from './admin/pages/ProductHistory';
import Settings from './admin/pages/Settings';
import Profile from './admin/pages/Profile';
import HomePage from './pages/HomePage';
import { CategoryPage, CuratedPage, ShopPage } from './pages/CatalogPages';
import CartPage from './pages/CartPage';
import LoginPageUser from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import PaymentPage from './pages/PaymentPage';
import TrackingPage from './pages/TrackingPage';
import WishlistPage from './pages/WishlistPage';
import { AboutPage, ContactPage, NotFoundPage } from './pages/InfoPages';
import OrderSuccessPage from './pages/OrderSuccessPage';
import SearchPage from './pages/SearchPage';
import ProductDetailPage from './pages/ProductDetailPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const el = document.querySelector('.customer-layout');
    if (el) el.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function AdminShortcut() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/admin/login');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
  return null;
}

function CustomerLayout({ children }) {
  return (
    <div className="customer-layout">
      <Header />
      <main className="app-main">
        <ScrollToTop />
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AdminDashboardLayout() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ProductProvider>
        <AdminAuthProvider>
          <AdminShortcut />
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="orders" element={<Orders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="customers" element={<Customers />} />
              <Route path="categories" element={<Categories />} />
              <Route path="sales" element={<Sales />} />
              <Route path="reports" element={<Reports />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="product-history" element={<ProductHistory />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={
              <CustomerLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/new" element={<CuratedPage type="new" />} />
                  <Route path="/new-arrivals" element={<CuratedPage type="new" />} />
                  <Route path="/best-sellers" element={<CuratedPage type="best" />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/login" element={<LoginPageUser />} />
                  <Route path="/payment" element={<PaymentProtectedRoute><PaymentPage /></PaymentProtectedRoute>} />
                  <Route path="/payment-success" element={<OrderSuccessPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/tracking" element={<TrackingPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/:category" element={<CategoryPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </CustomerLayout>
            } />
          </Routes>
        </AdminAuthProvider>
      </ProductProvider>
    </StoreProvider>
  );
}
