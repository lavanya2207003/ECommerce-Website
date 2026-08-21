import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useStore } from '../context/StoreContext';

function getProductImage(product) {
  if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0];
  }
  return product.image || 'https://via.placeholder.com/600x700?text=No+Image';
}

function getProductPrice(product) {
  if (product.discount_price && product.discount_price > 0 && product.discount_price < product.price) {
    return product.discount_price;
  }
  return product.price;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProduct, loading: productsLoading } = useProducts();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProduct(id);
        setProduct(data);
        if (data.sizes?.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, getProduct]);

  if (loading || productsLoading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 rounded-2xl h-96" />
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-8 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="py-20">
            <i className="fa-solid fa-exclamation-triangle text-4xl text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-6">{error || 'The product you are looking for does not exist or has been removed.'}</p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <i className="fa-solid fa-arrow-left" /> Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.image || 'https://via.placeholder.com/600x700?text=No+Image'];
  const price = getProductPrice(product);
  const hasDiscount = product.discount_price > 0 && product.discount_price < product.price;
  const inWishlist = wishlist.includes(product._id || product.id);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    addToCart({
      ...product,
      id: product._id || product.id,
      image: getProductImage(product),
      quantity,
      selectedSize,
    });
  };

  const handleBuyNow = () => {
    addToCart({
      ...product,
      id: product._id || product.id,
      image: getProductImage(product),
      quantity,
      selectedSize,
    });
    navigate('/cart');
  };

  return (
    <div className="product-detail-page">
      <div className="product-detail-container max-w-6xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-purple-600">Home</Link>
          <i className="fa-solid fa-chevron-right text-xs" />
          <Link to="/shop" className="hover:text-purple-600">Shop</Link>
          <i className="fa-solid fa-chevron-right text-xs" />
          {product.category && (
            <>
              <Link to={`/${product.category}`} className="hover:text-purple-600 capitalize">{product.category.replace(/-/g, ' ')}</Link>
              <i className="fa-solid fa-chevron-right text-xs" />
            </>
          )}
          <span className="text-gray-700 truncate">{product.name}</span>
        </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/5]">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === i ? 'border-purple-600' : 'border-gray-200'}`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {product.badge && (
            <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {product.badge}
            </span>
          )}

          <div>
            {product.brand && <p className="text-sm text-gray-500 mb-1">{product.brand}</p>}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
          </div>

          <div className="flex items-center gap-1 text-yellow-400">
            {[1, 2, 3, 4, 5].map(i => <i key={i} className="fa-solid fa-star" />)}
            <span className="text-sm text-gray-500 ml-2">(5.0)</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-purple-700">₹{price.toLocaleString('en-IN')}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-sm font-medium text-green-600">
                  {product.discount_percent || Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {product.sizes?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm rounded-lg border ${selectedSize === size ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 text-gray-700 hover:border-purple-400'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <i className="fa-solid fa-minus text-sm" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <i className="fa-solid fa-plus text-sm" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-bag-shopping" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-bolt" />
              Buy Now
            </button>
            <button
              onClick={() => toggleWishlist(product._id || product.id)}
              className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-colors ${inWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500'}`}
            >
              <i className={`fa-${inWishlist ? 'solid' : 'regular'} fa-heart`} />
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            {product.category && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="fa-solid fa-tag w-4 text-gray-400" />
                <span className="font-medium">Category:</span>
                <Link to={`/${product.category}`} className="text-purple-600 hover:underline capitalize">{product.category.replace(/-/g, ' ')}</Link>
              </div>
            )}
            {product.sku && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <i className="fa-solid fa-barcode w-4 text-gray-400" />
                <span className="font-medium">SKU:</span>
                <span className="font-mono">{product.sku}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <i className="fa-solid fa-box w-4 text-gray-400" />
              <span className="font-medium">Stock:</span>
              {isOutOfStock ? (
                <span className="text-red-500">Out of Stock</span>
              ) : product.stock <= (product.low_stock_threshold || 5) ? (
                <span className="text-yellow-600">Low Stock ({product.stock} left)</span>
              ) : (
                <span className="text-green-600">In Stock ({product.stock} available)</span>
              )}
            </div>
            {product.tags?.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <i className="fa-solid fa-tags w-4 text-gray-400 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
