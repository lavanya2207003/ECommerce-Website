import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from './Logo';

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  if (!visible) return null;
  return <button className="back-to-top" onClick={scrollToTop} aria-label="Back to top"><i className="fa-solid fa-chevron-up" /></button>;
}

const SOCIALS = [
  ['fa-brands fa-instagram', 'https://instagram.com'],
  ['fa-brands fa-facebook-f', 'https://facebook.com'],
  ['fa-brands fa-twitter', 'https://twitter.com'],
  ['fa-brands fa-pinterest-p', 'https://pinterest.com'],
  ['fa-brands fa-youtube', 'https://youtube.com'],
];

const PAYMENT_ICONS = ['fa-brands fa-cc-visa', 'fa-brands fa-cc-mastercard', 'fa-brands fa-cc-amex', 'fa-brands fa-cc-paypal', 'fa-brands fa-google-pay', 'fa-brands fa-apple-pay'];

export default function Footer() {
  return <>
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <Logo size="footer" link="/" />
          <p>Discover the latest fashion trends, accessories, and ethnic wear. Premium fashion curated for every occasion.</p>
          <div className="footer-social">
            {SOCIALS.map(([icon, url]) => <a key={icon} href={url} target="_blank" rel="noopener noreferrer" aria-label={icon} className="footer-social-icon"><i className={icon} /></a>)}
          </div>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            {[['/','Home'],['/shop','Shop'],['/new','New Arrivals'],['/best-sellers','Best Sellers'],['/about','About Us'],['/contact','Contact']].map(([to,label]) => <li key={to}><Link to={to}>{label}</Link></li>)}
          </ul>
        </div>
        <div className="footer-section">
          <h3>Categories</h3>
          <ul>
            {[['/womens-dress',"Women's Fashion"],['/accessories','Accessories'],['/ethnic-wear','Ethnic Wear'],['/hand-bag','Bags']].map(([to,label]) => <li key={to}><Link to={to}>{label}</Link></li>)}
          </ul>
        </div>
        <div className="footer-section">
          <h3>Customer Service</h3>
          <ul>
            <li><Link to="/contact">Help & FAQs</Link></li>
            <li><Link to="/tracking">Track Your Order</Link></li>
            <li><Link to="/contact">Shipping Policy</Link></li>
            <li><Link to="/contact">Returns & Exchanges</Link></li>
            <li><Link to="/contact">Privacy Policy</Link></li>
          </ul>
          <Link to="/admin/login" className="footer-admin-btn">
            <i className="fa-solid fa-lock" /> Admin Login
          </Link>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p><i className="fa-solid fa-location-dot" /> Vellore, India</p>
          <p><i className="fa-solid fa-phone" /> +91 9487303753</p>
          <p><i className="fa-solid fa-envelope" /> support@layastore.com</p>
          <p className="footer-timing"><i className="fa-solid fa-clock" /> Mon-Sat: 9AM - 9PM</p>
        </div>
      </div>
      <div className="footer-payments">
        {PAYMENT_ICONS.map(icon => <i key={icon} className={icon} />)}
      </div>
      <div className="footer-bottom">
        <p>© 2026 LAYASTORE. All Rights Reserved.</p>
      </div>
    </footer>
    <BackToTop />
  </>;
}
