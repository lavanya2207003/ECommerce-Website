import { Link } from 'react-router-dom';
import { useState } from 'react';
import Icon, { BrandIcon } from '../components/Icon';
import ImageWithFallback from '../components/ImageWithFallback';

export function AboutPage() {
  const values = [
    { icon: 'gem', title: 'Premium Quality', desc: 'Fine craftsmanship and hand-selected fabrics ensure every piece meets our exacting standards.' },
    { icon: 'leaf', title: 'Sustainable Fashion', desc: 'Thoughtful sourcing and timeless designs that respect people and the planet.' },
    { icon: 'headset', title: 'Customer First', desc: 'Fast shipping, easy returns, and 24/7 dedicated support for a seamless experience.' },
    { icon: 'heart', title: 'Inclusive Style', desc: 'Fashion curated for every personality, body type, and occasion.' },
  ];
  const stats = [
    ['10,000+', 'Happy Customers'],
    ['500+', 'Curated Styles'],
    ['99%', 'Positive Feedback'],
    ['Pan-India', 'Fast Delivery'],
  ];
  const promises = [
    { icon: 'shield-halved', title: 'Quality Checks', desc: 'Every product undergoes multi-point quality inspection before it reaches your doorstep.' },
    { icon: 'lock', title: 'Secure Checkout', desc: 'Industry-standard encryption keeps your payments and personal data safe.' },
    { icon: 'rotate-left', title: 'Hassle-Free Returns', desc: 'Changed your mind? Enjoy easy 30-day returns and instant refunds.' },
    { icon: 'truck-fast', title: 'Express Delivery', desc: 'Free shipping on orders over ₹1000 with express options available.' },
  ];
  return <>
    <section className="about-hero">
      <div className="about-hero-content">
        <span className="section-tag">Our Story</span>
        <h1>Redefining Fashion,<br />Empowering Confidence</h1>
        <p>Where style meets substance — bringing curated, premium fashion directly to modern wardrobes.</p>
      </div>
    </section>

    <section className="about-journey">
      <div className="about-journey-inner">
        <div className="about-journey-text">
          <span className="section-tag">Our Journey</span>
          <h2>Born From a Passion for Elegance</h2>
          <p>LayaStore started with a simple belief: fashion should feel effortless yet extraordinary. What began as a small idea — a love for quality fabrics and modern trends — has grown into a trusted destination for thousands of style-conscious shoppers.</p>
          <p>We curate collections that blend timeless elegance with contemporary flair, making it easy for you to express your unique style with confidence.</p>
        </div>
        <div className="about-journey-image">
          <ImageWithFallback src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop" alt="LayaStore journey" width="600" height="400" />
        </div>
      </div>
    </section>

    <section className="about-values">
      <div className="about-values-inner">
        <div className="section-header">
          <span className="section-tag">Values</span>
          <h2>What We Stand For</h2>
          <p>Our core values drive every decision we make — from sourcing fabrics to delivering your order.</p>
        </div>
        <div className="about-values-grid">
          {values.map((v, i) => <div className="about-value-card" key={i}>
            <div className="about-value-icon"><Icon name={v.icon} /></div>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>)}
        </div>
      </div>
    </section>

    <section className="about-stats">
      <div className="about-stats-inner">
        {stats.map(([num, label], i) => <div className="about-stat" key={i}>
          <strong>{num}</strong>
          <span>{label}</span>
        </div>)}
      </div>
    </section>

    <section className="about-promise">
      <div className="about-promise-inner">
        <div className="section-header">
          <span className="section-tag">Our Promise</span>
          <h2>Why Choose LayaStore</h2>
          <p>We go the extra mile to make every shopping experience exceptional.</p>
        </div>
        <div className="about-promise-grid">
          {promises.map((p, i) => <div className="about-promise-card" key={i}>
            <div className="about-promise-icon"><Icon name={p.icon} /></div>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>)}
        </div>
      </div>
    </section>

    <section className="about-cta">
      <div className="about-cta-inner">
        <h2>Ready to Explore?</h2>
        <p>Discover our latest collections and find your next favourite piece.</p>
        <Link to="/new-arrivals" className="about-cta-btn">Shop New Arrivals <Icon name="arrow-right" /></Link>
      </div>
    </section>
  </>;
}

