import { Link } from 'react-router-dom';
import { useRef, useEffect, useCallback } from 'react';
import Icon, { BrandIcon } from '../components/Icon';
import ImageWithFallback from '../components/ImageWithFallback';


const WHY_CHOOSE = [
  { icon: 'gem', title: 'Premium Quality', desc: 'We handpick every product for exceptional quality and durability.' },
  { icon: 'tags', title: 'Affordable Prices', desc: 'Luxury fashion at prices that won\'t break the bank.' },
  { icon: 'truck-fast', title: 'Fast Delivery', desc: 'Free shipping on orders over ₹1000 with express delivery options.' },
  { icon: 'shield-halved', title: 'Secure Checkout', desc: 'Your data is protected with industry-standard encryption.' },
  { icon: 'face-smile', title: 'Customer Satisfaction', desc: 'Our support team is here 24/7 to help you.' },
];

const REVIEWS = [
  { name: 'Lavanya', avatar: 'PS', rating: 5, text: 'Absolutely in love with my purchase! The quality exceeded my expectations and the delivery was super fast.', location: 'Mumbai' },
  { name: 'Caro', avatar: 'AR', rating: 5, text: 'LayaStore has become my go-to for fashion. The curated collections are stunning and the fit is always perfect.', location: 'Hyderabad' },
  { name: 'Giri', avatar: 'NP', rating: 4, text: 'Great variety and amazing quality. The customer service team was incredibly helpful with my size query.', location: 'Ahmedabad' },
  { name: 'Nidhi', avatar: 'KS', rating: 5, text: 'Best online shopping experience! The products look exactly as shown and the packaging was beautiful.', location: 'Delhi' },
  { name: 'Bharath', avatar: 'RM', rating: 5, text: 'I have recommended LayaStore to all my friends. The ethnic wear collection is simply beautiful.', location: 'Jaipur' },
  { name: 'Naveen', avatar: 'SG', rating: 4, text: 'Love the easy return policy and the quick refunds. Makes online shopping stress-free!', location: 'Bangalore' },
];

const SOCIAL_IMAGES = [
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
];

function SectionTag({ children }) {
  return <span className="section-tag">{children}</span>;
}

function SectionHeading({ tag, title, desc }) {
  return <div className="section-header">
    {tag && <SectionTag>{tag}</SectionTag>}
    <h2>{title}</h2>
    {desc && <p>{desc}</p>}
  </div>;
}

function HeroSection() {
  return <section className="hero">
    <div className="hero-overlay" />
    <div className="hero-content">
      <div className="hero-badge-row">
        <span className="hero-badge"><Icon name="sun" /> Summer Collection</span>
        <span className="hero-badge hero-badge-sale">Up to 20% Off</span>
      </div>
      <h1>Get up to 20% Off<br />New Arrivals</h1>
      <p className="hero-desc">Discover the Latest Fashion Trends — curated just for you.</p>
      <div className="hero-actions">
        <Link to="/shop" className="hero-btn-primary">SHOP NOW <Icon name="arrow-right" /></Link>
        <Link to="/new" className="hero-btn-secondary">EXPLORE COLLECTION <Icon name="arrow-right" /></Link>
      </div>
      <div className="hero-trust">
        {[['truck-fast','Free Shipping'],['shield-halved','Secure Payments'],['rotate-left','Easy Returns'],['gem','Premium Quality']].map(([icon,label]) => <div className="hero-trust-item" key={label}>
          <Icon name={icon} /><span>{label}</span>
        </div>)}
      </div>
    </div>
  </section>;
}

function FeatureHighlights() {
  const features = [
    { icon: 'truck-fast', title: 'Free Shipping', desc: 'On orders above ₹1000' },
    { icon: 'rotate-left', title: 'Easy Returns', desc: '30-day return policy' },
    { icon: 'shield-halved', title: 'Secure Payments', desc: '100% secure checkout' },
    { icon: 'headset', title: '24/7 Support', desc: 'Dedicated customer care' },
  ];
  return <section className="feature-highlights">
    <div className="fh-container">
      {features.map((f, i) => <div className="fh-card" key={i}>
        <div className="fh-icon-wrapper"><Icon name={f.icon} /></div>
        <div className="fh-text"><h4>{f.title}</h4><p>{f.desc}</p></div>
      </div>)}
    </div>
  </section>;
}

function WhyChooseSection() {
  return <section className="why-choose-section">
    <div className="why-choose-container">
      <div className="why-choose-header">
        <SectionTag>Why LayaStore</SectionTag>
        <h2>Why Shop With Us</h2>
        <p>We go the extra mile to make every shopping experience exceptional</p>
      </div>
      <div className="why-choose-grid">
        {WHY_CHOOSE.map((item, i) => <div className="why-choose-card" key={i}>
          <div className="why-choose-icon"><Icon name={item.icon} /></div>
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </div>)}
      </div>
    </div>
  </section>;
}

