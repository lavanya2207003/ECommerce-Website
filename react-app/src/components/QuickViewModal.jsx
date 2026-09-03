import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { CLOTHING_CATEGORIES, NON_CLOTHING_CATEGORIES } from '../data';
import Icon from './Icon';
import ImageWithFallback from './ImageWithFallback';

const SIZE_GUIDE_DATA = {
  name: "Women's Clothing",
  sizes: [
    { size: 'XS', bust: '30-32', waist: '24-26', hips: '32-34' },
    { size: 'S', bust: '32-34', waist: '26-28', hips: '34-36' },
    { size: 'M', bust: '34-36', waist: '28-30', hips: '36-38' },
    { size: 'L', bust: '36-38', waist: '30-32', hips: '38-40' },
    { size: 'XL', bust: '38-40', waist: '32-34', hips: '40-42' },
    { size: 'XXL', bust: '40-42', waist: '34-36', hips: '42-44' }
  ]
};

export default function QuickViewModal() {
  const navigate = useNavigate();
  const { quickViewProduct, closeQuickView, addToCart, toggleWishlist, wishlist } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setQuantity(1);
      setSelectedSize(quickViewProduct.sizes?.[0] || '');
    }
  }, [quickViewProduct]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeQuickView(); };
    if (quickViewProduct) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [quickViewProduct, closeQuickView]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const hasSizes = product.sizes?.length > 0;
  const isClothing = CLOTHING_CATEGORIES.includes(product.category);
  const isNonClothing = NON_CLOTHING_CATEGORIES.includes(product.category);
  const shouldShowSizeGuide = (hasSizes || isClothing || product.requiresSizeGuide === true) && !isNonClothing;
  const hasSizeVariants = hasSizes || product.requiresSizeGuide === true;
  const inWishlist = wishlist.includes(product.id);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeQuickView();
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity, selectedSize });
    closeQuickView();
  };

  const handleBuyNow = () => {
    addToCart({ ...product, quantity, selectedSize });
    closeQuickView();
    navigate('/cart');
  };

  return (
    <>
      <div className="modal-overlay active" onClick={handleOverlayClick}>
        <div className="modal-content">
          <button className="modal-close" onClick={closeQuickView} aria-label="Close modal">{'\u00D7'}</button>
          <div className="modal-body">
            <div className="modal-image">
              <ImageWithFallback src={product.image} alt={product.name} />
              <button
                className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md rounded-full p-2.5 shadow-md hover:scale-105 transition-all duration-200"
                onClick={() => toggleWishlist(product.id)}
                aria-label="Toggle wishlist"
              >
                <Icon name="heart" className={inWishlist ? 'text-red-500 fill-red-500' : 'text-slate-700'} />
              </button>
            </div>
            <div className="modal-details">
              {product.badge && <span className="modal-badge">{product.badge}</span>}
              <h2>{product.name}</h2>
              <div className="modal-rating">
                <Icon name="star" /><Icon name="star" />
                <Icon name="star" /><Icon name="star" />
                <Icon name="star" />
                <span>4.5 (128 reviews)</span>
              </div>
              <p className="modal-desc">{product.description}</p>
              <div className="modal-price">₹{product.price.toLocaleString('en-IN')}</div>

              {hasSizeVariants && product.sizes?.length > 0 && (
                <div className="modal-size-row">
                  <label className="modal-size-label">Size:</label>
                  <div className="modal-size-options">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        className={`modal-size-btn ${selectedSize === s ? 'active' : ''}`}
                        onClick={() => setSelectedSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-qty-row">
                <label className="modal-size-label">Qty:</label>
                <div className="modal-qty-controls">
                  <button className="modal-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <span className="modal-qty-value">{quantity}</span>
                  <button className="modal-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>
              </div>

              <div className={`modal-actions-row ${!shouldShowSizeGuide ? 'modal-actions-row--no-sizeguide' : ''}`}>
                <button className="btn-action btn-addtocart" onClick={handleAddToCart}>
                  <Icon name="bag-shopping" /> Add to Cart
                </button>
                <button className="btn-action btn-buynow" onClick={handleBuyNow}>
                  <Icon name="bolt" /> Buy Now
                </button>
                {shouldShowSizeGuide && (
                  <button className="btn-action btn-sizeguide" onClick={() => setShowSizeGuide(true)} aria-label="Size guide">
                    <Icon name="ruler" /><span> Size Guide</span>
                  </button>
                )}
              </div>

              <div className="modal-reviews">
                <h4><Icon name="star" style={{color:'#d71920'}} /> Customer Reviews (128)</h4>
                <div className="review-item">
                  <div className="review-header">
                    <strong>Priya S.</strong>
                    <span><Icon name="star" /><Icon name="star" /><Icon name="star" /><Icon name="star" /><Icon name="star" /></span>
                    <span className="review-date">2 weeks ago</span>
                  </div>
                  <p>Absolutely love this! The quality exceeded my expectations.</p>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <strong>Ananya M.</strong>
                    <span><Icon name="star" /><Icon name="star" /><Icon name="star" /><Icon name="star" /><Icon name="star" /></span>
                    <span className="review-date">1 month ago</span>
                  </div>
                  <p>Great product, fits true to size. Would recommend!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSizeGuide && (
        <div className="size-guide-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowSizeGuide(false); }}>
          <div className="size-guide-content">
            <button className="size-guide-close" onClick={() => setShowSizeGuide(false)} aria-label="Close size guide">{'\u00D7'}</button>
            <div className="size-guide-modal">
              <h4>Size Guide - {SIZE_GUIDE_DATA.name}</h4>
              <p className="size-guide-subtitle">Find your perfect fit with our detailed size chart. Measure yourself accurately for the best results.</p>
              <div className="size-guide-illustration">
                {['Bust', 'Waist', 'Hips'].map(m => (
                  <div className="measure-point" key={m}>
                    <Icon name={m === 'Bust' ? 'gem' : m === 'Waist' ? 'circle' : 'box'} />
                    <span>{m}</span>
                    <small>Measure around the fullest part</small>
                  </div>
                ))}
              </div>
              <div className="size-table-wrapper">
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Bust (inches)</th>
                      <th>Waist (inches)</th>
                      <th>Hips (inches)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_GUIDE_DATA.sizes.map(s => (
                      <tr key={s.size}>
                        <td><strong>{s.size}</strong></td>
                        <td>{s.bust}</td>
                        <td>{s.waist}</td>
                        <td>{s.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="size-tip">
                <Icon name="lightbulb" />
                <span>Tip: If your measurements fall between two sizes, choose the larger size for a more comfortable fit.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
