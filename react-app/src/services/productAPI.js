const API_BASE = import.meta.env.VITE_API_URL || "";

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server error. Please try again later.");
  }
  const text = await response.text();
  if (!text) {
    throw new Error("Empty response from server.");
  }
  const data = JSON.parse(text);
  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }
  return data;
};

export const productAPI = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/api/products?${query}`).then(handleResponse);
  },

  getProduct: (id) =>
    fetch(`${API_BASE}/api/products/${id}`).then(handleResponse),

  getCategories: () =>
    fetch(`${API_BASE}/api/products/categories`).then(handleResponse),
};
