const API_BASE = import.meta.env.VITE_API_URL || "";

const getToken = () => localStorage.getItem("adminToken");

const headers = (includeAuth = true) => {
  const h = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
};

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

export const adminAPI = {
  login: (email, password) =>
    fetch(`${API_BASE}/api/admin/auth/login`, {
      method: "POST",
      headers: headers(false),
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  getProfile: () =>
    fetch(`${API_BASE}/api/admin/auth/profile`, {
      headers: headers(),
    }).then(handleResponse),

  updateProfile: (data) =>
    fetch(`${API_BASE}/api/admin/auth/profile`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  changePassword: (currentPassword, newPassword) =>
    fetch(`${API_BASE}/api/admin/auth/change-password`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ currentPassword, newPassword }),
    }).then(handleResponse),

  getDashboardStats: () =>
    fetch(`${API_BASE}/api/admin/dashboard/stats`, {
      headers: headers(),
    }).then(handleResponse),

  getSalesChart: (period = "monthly") =>
    fetch(`${API_BASE}/api/admin/dashboard/sales-chart?period=${period}`, {
      headers: headers(),
    }).then(handleResponse),

  getTopProducts: () =>
    fetch(`${API_BASE}/api/admin/dashboard/top-products`, {
      headers: headers(),
    }).then(handleResponse),

  getOrdersByMonth: () =>
    fetch(`${API_BASE}/api/admin/dashboard/orders-by-month`, {
      headers: headers(),
    }).then(handleResponse),

  getCategorySales: () =>
    fetch(`${API_BASE}/api/admin/dashboard/category-sales`, {
      headers: headers(),
    }).then(handleResponse),

  getCustomerGrowth: () =>
    fetch(`${API_BASE}/api/admin/dashboard/customer-growth`, {
      headers: headers(),
    }).then(handleResponse),

  getRecentOrders: () =>
    fetch(`${API_BASE}/api/admin/dashboard/recent-orders`, {
      headers: headers(),
    }).then(handleResponse),

  getSalesHistory: (period, page = 1, limit = 20) =>
    fetch(`${API_BASE}/api/admin/dashboard/sales-history?period=${period}&page=${page}&limit=${limit}`, {
      headers: headers(),
    }).then(handleResponse),

  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/api/admin/products?${query}`, {
      headers: headers(),
    }).then(handleResponse);
  },

  getProduct: (id) =>
    fetch(`${API_BASE}/api/admin/products/${id}`, {
      headers: headers(),
    }).then(handleResponse),

  createProduct: (data) =>
    fetch(`${API_BASE}/api/admin/products`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateProduct: (id, data) =>
    fetch(`${API_BASE}/api/admin/products/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteProduct: (id) =>
    fetch(`${API_BASE}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: headers(),
    }).then(handleResponse),

  updateStock: (id, stock) =>
    fetch(`${API_BASE}/api/admin/products/${id}/stock`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ stock }),
    }).then(handleResponse),

  getProductHistory: (page = 1, limit = 50) =>
    fetch(`${API_BASE}/api/admin/products/history?page=${page}&limit=${limit}`, {
      headers: headers(),
    }).then(handleResponse),

  getCategories: () =>
    fetch(`${API_BASE}/api/admin/products/categories`, {
      headers: headers(),
    }).then(handleResponse),

  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/api/admin/orders?${query}`, {
      headers: headers(),
    }).then(handleResponse);
  },

  getOrder: (id) =>
    fetch(`${API_BASE}/api/admin/orders/${id}`, {
      headers: headers(),
    }).then(handleResponse),

  updateOrderStatus: (id, order_status, payment_status) =>
    fetch(`${API_BASE}/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ order_status, payment_status }),
    }).then(handleResponse),

  getOrderStats: () =>
    fetch(`${API_BASE}/api/admin/orders/stats`, {
      headers: headers(),
    }).then(handleResponse),

  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/api/admin/customers?${query}`, {
      headers: headers(),
    }).then(handleResponse);
  },

  getCustomer: (id) =>
    fetch(`${API_BASE}/api/admin/customers/${id}`, {
      headers: headers(),
    }).then(handleResponse),

  updateCustomer: (id, data) =>
    fetch(`${API_BASE}/api/admin/customers/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  disableCustomer: (id) =>
    fetch(`${API_BASE}/api/admin/customers/${id}/disable`, {
      method: "PATCH",
      headers: headers(),
    }).then(handleResponse),

  blockCustomer: (id, reason = "") =>
    fetch(`${API_BASE}/api/admin/customers/${id}/block`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ reason }),
    }).then(handleResponse),

  enableCustomer: (id) =>
    fetch(`${API_BASE}/api/admin/customers/${id}/enable`, {
      method: "PATCH",
      headers: headers(),
    }).then(handleResponse),

  deleteCustomer: (id) =>
    fetch(`${API_BASE}/api/admin/customers/${id}`, {
      method: "DELETE",
      headers: headers(),
    }).then(handleResponse),

  getPaymentStats: () =>
    fetch(`${API_BASE}/api/admin/payments/stats`, {
      headers: headers(),
    }).then(handleResponse),

  getPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/api/admin/payments?${query}`, {
      headers: headers(),
    }).then(handleResponse);
  },

  getPayment: (id) =>
    fetch(`${API_BASE}/api/admin/payments/${id}`, {
      headers: headers(),
    }).then(handleResponse),

  refundPayment: (id) =>
    fetch(`${API_BASE}/api/admin/payments/${id}/refund`, {
      method: "PATCH",
      headers: headers(),
    }).then(handleResponse),

  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const token = getToken();
    return fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(handleResponse);
  },
};
