import { useState, useEffect, useCallback } from "react";
import { adminAPI } from "../services/api";
import ImageWithFallback from "../../components/ImageWithFallback";

const PAYMENT_METHODS = ["Razorpay", "UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet", "Cash on Delivery"];
const PAYMENT_STATUSES = ["pending", "completed", "failed", "cancelled"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount_high", label: "Amount: High to Low" },
  { value: "amount_low", label: "Amount: Low to High" },
];

function getStatusColor(status) {
  const colors = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

function getMethodIcon(method) {
  if (!method) return "💳";
  const m = method.toLowerCase();
  if (m.includes("razorpay")) return "⚡";
  if (m.includes("upi")) return "📱";
  if (m.includes("credit")) return "💳";
  if (m.includes("debit")) return "💳";
  if (m.includes("net")) return "🏦";
  if (m.includes("wallet")) return "👛";
  if (m.includes("cod") || m.includes("cash")) return "💵";
  return "💳";
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sortBy };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (minAmount) params.minAmount = minAmount;
      if (maxAmount) params.maxAmount = maxAmount;

      const data = await adminAPI.getPayments(params);
      setPayments(data.payments);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      console.error("Fetch payments error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, methodFilter, sortBy, startDate, endDate, minAmount, maxAmount]);

  const fetchStats = async () => {
    try {
      const data = await adminAPI.getPaymentStats();
      setStats(data);
    } catch (err) {
      console.error("Fetch payment stats error:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const handleRefund = async (paymentId) => {
    if (!window.confirm("Are you sure you want to refund this payment?")) return;
    setRefundLoading(true);
    try {
      await adminAPI.refundPayment(paymentId);
      fetchPayments(pagination.page);
      fetchStats();
      if (selectedPayment?._id === paymentId) {
        setSelectedPayment({ ...selectedPayment, payment_status: "cancelled", order_status: "cancelled" });
      }
    } catch (err) {
      alert("Error refunding payment: " + err.message);
    } finally {
      setRefundLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setMethodFilter("");
    setSortBy("newest");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
  };

  const statCards = stats
    ? [
        { label: "Total Payments", value: stats.total, icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", color: "bg-blue-500" },
        { label: "Successful", value: stats.successful, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-green-500" },
        { label: "Pending", value: stats.pending, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-yellow-500" },
        { label: "Failed", value: stats.failed, icon: "M6 18L18 6M6 6l12 12", color: "bg-red-500" },
        { label: "Refunded", value: stats.refunded, icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6", color: "bg-gray-500" },
        { label: "Total Revenue", value: `INR ${(stats.totalRevenue || 0).toLocaleString()}`, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-emerald-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-500 mt-1">{pagination.total} payments total</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                <p className="text-lg font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by Payment ID, Order ID, Customer..."
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
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex gap-2 items-center">
              <label className="text-xs text-gray-500">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs text-gray-500">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-xs text-gray-500">Amount:</label>
              <input
                type="number"
                placeholder="Min"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {(search || statusFilter || methodFilter || startDate || endDate || minAmount || maxAmount || sortBy !== "newest") && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full hidden md:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-12 text-center text-gray-400">No payments found</td></tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPayment(payment)}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{payment.razorpay_payment_id?.substring(0, 16) || "N/A"}...</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{payment.order_id?.substring(0, 12) || "N/A"}...</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{payment.customer_details?.name || "N/A"}</p>
                      <p className="text-xs text-gray-500">{payment.customer_details?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">INR {payment.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{getMethodIcon(payment.payment_method)} {payment.payment_method || "N/A"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.payment_status)}`}>
                        {payment.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment); }}
                        className="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="md:hidden p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No payments found</div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment._id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100 cursor-pointer"
                  onClick={() => setSelectedPayment(payment)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{payment.razorpay_payment_id?.substring(0, 16) || "N/A"}...</p>
                      <p className="text-xs text-gray-500">{payment.customer_details?.name || "N/A"}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${getStatusColor(payment.payment_status)}`}>
                      {payment.payment_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span>{getMethodIcon(payment.payment_method)} {payment.payment_method || "N/A"}</span>
                    <span>•</span>
                    <span className="font-medium text-gray-900">₹{payment.amount?.toLocaleString()}</span>
                    <span>•</span>
                    <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 truncate">{payment.order_id?.substring(0, 16)}...</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedPayment(payment); }}
                      className="px-3 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchPayments(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <button onClick={() => fetchPayments(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
              <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedPayment.payment_status)}`}>
                  {selectedPayment.payment_status}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{getMethodIcon(selectedPayment.payment_method)} {selectedPayment.payment_method || "N/A"}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Payment ID</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{selectedPayment.razorpay_payment_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{selectedPayment.order_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Transaction ID</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{selectedPayment.razorpay_order_id || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Gateway</p>
                  <p className="text-sm font-medium text-gray-900">Razorpay</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedPayment.customer_details?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedPayment.customer_details?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedPayment.customer_details?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date & Time</p>
                    <p className="text-sm font-medium text-gray-900">{new Date(selectedPayment.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedPayment.delivery_address && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Billing / Delivery Address</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    <p>{selectedPayment.delivery_address.full_name}</p>
                    <p>{selectedPayment.delivery_address.house_flat} {selectedPayment.delivery_address.street}</p>
                    <p>{selectedPayment.delivery_address.area} {selectedPayment.delivery_address.landmark}</p>
                    <p>{selectedPayment.delivery_address.city}, {selectedPayment.delivery_address.district}</p>
                    <p>{selectedPayment.delivery_address.state} - {selectedPayment.delivery_address.pincode}</p>
                    <p>{selectedPayment.delivery_address.country}</p>
                  </div>
                </div>
              )}

              {selectedPayment.ordered_products && selectedPayment.ordered_products.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Ordered Products</h3>
                  <div className="space-y-2">
                    {selectedPayment.ordered_products.map((p, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          {p.image && (
                            <ImageWithFallback src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-500">
                              {p.brand && `${p.brand} • `}Qty: {p.quantity} {p.size && `• Size: ${p.size}`}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">INR {p.total_price?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total MRP</span>
                    <span className="text-gray-900">INR {(selectedPayment.price_breakdown?.total_mrp || selectedPayment.amount || 0).toLocaleString()}</span>
                  </div>
                  {selectedPayment.price_breakdown?.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-green-600">-INR {selectedPayment.price_breakdown.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedPayment.price_breakdown?.coupon_discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Coupon {selectedPayment.price_breakdown.coupon_code && `(${selectedPayment.price_breakdown.coupon_code})`}</span>
                      <span className="text-green-600">-INR {selectedPayment.price_breakdown.coupon_discount.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedPayment.price_breakdown?.delivery_charges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Delivery Charges</span>
                      <span className="text-gray-900">INR {selectedPayment.price_breakdown.delivery_charges.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedPayment.price_breakdown?.platform_fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Platform Fee</span>
                      <span className="text-gray-900">INR {selectedPayment.price_breakdown.platform_fee.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedPayment.price_breakdown?.gst_tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">GST / Tax</span>
                      <span className="text-gray-900">INR {selectedPayment.price_breakdown.gst_tax.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-semibold text-gray-900">Final Amount</span>
                    <span className="font-semibold text-gray-900">INR {(selectedPayment.price_breakdown?.final_amount || selectedPayment.amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => window.open(`/admin/orders`, "_self")}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  View Order
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Download / Print Receipt
                </button>
                {selectedPayment.payment_status === "completed" && (
                  <button
                    onClick={() => handleRefund(selectedPayment._id)}
                    disabled={refundLoading}
                    className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {refundLoading ? "Processing..." : "Refund Payment"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