const SUPPORT_CATEGORIES = [
  { icon: 'bag-shopping', title: 'Order Support', desc: 'Track, modify, or get help with an existing order.', color: '#7C3AED' },
  { icon: 'rotate-left', title: 'Returns & Refunds', desc: 'Initiate a return or check refund status.', color: '#EC4899' },
  { icon: 'truck-fast', title: 'Shipping Info', desc: 'Delivery timelines, shipping partners & policies.', color: '#A855F7' },
  { icon: 'credit-card', title: 'Payment Assistance', desc: 'Payment failures, EMI options & gateway issues.', color: '#F59E0B' },
  { icon: 'ruler-combined', title: 'Size & Fit Help', desc: 'Size guides, measurements & fit recommendations.', color: '#22C55E' },
  { icon: 'wrench', title: 'Technical Support', desc: 'App issues, account problems & website bugs.', color: '#3B82F6' },
  { icon: 'briefcase', title: 'Business Enquiries', desc: 'Partnerships, bulk orders & wholesale.', color: '#8B5CF6' },
];

const SUPPORT_FAQ = [
  { q: 'How do I track my order?', a: 'Navigate to My Orders in your account dashboard. Click on any active order to see real-time tracking with estimated delivery dates and carrier details.' },
  { q: 'How do I cancel or modify an order?', a: 'You can cancel or modify your order within 2 hours of placement. Go to My Orders, select the order, and tap "Modify" or "Cancel". After processing begins, contact support for urgent changes.' },
  { q: 'How do I request an exchange?', a: 'Go to My Orders, select the delivered item, and tap "Request Exchange". Choose your preferred replacement size or colour. Exchanges are free within 15 days of delivery.' },
  { q: 'What are the delivery timelines?', a: 'Metro cities: 3-5 business days. Tier 2 cities: 5-7 business days. Remote areas: 7-10 business days. Express delivery (2-3 days) is available at checkout for ₹99 extra.' },
  { q: 'My payment was deducted but the order failed. What now?', a: 'Failed payments are auto-refunded within 24-48 hours to the original payment method. If you don\'t see the refund after 5 business days, contact us with your transaction ID.' },
  { q: 'What is the return policy?', a: 'You can return most items within 30 days of delivery. Items must be unworn, unwashed, with original tags. Initiate a return from My Orders. Refunds are processed within 3-5 business days after pickup.' },
  { q: 'How do I apply a promo code?', a: 'At checkout, tap "Have a promo code?" and enter your code. The discount is applied instantly to your order total. Only one code can be used per order.' },
];

const QUICK_HELP = [
  { icon: 'location-crosshairs', label: 'Track Order', path: '/tracking' },
  { icon: 'box-open', label: 'My Orders', path: '/orders' },
  { icon: 'truck', label: 'Shipping Policy', path: '/shipping-policy' },
  { icon: 'rotate-left', label: 'Return Policy', path: '/return-policy' },
  { icon: 'shield-halved', label: 'Privacy Policy', path: '/privacy-policy' },
];

function SupportHero() {
  return (
    <section className="csh-hero">
      <div className="csh-hero-inner">
        <span className="section-tag">Customer Support</span>
        <h1>We're Here to Help You</h1>
        <p>Whether it's an order issue, a return request, or a sizing question — our support team has you covered.</p>
        <div className="csh-hero-status">
          <span className="csh-status-dot" />
          <span>Support Team Online</span>
        </div>
      </div>
    </section>
  );
}

