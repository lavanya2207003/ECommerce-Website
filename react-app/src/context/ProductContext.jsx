import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { productAPI } from "../services/productAPI";
import { products as fallbackProducts, categories as fallbackCategories } from "../data";

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(fallbackCategories.map(c => c.id));
  const [total, setTotal] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productAPI.getProducts(params);
      if (Array.isArray(data.products)) {
        if (data.products.length > 0 || !params || Object.keys(params).length === 0) {
          setProducts(data.products.length > 0 ? data.products : fallbackProducts);
        }
      }
      setTotal(data.total ?? null);
      return data;
    } catch (err) {
      setError(err.message);
      setTotal(null);
      setProducts(prev => (prev.length > 0 ? prev : fallbackProducts));
      return { products: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await productAPI.getCategories();
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  const getProduct = useCallback(async (id) => {
    try {
      const data = await productAPI.getProduct(id);
      return data.product;
    } catch (err) {
      const local = fallbackProducts.find(p => String(p.id) === String(id));
      if (local) return local;
      throw err;
    }
  }, []);

  const refreshProducts = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    let cancelled = false;
    let retries = 0;
    const maxRetries = 2;

    const load = async () => {
      const data = await fetchProducts();
      fetchCategories();
      if (cancelled) return;
      const failed = !data || (!Array.isArray(data.products) || data.products.length === 0);
      if (failed && retries < maxRetries) {
        retries += 1;
        setTimeout(load, 3000 * retries);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [fetchProducts, fetchCategories]);

  const value = {
    products,
    loading,
    error,
    categories,
    total,
    fetchProducts,
    fetchCategories,
    getProduct,
    refreshProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within ProductProvider");
  return context;
};
