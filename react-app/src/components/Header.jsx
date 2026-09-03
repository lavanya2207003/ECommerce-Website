import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import Logo from './Logo';
import Icon from './Icon';

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const { cart, wishlist } = useStore();
  const count = cart.reduce((s, x) => s + x.quantity, 0);
  const wishlistCount = new Set(wishlist).size;

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const updateOffset = () => {
      document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight}px`);
    };
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const openSearch = () => {
    setOpen(false);
    navigate('/shop?focusSearch=true');
  };

  const navLinks = [
    ['/', 'HOME'],
    ['/shop', 'SHOP'],
    ['/new', 'NEW ARRIVALS'],
    ['/best-sellers', 'BEST SELLERS'],
    ['/about', 'ABOUT US'],
    ['/contact', 'CONTACT'],
    ['/tracking', 'TRACK ORDER'],
    ['/orders', 'MY ORDERS'],
  ];

  return (
    <header ref={headerRef} className="header-sticky">
      <div className="top-bar">
        <p>Get free delivery on purchases exceeding ₹1000</p>
      </div>
      <nav className="navbar">
        <Logo size="header" link="/" onClick={() => setOpen(false)} />

        {/* Desktop menu */}
        <ul className="menu">
          {navLinks.map(([to, label]) => (
            <li key={to}>
              <NavLink to={to}>{label}</NavLink>
            </li>
          ))}
        </ul>

        <div className="icons">
          <button className="icon-btn" onClick={openSearch} aria-label="Search" title="Search">
            <Icon name="magnifying-glass" />
          </button>
          <Link to="/login"><Icon name="user" /></Link>
          <Link to="/wishlist" className="cart-icon-wrapper">
            <Icon name="heart" />
            {wishlistCount > 0 && <span>{wishlistCount}</span>}
          </Link>
          <Link to="/cart" className="cart-icon-wrapper">
            <Icon name="cart-shopping" />
            {count > 0 && <span className="cart-count-badge">{count}</span>}
          </Link>
          <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            <Icon name={open ? 'xmark' : 'bars'} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {open && <div className="mobile-menu-overlay" onClick={() => setOpen(false)} />}

      {/* Mobile menu */}
      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <Logo size="header" link="/" onClick={() => setOpen(false)} />
          <button onClick={() => setOpen(false)} aria-label="Close menu">
            <Icon name="xmark" />
          </button>
        </div>
        <ul className="mobile-menu-links">
          {navLinks.map(([to, label]) => (
            <li key={to}>
              <NavLink to={to} onClick={() => setOpen(false)}>{label}</NavLink>
            </li>
          ))}
        </ul>
        <div className="mobile-menu-footer">
          <button className="mobile-search-btn" onClick={openSearch}>
            <Icon name="magnifying-glass" /> Search Products
          </button>
          <Link to="/login" className="mobile-account-btn" onClick={() => setOpen(false)}>
            <Icon name="user" /> My Account
          </Link>
        </div>
      </div>
    </header>
  );
}