function SupportCenter() {
  const [active, setActive] = useState(null);
  return (
    <section className="csh-support-section">
      <div className="csh-support-inner">
        <div className="section-header">
          <span className="section-tag">Support Center</span>
          <h2>How Can We Help?</h2>
          <p>Select a category below to get started.</p>
        </div>
        <div className="csh-support-grid">
          {SUPPORT_CATEGORIES.map((c, i) => (
            <button
              className={`csh-support-card ${active === i ? 'active' : ''}`}
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              type="button"
            >
              <div className="csh-support-icon" style={{ background: `${c.color}12`, color: c.color }}>
                <Icon name={c.icon} />
              </div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              {active === i && (
                <div className="csh-support-expanded">
                  <p>Our team is ready to assist you with <strong>{c.title.toLowerCase()}</strong>. Use the contact form below or reach us directly.</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveSupportSection() {
  return (
    <section className="csh-live-section">
      <div className="csh-live-inner">
        <div className="csh-live-left">
          <span className="section-tag">Live Support</span>
          <h2>Get Instant Help</h2>
          <p>Our support team is standing by to assist you in real time.</p>
        </div>
        <div className="csh-live-right">
          <div className="csh-live-card">
            <div className="csh-live-item">
              <div className="csh-live-icon"><Icon name="comments" /></div>
              <div>
                <strong>Live Chat</strong>
                <span>Available now — avg. wait 30 seconds</span>
              </div>
            </div>
            <div className="csh-live-item">
              <div className="csh-live-icon"><Icon name="clock" /></div>
              <div>
                <strong>Response Time</strong>
                <span>Under 1 hour during business hours</span>
              </div>
            </div>
            <div className="csh-live-item">
              <div className="csh-live-icon"><Icon name="calendar-check" /></div>
              <div>
                <strong>Customer Care Hours</strong>
                <span>Mon–Sat 9 AM – 8 PM IST</span>
              </div>
            </div>
            <div className="csh-live-item">
              <div className="csh-live-icon"><Icon name="phone-volume" /></div>
              <div>
                <strong>Preferred Contact</strong>
                <span>+91 98765 43210 or chat below</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactFormSection() {
  const [form, setForm] = useState({ name: '', email: '', category: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('loading');
    setTimeout(() => { setStatus('success'); setForm({ name: '', email: '', category: '', message: '' }); }, 1500);
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <section className="csh-form-section">
      <div className="csh-form-inner">
        <div className="csh-form-layout">
          <div className="csh-form-sidebar">
            <span className="section-tag">Send a Message</span>
            <h2>Contact Our Support Team</h2>
            <p className="csh-form-desc">Fill out the form and our team will get back to you within 1 hour during business hours.</p>
            <div className="csh-form-meta">
              <div className="csh-form-meta-item">
                <div className="csh-form-meta-icon"><Icon name="clock" /></div>
                <div>
                  <strong>Average Response</strong>
                  <span>Under 1 hour</span>
                </div>
              </div>
              <div className="csh-form-meta-item">
                <div className="csh-form-meta-icon"><Icon name="shield-halved" /></div>
                <div>
                  <strong>Secure & Private</strong>
                  <span>Your data is encrypted</span>
                </div>
              </div>
              <div className="csh-form-meta-item">
                <div className="csh-form-meta-icon"><Icon name="headset" /></div>
                <div>
                  <strong>Need Urgent Help?</strong>
                  <span>Call +91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>

          <div className="csh-form-card">
            {status === 'success' && (
              <div className="csh-form-success">
                <Icon name="circle-check" />
                <strong>Message Sent Successfully!</strong>
                <p>Our team will review your request and respond shortly.</p>
              </div>
            )}
            <form className="csh-form" onSubmit={handleSubmit} noValidate>
              <div className="csh-form-row">
                <div className={`csh-field ${form.name ? 'filled' : ''} ${errors.name ? 'error' : ''}`}>
                  <label htmlFor="csh-name">Full Name</label>
                  <input id="csh-name" type="text" placeholder="John Doe" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  {errors.name && <span className="csh-field-err">{errors.name}</span>}
                </div>
                <div className={`csh-field ${form.email ? 'filled' : ''} ${errors.email ? 'error' : ''}`}>
                  <label htmlFor="csh-email">Email Address</label>
                  <input id="csh-email" type="email" placeholder="john@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  {errors.email && <span className="csh-field-err">{errors.email}</span>}
                </div>
              </div>
              <div className={`csh-field ${form.category ? 'filled' : ''} ${errors.category ? 'error' : ''}`}>
                <label htmlFor="csh-category">Issue Category</label>
                <select id="csh-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="" disabled>Choose a category...</option>
                  {SUPPORT_CATEGORIES.map((c, i) => <option key={i} value={c.title}>{c.title}</option>)}
                </select>
                {errors.category && <span className="csh-field-err">{errors.category}</span>}
              </div>
              <div className={`csh-field ${form.message ? 'filled' : ''} ${errors.message ? 'error' : ''}`}>
                <label htmlFor="csh-message">Describe Your Issue</label>
                <textarea id="csh-message" rows="4" placeholder="Tell us how we can help..." required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                {errors.message && <span className="csh-field-err">{errors.message}</span>}
              </div>
              <button className={`csh-submit-btn ${status}`} type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? <><span className="csh-spinner" /> Sending...</> : status === 'success' ? <><Icon name="check" /> Sent!</> : <><Icon name="paper-plane" /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function MapAndStoreSection() {
  return (
    <section className="csh-map-section">
      <div className="csh-map-inner">
        <div className="csh-map-grid">
          <div className="csh-map-col">
            <span className="section-tag">Find Us</span>
            <h2>Visit Our Store</h2>
            <div className="csh-store-info">
              <div className="csh-store-row">
                <Icon name="location-dot" />
                <div>
                  <strong>Address</strong>
                  <span>123 Fashion Avenue, Vellore, Tamil Nadu 632001</span>
                </div>
              </div>
              <div className="csh-store-row">
                <Icon name="phone" />
                <div>
                  <strong>Phone</strong>
                  <span>+91 98765 43210</span>
                </div>
              </div>
              <div className="csh-store-row">
                <Icon name="envelope" />
                <div>
                  <strong>Email</strong>
                  <span>support@layastore.com</span>
                </div>
              </div>
              <div className="csh-store-row">
                <Icon name="clock" />
                <div>
                  <strong>Hours</strong>
                  <span>Mon–Fri: 9 AM – 8 PM &nbsp;|&nbsp; Sat: 10 AM – 6 PM</span>
                </div>
              </div>
            </div>
            <div className="csh-social-row">
              <a href="#" aria-label="Instagram"><BrandIcon name="instagram" /></a>
              <a href="#" aria-label="Facebook"><BrandIcon name="facebook-f" /></a>
              <a href="#" aria-label="X"><BrandIcon name="x-twitter" /></a>
              <a href="#" aria-label="Pinterest"><BrandIcon name="pinterest-p" /></a>
              <a href="#" aria-label="LinkedIn"><BrandIcon name="linkedin-in" /></a>
            </div>
          </div>
          <div className="csh-map-col csh-map-frame">
            <iframe
              title="LayaStore Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.8!2d79.13!3d12.92!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU1JzEyLjAiTiA3OcKwMDcnNDguMCJF!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`csh-faq-item ${open ? 'open' : ''}`}>
      <button className="csh-faq-q" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} />
      </button>
      <div className="csh-faq-a" style={{ maxHeight: open ? '200px' : '0' }}>
        <p>{a}</p>
      </div>
    </div>
  );
}

function FAQSection() {
  return (
    <section className="csh-faq-section">
      <div className="csh-faq-inner">
        <div className="section-header">
          <span className="section-tag">FAQ</span>
          <h2>Common Support Questions</h2>
          <p>Quick answers to the most frequently asked customer service topics.</p>
        </div>
        <div className="csh-faq-list">
          {SUPPORT_FAQ.map((f, i) => <FAQItem key={i} {...f} />)}
        </div>
      </div>
    </section>
  );
}

function QuickHelpSection() {
  return (
    <section className="csh-quick-section">
      <div className="csh-quick-inner">
        <div className="csh-quick-header">
          <h2>Need Quick Help?</h2>
          <p>Jump directly to the most popular self-service pages.</p>
        </div>
        <div className="csh-quick-grid">
          {QUICK_HELP.map((h, i) => (
            <Link key={i} to={h.path} className="csh-quick-card">
              <Icon name={h.icon} />
              <span>{h.label}</span>
              <Icon name="arrow-right" className="csh-quick-arrow" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeedbackSection() {
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const EMOJIS = [
    { emoji: '\u{1F621}', label: 'Terrible', value: 1 },
    { emoji: '\u{1F61E}', label: 'Bad', value: 2 },
    { emoji: '\u{1F610}', label: 'Okay', value: 3 },
    { emoji: '\u{1F60A}', label: 'Good', value: 4 },
    { emoji: '\u{1F929}', label: 'Amazing', value: 5 },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setRating(null); setFeedback(''); }, 3000);
  };

  return (
    <section className="csh-feedback-section">
      <div className="csh-feedback-inner">
        <div className="csh-feedback-header">
          <span className="section-tag">Your Voice Matters</span>
          <h2>Share Your Experience</h2>
          <p>Help us improve by rating your support experience.</p>
        </div>
        {submitted ? (
          <div className="csh-feedback-thanks">
            <span className="csh-feedback-thanks-emoji">{'\u{1F389}'}</span>
            <strong>Thank you for your feedback!</strong>
            <p>Your input helps us serve you better.</p>
          </div>
        ) : (
          <form className="csh-feedback-form" onSubmit={handleSubmit}>
            <div className="csh-emoji-row">
              {EMOJIS.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  className={`csh-emoji-btn ${rating === e.value ? 'selected' : ''}`}
                  onClick={() => setRating(e.value)}
                  aria-label={e.label}
                >
                  <span className="csh-emoji">{e.emoji}</span>
                  <span className="csh-emoji-label">{e.label}</span>
                </button>
              ))}
            </div>
            <textarea
              className="csh-feedback-textarea"
              rows="4"
              placeholder="Tell us what went well or what we can improve..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
            <button className="csh-feedback-submit" type="submit" disabled={!rating}>
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function ContactNewsletter() {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle');

  const submit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSubStatus('loading');
    setTimeout(() => { setSubStatus('success'); setEmail(''); }, 1200);
    setTimeout(() => setSubStatus('idle'), 3500);
  };

  return (
    <section className="csh-nl-section">
      <div className="csh-nl-inner">
        <div className="csh-nl-left">
          <span className="csh-nl-badge"><Icon name="bell" /> Stay in the Loop</span>
          <h2>Get Support Updates & Offers</h2>
          <p>Be the first to know about new features, exclusive deals, and seasonal collections.</p>
        </div>
        <form className="csh-nl-form" onSubmit={submit}>
          <div className="csh-nl-group">
            <input type="email" placeholder="Enter your email" required value={email} onChange={e => setEmail(e.target.value)} aria-label="Email address" />
            <button type="submit" className="csh-nl-btn" disabled={subStatus === 'loading'}>
              {subStatus === 'loading' ? 'Joining...' : subStatus === 'success' ? 'Welcome!' : 'Subscribe'}
            </button>
          </div>
          <span className="csh-nl-disclaimer">No spam, ever. Unsubscribe anytime.</span>
        </form>
      </div>
    </section>
  );
}

export function ContactPage() {
  return (
    <>
      <SupportHero />
      <SupportCenter />
      <LiveSupportSection />
      <ContactFormSection />
      <MapAndStoreSection />
      <FAQSection />
      <QuickHelpSection />
      <FeedbackSection />
      <ContactNewsletter />
    </>
  );
}
export function NotFoundPage() { return <div className="react-empty"><h1>Page not found</h1><p>The route is not available.</p></div>; }
