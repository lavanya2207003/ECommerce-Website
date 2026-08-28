import { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchSales = async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminAPI.getSalesHistory(period, page, 15);
      setSales(data.orders);
      setTotalRevenue(data.totalRevenue);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      console.error("Fetch sales error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(1);
  }, [period]);

  const periods = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "monthly", label: "This Month" },
    { value: "yearly", label: "This Year" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
        <p className="text-gray-500 mt-1">Track your sales and revenue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Revenue (Filtered)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">INR {totalRevenue?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.total}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Avg. Order Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            INR {pagination.total > 0 ? Math.round(totalRevenue / pagination.total).toLocaleString() : 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Sales History</h3>
          <div className="flex flex-wrap gap-2">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${period === p.value ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-400">No sales found for this period</td></tr>
              ) : (
                sales.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.order_id?.substring(0, 12)}...</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.customer_details?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.ordered_products?.length || 0} item(s)</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">INR {order.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.payment_status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.order_status === "delivered" ? "bg-green-100 text-green-700" : order.order_status === "cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchSales(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <button onClick={() => fetchSales(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
