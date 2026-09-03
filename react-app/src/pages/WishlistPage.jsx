import { Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useProducts } from '../context/ProductContext';
import Icon from '../components/Icon';
import ImageWithFallback from '../components/ImageWithFallback';

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

function WishlistCard({ product }) {
  const { addToCart, toggleWishlist } = useStore();
  const pid = product._id || product.id;
  return (
    <article className="wishlist-card">
      <div className="wishlist-card-image">
        <Link to={`/product/${pid}`}>
          <ImageWithFallback src={getProductImage(product)} alt={product.name} />
        </Link>
        <button className="wishlist-heart-btn active" onClick={() => toggleWishlist(pid)} aria-label="Remove from wishlist"><Icon name="heart" className="fill-red-500" /></button>
      </div>
      <div className="wishlist-card-content">
        <Link to={`/product/${pid}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>{product.description}</p>
        <div className="wishlist-card-price">₹{getProductPrice(product).toLocaleString('en-IN')}</div>
        <div className="wishlist-card-actions">
          <button className="wishlist-add-cart" onClick={() => addToCart({ ...product, id: pid, image: getProductImage(product) })}>Add to Cart</button>
        </div>
      </div>
    </article>
  );
}

export default function WishlistPage() {
  const { products, loading, total } = useProducts();
  const { wishlist, pruneWishlist } = useStore();

  const saved = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const p of products) {
      const pid = String(p._id || p.id);
      if (wishlist.includes(pid) && !seen.has(pid)) {
        seen.add(pid);
        result.push(p);
      }
    }
    return result;
  }, [products, wishlist]);

  useEffect(() => {
    if (!loading && total !== null && total > 0 && products.length >= total && products.length > 0) {
      pruneWishlist(products.map(p => p._id || p.id));
    }
  }, [loading, total, products, pruneWishlist]);

  return (
    <section className="wishlist-page">
      <div className="wishlist-hero">
        <span className="section-tag">Your Collection</span>
        <h1>My Wishlist</h1>
        <p>Products you love, saved for later</p>
      </div>
      <div className="wishlist-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="wishlist-card animate-pulse">
                <div className="wishlist-card-image bg-gray-200" />
                <div className="wishlist-card-content space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          : saved.length
            ? saved.map(p => <WishlistCard key={p._id || p.id} product={p} />)
            : <div className="react-empty"><h3>Your wishlist is empty</h3><Link to="/shop" className="empty-shop-btn">Shop Now</Link></div>}
      </div>
    </section>
  );
}
