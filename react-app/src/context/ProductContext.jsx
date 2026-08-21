import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { productAPI } from "../services/productAPI";

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productAPI.getProducts(params);
      setProducts(data.products);
      setTotal(data.total);
      return data;
    } catch (err) {
      setError(err.message);
      setTotal(null);
      return { products: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await productAPI.getCategories();
      setCategories(data.categories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  const getProduct = useCallback(async (id) => {
    try {
      const data = await productAPI.getProduct(id);
      return data.product;
    } catch (err) {
      throw err;
    }
  }, []);

  const refreshProducts = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
