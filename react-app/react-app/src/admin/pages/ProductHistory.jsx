import { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

export default function ProductHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const data = await adminAPI.getProductHistory(page, 20);
      setHistory(data.history);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getActionColor = (action) => {
    const colors = {
      created: "bg-green-100 text-green-700",
      updated: "bg-blue-100 text-blue-700",
      deleted: "bg-red-100 text-red-700",
      stock_updated: "bg-yellow-100 text-yellow-700",
      price_updated: "bg-purple-100 text-purple-700",
      status_changed: "bg-gray-100 text-gray-700",
    };
    return colors[action] || "bg-gray-100 text-gray-700";
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "created": return "M12 4v16m8-8H4";
      case "updated": return "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z";
      case "deleted": return "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16";
      case "stock_updated": return "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2";
      case "price_updated": return "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
      default: return "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product History</h1>
        <p className="text-gray-500 mt-1">Track every change made to products</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Activity Log ({pagination.total})</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No history yet</div>
          ) : (
            history.map((entry) => (
              <div key={entry._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getActionIcon(entry.action)} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getActionColor(entry.action)}`}>
                        {entry.action.replace("_", " ")}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{entry.product_name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>By: {entry.admin_name}</span>
                      <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                    {entry.previous_value && entry.new_value && (
                      <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                        <span className="text-red-500">{JSON.stringify(entry.previous_value)}</span>
                        <span className="mx-2">→</span>
                        <span className="text-green-500">{JSON.stringify(entry.new_value)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchHistory(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <button onClick={() => fetchHistory(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