function ReviewsSection() {
  const trackRef = useRef(null);
  const scroll = useCallback((dir) => {
    if (trackRef.current) {
      const amt = 320;
      trackRef.current.scrollBy({ left: dir * amt, behavior: 'smooth' });
    }
  }, []);
  return <section className="reviews-section">
    <div className="reviews-container">
      <SectionHeading tag="Testimonials" title="What Our Customers Say" desc="Real reviews from real people who love LayaStore" />
      <div className="reviews-carousel-wrapper">
        <button className="review-arrow review-arrow-left" onClick={() => scroll(-1)} aria-label="Previous reviews"><Icon name="chevron-left" /></button>
        <div className="reviews-track" ref={trackRef}>
          {REVIEWS.map((r, i) => <div className="review-card" key={i}>
            <div className="review-stars">{Array.from({ length: 5 }, (_, j) => <Icon key={j} name="star" className={j < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />)}</div>
            <p className="review-text">"{r.text}"</p>
            <div className="review-author">
              <div className="review-avatar">{r.avatar}</div>
              <div>
                <strong>{r.name}</strong>
                <span>{r.location}</span>
              </div>
            </div>
          </div>)}
        </div>
        <button className="review-arrow review-arrow-right" onClick={() => scroll(1)} aria-label="Next reviews"><Icon name="chevron-right" /></button>
      </div>
    </div>
  </section>;
}

function EnhancedNewsletter() {
  const submit = event => {
    event.preventDefault();
    event.currentTarget.reset();
    alert('Thank you for subscribing! Check your inbox for your 15% off code.');
  };
  return <section className="newsletter-section">
    <div className="newsletter-container">
      <div className="newsletter-content">
        <div className="newsletter-text">
          <span className="newsletter-tag">Stay Connected</span>
          <h2>GET 15% OFF YOUR FIRST ORDER</h2>
          <p>Join our community and be the first to know about new collections, exclusive offers, and style inspiration.</p>
        </div>
        <form className="newsletter-form" onSubmit={submit}>
          <div className="form-group">
            <input type="email" placeholder="Enter your email address" required aria-label="Email address" />
            <button type="submit" className="btn-newsletter">Subscribe</button>
          </div>
          <div className="form-checkbox">
            <input id="terms" type="checkbox" required />
            <label htmlFor="terms">I agree to the Terms of Service and Privacy Policy</label>
          </div>
        </form>
      </div>
    </div>
  </section>;
}

function SocialGallery() {
  return <section className="social-gallery">
    <div className="sg-container">
      <div className="sg-header">
        <SectionTag>Follow Us</SectionTag>
        <h2>@layastore on Instagram</h2>
        <p>Tag us in your outfits for a chance to be featured</p>
      </div>
      <div className="sg-grid">
        {SOCIAL_IMAGES.map((img, i) => <div className="sg-item" key={i}>
          <ImageWithFallback src={img} alt={`LayaStore fashion ${i + 1}`} loading="lazy" width="300" height="300" />
          <div className="sg-overlay"><BrandIcon name="instagram" /></div>
        </div>)}
      </div>
      <div className="sg-footer">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="sg-btn" aria-label="Follow us on Instagram">
          <BrandIcon name="instagram" /> Follow @layastore
        </a>
      </div>
    </div>
  </section>;
}

export default function HomePage() {
  return <>
    <HeroSection />
    <FeatureHighlights />
    <WhyChooseSection />
    <ReviewsSection />
    <EnhancedNewsletter />
    <SocialGallery />
  </>;
}

export function Newsletter() {
  const submit = event => {
    event.preventDefault();
    event.currentTarget.reset();
    alert('Thank you for subscribing!');
  };
  return <section className="newsletter-section">
    <div className="newsletter-container">
      <div className="newsletter-content">
        <div className="newsletter-text">
          <h2>GET 15% OFF YOUR FIRST ORDER</h2>
          <p>Subscribe for new collections and exclusive offers.</p>
        </div>
        <form className="newsletter-form" onSubmit={submit}>
          <div className="form-group">
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit" className="btn btn-newsletter">Subscribe</button>
          </div>
          <div className="form-checkbox">
            <input id="terms" type="checkbox" required />
            <label htmlFor="terms">I agree to the Terms of Service and Privacy Policy</label>
          </div>
        </form>
      </div>
    </div>
  </section>;
}
