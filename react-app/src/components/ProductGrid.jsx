import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import QuickViewModal from './QuickViewModal';
import Icon from './Icon';
import ImageWithFallback from './ImageWithFallback';

const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='600' viewBox='0 0 500 600'%3E%3Crect fill='%23f1f5f9' width='500' height='600'/%3E%3Cg transform='translate(200,250)'%3E%3Crect fill='%23e2e8f0' x='40' y='0' width='60' height='60' rx='8'/%3E%3Ccircle fill='%23cbd5e1' cx='70' cy='20' r='12'/%3E%3Cpath fill='%23cbd5e1' d='M50 48 L70 28 L90 48' stroke='%23cbd5e1' stroke-width='4' fill='none'/%3E%3C/g%3E%3Ctext x='250' y='340' text-anchor='middle' fill='%2394a3b8' font-family='Inter,system-ui,sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

function getProductImage(product) {
  if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0];
  }
  return product.image || PLACEHOLDER_SVG;
}

function getProductPrice(product) {
  if (product.discount_price && product.discount_price > 0 && product.discount_price < product.price) {
    return product.discount_price;
  }
  return product.price;
}

export default function ProductGrid({ items, loading }) {
  const { addToCart, toggleWishlist, wishlist, openQuickView } = useStore();

  if (loading) {
    return (
      <div className="products-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="product-card animate-pulse">
            <div className="product-image-wrapper bg-gray-200" />
            <div className="product-details space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="react-empty">
        <h3>No products found</h3>
        <p>Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="products-grid">
        {items.map(product => (
          <article className="product-card" key={product._id || product.id}>
            <div className="product-image-wrapper">
              <Link to={`/product/${product._id || product.id}`}>
                <ImageWithFallback src={getProductImage(product)} alt={product.name} loading="lazy" width="500" height="600" />
              </Link>
              {product.badge && <span className="product-badge">{product.badge}</span>}
              <button
                className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-slate-700 hover:text-red-500 hover:scale-110 transition-all duration-200"
                onClick={() => toggleWishlist(product._id || product.id)}
                aria-label="Toggle wishlist"
              >
                <Icon name="heart" className={wishlist.includes(product._id || product.id) ? 'text-red-500 fill-red-500' : ''} />
              </button>
              <div className="product-action-buttons">
                <button
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-xs px-4 py-1.5 rounded-full shadow-lg hover:from-purple-700 hover:to-pink-600 hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1.5 min-w-[120px] max-w-[80%]"
                  onClick={() => addToCart({ ...product, id: product._id || product.id, image: getProductImage(product) })}
                >
                  <Icon name="bag-shopping" className="text-xs" /> Add to Cart
                </button>
                <button
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-xs px-4 py-1.5 rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1.5 min-w-[120px] max-w-[80%]"
                  onClick={() => openQuickView({ ...product, id: product._id || product.id, image: getProductImage(product) })}
                >
                  <Icon name="eye" className="text-xs" /> Quick View
                </button>
              </div>
            </div>
            <div className="product-details">
              <Link to={`/product/${product._id || product.id}`}>
                <h3 className="product-title">{product.name}</h3>
              </Link>
              {product.brand && <p className="text-xs text-gray-400 mb-1">{product.brand}</p>}
              <div className="product-rating">
                <Icon name="star" /><Icon name="star" />
                <Icon name="star" /><Icon name="star" />
                <Icon name="star" />
              </div>
              <p className="product-description">{product.description}</p>
              <div className="flex items-center gap-2">
                <span className="product-price">₹{getProductPrice(product).toLocaleString('en-IN')}</span>
                {product.discount_price > 0 && product.discount_price < product.price && (
                  <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                )}
              </div>
              {product.stock !== undefined && product.stock === 0 && (
                <span className="text-xs text-red-500 font-medium">Out of Stock</span>
              )}
            </div>
          </article>
        ))}
      </div>
      <QuickViewModal />
    </>
  );
}
