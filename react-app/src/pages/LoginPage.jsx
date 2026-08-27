import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('username');
    const password = form.get('password');

    try {
      const res = await fetch(`${API_BASE}/api/customer/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed.');
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.customer));
      if (data.token) localStorage.setItem('userToken', data.token);
      navigate('/');
    } catch (err) {
      setError('Unable to connect. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <form className="login-box" onSubmit={submit}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Logo size="auth" link="/" />
        </div>
        <h2>Login</h2>
        {error && (
          <div style={{ padding: '10px', marginBottom: '12px', borderRadius: '6px', background: '#fef2f2', color: '#dc2626', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <input name="username" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
