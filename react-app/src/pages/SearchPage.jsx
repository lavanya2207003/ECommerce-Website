import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductGrid from '../components/ProductGrid';
import Icon from '../components/Icon';

export default function SearchPage() {
  const { products, loading } = useProducts();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      p => p.name.toLowerCase().includes(q) ||
           p.category?.toLowerCase().includes(q) ||
           p.brand?.toLowerCase().includes(q) ||
           p.description?.toLowerCase().includes(q) ||
           (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [query, products]);

  return (
    <section className="search-page">
      <div className="search-page-hero">
        <div className="search-page-hero-content">
          <span className="section-tag">Search</span>
          <h1>Find Your Perfect Style</h1>
          <p>Browse through our curated collection</p>
        </div>
      </div>
      <div className="search-page-body">
        <div className="search-page-input-wrap">
          <Icon name="magnifying-glass" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by name, category, brand..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="search-page-clear" onClick={() => setQuery('')}>
              <Icon name="xmark" />
            </button>
          )}
        </div>
        {query.trim() && (
          <p className="search-page-count">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
        )}
        <div className="search-page-results">
          {loading && query.trim() && (
            <div className="search-page-empty">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p>Searching...</p>
            </div>
          )}
          {!loading && query.trim() && filtered.length === 0 && (
            <div className="search-page-empty">
              <Icon name="magnifying-glass" />
              <h3>No products found</h3>
              <p>Try a different search term</p>
              <Link to="/shop" className="search-page-shop-btn">Browse All Products</Link>
            </div>
          )}
          {filtered.length > 0 && <ProductGrid items={filtered} loading={loading} />}
        </div>
      </div>
    </section>
  );
}
