import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { categories as staticCategories } from '../data';
import { useProducts } from '../context/ProductContext';
import ProductGrid from '../components/ProductGrid';

export function CategoryPage() {
  const { category } = useParams();
  const { products, loading } = useProducts();
  const cat = staticCategories.find(x => x.id === category);
  const title = cat?.name ?? category?.replace(/-/g, ' ') ?? 'Collection';

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === category);
  }, [products, category]);

  return (
    <>
      <section className="category-hero" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)), url('${cat?.image || 'https://via.placeholder.com/1200x400?text=Collection'}')` }}>
        <div className="category-hero-content">
          <h1>{title}</h1>
          <p>Discover styles crafted to elevate every occasion.</p>
          <a className="category-hero-btn" href="#categoryProducts">Shop Now</a>
        </div>
      </section>
      <section className="products-section" id="categoryProducts">
        <div className="section-header">
          <span className="section-tag">{title}</span>
          <h2>Our Collection</h2>
          {filteredProducts.length > 0 && <p>{filteredProducts.length} products found</p>}
        </div>
        <ProductGrid items={filteredProducts} loading={loading} />
      </section>
    </>
  );
}

export function CuratedPage({ type }) {
  const { products, loading } = useProducts();
  const title = type === 'new' ? 'New Arrivals' : 'Best Sellers';

  const data = useMemo(() => {
    if (type === 'new') {
      const flagged = products.filter(p => p.badge === 'New');
      const base = flagged.length ? flagged : [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return base.slice(0, 12);
    }
    const flagged = products.filter(p => p.badge === 'Best Seller');
    const base = flagged.length ? flagged : [...products].sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
    return base.slice(0, 12);
  }, [products, type]);

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="section-tag">{title}</span>
          <h1>{type === 'new' ? 'New Collection' : 'Most Loved Styles'}</h1>
          <p>Fresh pieces selected for your wardrobe.</p>
        </div>
      </section>
      <section className="products-section curated-section">
        <div className="section-header">
          <span className="section-tag">{title}</span>
          <h2>{type === 'new' ? 'New Collection' : 'Most Loved Styles'}</h2>
          <p>Fresh pieces selected for your wardrobe.</p>
        </div>
        <ProductGrid items={data} loading={loading} />
      </section>
    </>
  );
}

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const { products, categories: apiCategories, loading } = useProducts();
  const [max, setMax] = useState(10000);
  const [selected, setSelected] = useState([]);
  const [sort, setSort] = useState('default');
  const [highlight, setHighlight] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);
  const search = (params.get('search') || '').toLowerCase();
  const focusSearch = params.get('focusSearch') === 'true';

  useEffect(() => {
    if (apiCategories.length > 0 && selected.length === 0) {
      setSelected(apiCategories);
    }
  }, [apiCategories]);

  const displayCategories = useMemo(() => {
    if (apiCategories.length > 0) {
      return apiCategories.map(id => {
        const staticCat = staticCategories.find(c => c.id === id);
        return { id, name: staticCat?.name || id.replace(/-/g, ' ') };
      });
    }
    return staticCategories.map(c => ({ id: c.id, name: c.name }));
  }, [apiCategories]);

  const categoryName = id => {
    const cat = displayCategories.find(c => c.id === id);
    return cat?.name || id.replace(/-/g, ' ');
  };

  const items = useMemo(() => {
    const q = search.trim();
    return products
      .filter(p => selected.length === 0 || selected.includes(p.category))
      .filter(p => p.price <= max)
      .filter(p => !q || [p.name, p.category, categoryName(p.category), p.brand, p.description, p.badge || '', ...(p.tags || [])].join(' ').toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === 'price-low') return a.price - b.price;
        if (sort === 'price-high') return b.price - a.price;
        if (sort === 'name-az') return a.name.localeCompare(b.name);
        if (sort === 'name-za') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [max, selected, sort, search, products, displayCategories]);

  useEffect(() => {
    if (!focusSearch) return;
    const input = searchInputRef.current;
    const box = searchBoxRef.current;
    if (!input || !box) return;
    const timers = [];
    timers.push(window.setTimeout(() => {
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      timers.push(window.setTimeout(() => {
        input.focus({ preventScroll: true });
        setHighlight(true);
      }, 400));
    }, 80));
    return () => timers.forEach(clearTimeout);
  }, [focusSearch]);

  useEffect(() => {
    if (!highlight) return;
    const t = window.setTimeout(() => setHighlight(false), 2400);
    return () => clearTimeout(t);
  }, [highlight]);

  useEffect(() => {
    if (!focusSearch) return;
    const t = window.setTimeout(() => {
      const next = new URLSearchParams(params);
      next.delete('focusSearch');
      setParams(next, { replace: true });
    }, 600);
    return () => clearTimeout(t);
  }, [focusSearch]);

  const toggle = id => setSelected(x => x.includes(id) ? x.filter(v => v !== id) : [...x, id]);

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="section-tag">Shop</span>
          <h1>Shop the Collection</h1>
          <p>Find your perfect style from our handpicked collections.</p>
        </div>
      </section>

      <section className="categories-section shop-categories-section">
        <div className="section-header">
          <span className="section-tag">Categories</span>
          <h2>Shop by Category</h2>
          <p>Find your perfect style from our handpicked collections</p>
        </div>
        <div className="categories-grid">
          {staticCategories.map(c => (
            <Link key={c.id} to={`/${c.id}`} className="category-card">
              <div className="category-image-wrapper">
                <img src={c.image} alt={c.name} />
                <div className="category-overlay">
                  <h3>{c.name}</h3>
                  <span className="category-explore">Explore <i className="fa-solid fa-arrow-right" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="shop-products-section">
        <div className="shop-layout">
          {filterOpen && <div className="filter-overlay" onClick={() => setFilterOpen(false)} />}
          <aside className={`filter-sidebar ${filterOpen ? 'open' : ''}`}>
            <div className="filter-header">
              <h3>Filters</h3>
              <div className="filter-header-actions">
                <button className="filter-close md:hidden" onClick={() => setFilterOpen(false)} aria-label="Close filters"><i className="fa-solid fa-xmark" /></button>
                <button className="filter-clear" onClick={() => { setMax(10000); setSelected(apiCategories.length > 0 ? apiCategories : staticCategories.map(c => c.id)); setSort('default'); }}>Clear All</button>
              </div>
            </div>
            <div className="filter-group">
              <h4>Category</h4>
              {displayCategories.map(c => (
                <label className="filter-check" key={c.id}>
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-range-display">
                <span>₹0</span>
                <span>₹{max.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min="0" max="10000" step="100" value={max} onChange={e => setMax(+e.target.value)} />
            </div>
            <div className="filter-group">
              <h4>Sort By</h4>
              <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-az">Name: A to Z</option>
                <option value="name-za">Name: Z to A</option>
              </select>
            </div>
          </aside>
          <div className="shop-main">
            <div className="shop-toolbar">
              <div className="shop-toolbar-left">
                <button className="filter-toggle md:hidden" onClick={() => setFilterOpen(true)}><i className="fa-solid fa-sliders" /> Filters</button>
                <span className="shop-result-count">{items.length} products</span>
              </div>
              <div className={`shop-search-box${highlight ? ' search-highlight' : ''}`} ref={searchBoxRef}>
                <i className="fa-solid fa-magnifying-glass" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={params.get('search') || ''}
                  onChange={e => setParams(e.target.value ? { search: e.target.value } : {}, { replace: true })}
                />
                {params.get('search') && (
                  <button className="shop-search-clear" onClick={() => setParams({}, { replace: true })} aria-label="Clear search">
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
            </div>
            <ProductGrid items={items} loading={loading} />
          </div>
        </div>
      </section>
    </>
  );
}
