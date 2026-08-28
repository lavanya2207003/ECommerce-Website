import { useState, useEffect, useRef } from "react";
import { adminAPI } from "../services/api";

const STATUS_OPTIONS = ["active", "disabled", "blocked"];

function getStatusBadge(status) {
  const styles = {
    active: "bg-green-100 text-green-700",
    disabled: "bg-yellow-100 text-yellow-700",
    blocked: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-gray-600";

  return (
    <div className={`fixed top-4 right-4 z-[100] ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm animate-slide-in`}>
      {type === "success" ? (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modal, setModal] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await adminAPI.getCustomers(params);
      setCustomers(data.customers);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      console.error("Fetch customers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(1), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!openMenuId) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setOpenMenuId(null);
    try {
      const data = await adminAPI.getCustomer(customer._id);
      setCustomerOrders(data.orders);
    } catch (err) {
      console.error("Fetch customer detail error:", err);
    }
  };

  const handleStatusAction = async () => {
    if (!modal) return;
    setActionLoading(true);
    try {
      const { type, customer } = modal;
      if (type === "disable") {
        await adminAPI.disableCustomer(customer._id);
        showToast(`${customer.name} has been successfully disabled.`);
      } else if (type === "block") {
        await adminAPI.blockCustomer(customer._id, blockReason);
        showToast(`${customer.name} has been successfully blocked.`);
      } else if (type === "enable") {
        await adminAPI.enableCustomer(customer._id);
        showToast(`${customer.name} has been successfully ${customer.status === "blocked" ? "unblocked" : "enabled"}.`);
      }
      setModal(null);
      setBlockReason("");
      setOpenMenuId(null);
      fetchCustomers(pagination.page);
      if (selectedCustomer?._id === customer._id) {
        const updated = { ...customer };
        if (type === "disable") { updated.status = "disabled"; updated.is_active = false; }
        else if (type === "block") { updated.status = "blocked"; updated.is_active = false; updated.blockReason = blockReason; }
        else if (type === "enable") { updated.status = "active"; updated.is_active = true; updated.blockReason = ""; }
        setSelectedCustomer(updated);
      }
    } catch (err) {
      showToast(err.message || "An error occurred. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-500 mt-1">{pagination.total} customers total</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full hidden md:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-12 text-center text-gray-400">No customers found</td></tr>
              ) : (
                customers.map((customer) => {
                  const status = customer.status || "active";
                  return (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 text-sm font-medium">{customer.name?.charAt(0)}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{customer.phone || "N/A"}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{customer.total_orders}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">INR {customer.total_spent?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(customer.registration_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 relative" ref={openMenuId === customer._id ? menuRef : undefined}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === customer._id ? null : customer._id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                            </svg>
                          </button>
                        </div>
                        {openMenuId === customer._id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1" onMouseDown={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleViewCustomer(customer)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              View Details
                            </button>
                            {status === "active" && (
                              <>
                                <button
                                  onClick={() => { setModal({ type: "disable", customer }); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                  Disable Customer
                                </button>
                                <button
                                  onClick={() => { setModal({ type: "block", customer }); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                  Block Customer
                                </button>
                              </>
                            )}
                            {status === "disabled" && (
                              <>
                                <button
                                  onClick={() => { setModal({ type: "enable", customer }); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Enable Customer
                                </button>
                                <button
                                  onClick={() => { setModal({ type: "block", customer }); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                  Block Customer
                                </button>
                              </>
                            )}
                            {status === "blocked" && (
                              <>
                                <button
                                  onClick={() => { setModal({ type: "enable", customer }); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Unblock Customer
                                </button>
                                <button
                                  onClick={() => { setModal({ type: "disable", customer }); setOpenMenuId(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                  Disable Customer
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="md:hidden p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No customers found</div>
            ) : (
              customers.map((customer) => {
                const status = customer.status || "active";
                return (
                  <div key={customer._id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-red-600 text-sm font-medium">{customer.name?.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                          <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${getStatusBadge(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span>{customer.phone || "N/A"}</span>
                      <span>•</span>
                      <span>{customer.total_orders} orders</span>
                      <span>•</span>
                      <span className="font-medium text-gray-900">₹{customer.total_spent?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">{new Date(customer.registration_date).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="px-3 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium"
                        >
                          View
                        </button>
                        <div className="relative" ref={openMenuId === customer._id ? menuRef : undefined}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === customer._id ? null : customer._id)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                            </svg>
                          </button>
                          {openMenuId === customer._id && (
                            <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1" onMouseDown={(e) => e.stopPropagation()}>
                              {status === "active" && (
                                <>
                                  <button
                                    onClick={() => { setModal({ type: "disable", customer }); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                                  >
                                    Disable Customer
                                  </button>
                                  <button
                                    onClick={() => { setModal({ type: "block", customer }); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    Block Customer
                                  </button>
                                </>
                              )}
                              {status === "disabled" && (
                                <>
                                  <button
                                    onClick={() => { setModal({ type: "enable", customer }); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                  >
                                    Enable Customer
                                  </button>
                                  <button
                                    onClick={() => { setModal({ type: "block", customer }); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    Block Customer
                                  </button>
                                </>
                              )}
                              {status === "blocked" && (
                                <>
                                  <button
                                    onClick={() => { setModal({ type: "enable", customer }); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                  >
                                    Unblock Customer
                                  </button>
                                  <button
                                    onClick={() => { setModal({ type: "disable", customer }); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                                  >
                                    Disable Customer
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchCustomers(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <button onClick={() => fetchCustomers(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
              <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl font-bold">{selectedCustomer.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedCustomer.status || "active")}`}>
                  {(selectedCustomer.status || "active").charAt(0).toUpperCase() + (selectedCustomer.status || "active").slice(1)}
                </span>
                {selectedCustomer.status === "blocked" && selectedCustomer.blockReason && (
                  <span className="text-xs text-red-500 ml-2">Reason: {selectedCustomer.blockReason}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-lg font-bold text-gray-900">{selectedCustomer.total_orders}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-lg font-bold text-gray-900">INR {selectedCustomer.total_spent?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Registered</p>
                  <p className="font-medium text-gray-900">{new Date(selectedCustomer.registration_date).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedCustomer.status === "blocked" && selectedCustomer.blockReason && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-500 font-medium">Block Reason</p>
                  <p className="text-sm text-red-700 mt-1">{selectedCustomer.blockReason}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Order History</h3>
                {customerOrders.length > 0 ? (
                  <div className="space-y-2">
                    {customerOrders.map((order) => (
                      <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{order.order_id?.substring(0, 15)}...</p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">INR {order.amount?.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${order.payment_status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No orders found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {modal.type === "disable" && "Disable Customer"}
                {modal.type === "block" && (modal.customer.status === "disabled" ? "Block Customer" : "Block Customer")}
                {modal.type === "enable" && (modal.customer.status === "blocked" ? "Unblock Customer" : "Enable Customer")}
              </h2>
              <button onClick={() => { setModal(null); setBlockReason(""); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-medium">{modal.customer.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{modal.customer.name}</p>
                  <p className="text-xs text-gray-500">{modal.customer.email}</p>
                </div>
              </div>

              {modal.type === "disable" && (
                <p className="text-sm text-gray-600">Are you sure you want to disable this customer? They will not be able to log in or place orders until you enable their account.</p>
              )}
              {modal.type === "block" && (
                <>
                  <p className="text-sm text-gray-600">Are you sure you want to block this customer? They will not be able to access their account or place orders until you unblock them.</p>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Reason for blocking (optional)</label>
                    <textarea
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Enter reason..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>
                </>
              )}
              {modal.type === "enable" && (
                <p className="text-sm text-gray-600">
                  {modal.customer.status === "blocked"
                    ? "Are you sure you want to unblock this customer? They will be able to access their account and place orders again."
                    : "Are you sure you want to enable this customer? They will be able to log in and place orders again."}
                </p>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => { setModal(null); setBlockReason(""); }}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50 ${
                  modal.type === "enable"
                    ? "bg-green-600 hover:bg-green-700"
                    : modal.type === "block"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {actionLoading ? "Processing..." : (
                  modal.type === "disable" ? "Disable Customer" :
                  modal.type === "block" ? "Block Customer" :
                  modal.customer.status === "blocked" ? "Unblock Customer" : "Enable Customer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
