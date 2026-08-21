import { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

export default function Reports() {
  const [reportType, setReportType] = useState("sales");
  const [period, setPeriod] = useState("30days");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (reportType === "sales") {
        const res = await adminAPI.getSalesHistory(period, 1, 100);
        setData(res.orders);
        setStats({ totalRevenue: res.totalRevenue, totalOrders: res.total });
      } else if (reportType === "products") {
        const res = await adminAPI.getProducts({ limit: 100 });
        setData(res.products);
      } else if (reportType === "customers") {
        const res = await adminAPI.getCustomers({ limit: 100 });
        setData(res.customers);
      } else if (reportType === "orders") {
        const res = await adminAPI.getOrders({ limit: 100 });
        setData(res.orders);
      } else if (reportType === "inventory") {
        const res = await adminAPI.getProducts({ limit: 100 });
        setData(res.products);
      }
    } catch (err) {
      console.error("Fetch report error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, period]);

  const exportCSV = () => {
    if (data.length === 0) return;

    let csvContent = "";
    if (reportType === "sales") {
      csvContent = "Order ID,Customer,Amount,Payment Status,Order Status,Date\n";
      data.forEach((o) => {
        csvContent += `${o.order_id},${o.customer_details?.name || "N/A"},${o.amount},${o.payment_status},${o.order_status},${new Date(o.created_at).toLocaleDateString()}\n`;
      });
    } else if (reportType === "products") {
      csvContent = "Name,SKU,Category,Brand,Price,Discount %,Stock,Status\n";
      data.forEach((p) => {
        csvContent += `${p.name},${p.sku || "N/A"},${p.category},${p.brand},${p.price},${p.discount_percent},${p.stock},${p.is_active ? "Active" : "Disabled"}\n`;
      });
    } else if (reportType === "customers") {
      csvContent = "Name,Email,Phone,Total Orders,Total Spent,Registered\n";
      data.forEach((c) => {
        csvContent += `${c.name},${c.email},${c.phone || "N/A"},${c.total_orders},${c.total_spent},${new Date(c.registration_date).toLocaleDateString()}\n`;
      });
    } else if (reportType === "orders") {
      csvContent = "Order ID,Customer,Products,Amount,Payment Status,Order Status,Date\n";
      data.forEach((o) => {
        csvContent += `${o.order_id},${o.customer_details?.name || "N/A"},${o.ordered_products?.length || 0},${o.amount},${o.payment_status},${o.order_status},${new Date(o.created_at).toLocaleDateString()}\n`;
      });
    } else if (reportType === "inventory") {
      csvContent = "Name,SKU,Category,Stock,Status,Last Updated\n";
      data.forEach((p) => {
        csvContent += `${p.name},${p.sku || "N/A"},${p.category},${p.stock},${p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "In Stock"},${new Date(p.updatedAt).toLocaleDateString()}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    let html = `<html><head><meta charset="utf-8"><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#dc2626;color:white}</style></head><body><table>`;

    if (reportType === "sales") {
      html += "<tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr>";
      data.forEach((o) => {
        html += `<tr><td>${o.order_id}</td><td>${o.customer_details?.name || "N/A"}</td><td>INR ${o.amount}</td><td>${o.payment_status}</td><td>${o.order_status}</td><td>${new Date(o.created_at).toLocaleDateString()}</td></tr>`;
      });
    } else if (reportType === "products") {
      html += "<tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr>";
      data.forEach((p) => {
        html += `<tr><td>${p.name}</td><td>${p.sku || "N/A"}</td><td>${p.category}</td><td>INR ${p.price}</td><td>${p.stock}</td><td>${p.is_active ? "Active" : "Disabled"}</td></tr>`;
      });
    } else if (reportType === "customers") {
      html += "<tr><th>Name</th><th>Email</th><th>Orders</th><th>Spent</th><th>Registered</th></tr>";
      data.forEach((c) => {
        html += `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.total_orders}</td><td>INR ${c.total_spent}</td><td>${new Date(c.registration_date).toLocaleDateString()}</td></tr>`;
      });
    }

    html += "</table></body></html>";
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().split("T")[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    let html = `
      <html>
        <head>
          <title>LayaStore - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #dc2626; margin-bottom: 5px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #dc2626; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>LayaStore - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
          <p class="meta">Generated on: ${new Date().toLocaleString()}</p>
          <table>`;

    if (reportType === "sales") {
      html += "<thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>";
      data.forEach((o) => {
        html += `<tr><td>${o.order_id}</td><td>${o.customer_details?.name || "N/A"}</td><td>INR ${o.amount}</td><td>${o.order_status}</td><td>${new Date(o.created_at).toLocaleDateString()}</td></tr>`;
      });
    } else if (reportType === "products") {
      html += "<thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead><tbody>";
      data.forEach((p) => {
        html += `<tr><td>${p.name}</td><td>${p.sku || "N/A"}</td><td>${p.category}</td><td>INR ${p.price}</td><td>${p.stock}</td></tr>`;
      });
    } else if (reportType === "customers") {
      html += "<thead><tr><th>Name</th><th>Email</th><th>Orders</th><th>Spent</th></tr></thead><tbody>";
      data.forEach((c) => {
        html += `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.total_orders}</td><td>INR ${c.total_spent}</td></tr>`;
      });
    }

    html += "</tbody></table></body></html>";
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const reportTypes = [
    { value: "sales", label: "Sales Report" },
    { value: "products", label: "Products Report" },
    { value: "customers", label: "Customers Report" },
    { value: "orders", label: "Orders Report" },
    { value: "inventory", label: "Inventory Report" },
  ];

  const periods = [
    { value: "today", label: "Today" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "monthly", label: "This Month" },
    { value: "yearly", label: "This Year" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Generate and export detailed reports</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {reportTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {reportType === "sales" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={exportCSV} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button onClick={exportExcel} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button onClick={exportPDF} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {stats && reportType === "sales" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">INR {stats.totalRevenue?.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {reportTypes.find((t) => t.value === reportType)?.label}
          </h3>
        </div>
        <div className="overflow-x-auto">
          {reportType === "sales" && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (<tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>) : data.length === 0 ? (<tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No data</td></tr>) : data.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{o.order_id?.substring(0, 12)}...</td>
                    <td className="px-4 py-3 text-sm">{o.customer_details?.name}</td>
                    <td className="px-4 py-3 text-sm font-medium">INR {o.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${o.payment_status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{o.payment_status}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${o.order_status === "delivered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{o.order_status}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {reportType === "products" && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (<tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>) : data.length === 0 ? (<tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No data</td></tr>) : data.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-sm font-mono">{p.sku || "-"}</td>
                    <td className="px-4 py-3 text-sm capitalize">{p.category}</td>
                    <td className="px-4 py-3 text-sm font-medium">INR {p.price?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{p.stock}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{p.is_active ? "Active" : "Disabled"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {reportType === "customers" && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (<tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>) : data.length === 0 ? (<tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No data</td></tr>) : data.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-sm">{c.email}</td>
                    <td className="px-4 py-3 text-sm">{c.phone || "-"}</td>
                    <td className="px-4 py-3 text-sm">{c.total_orders}</td>
                    <td className="px-4 py-3 text-sm font-medium">INR {c.total_spent?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.registration_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {reportType === "orders" && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (<tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>) : data.length === 0 ? (<tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No data</td></tr>) : data.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{o.order_id?.substring(0, 12)}...</td>
                    <td className="px-4 py-3 text-sm">{o.customer_details?.name}</td>
                    <td className="px-4 py-3 text-sm font-medium">INR {o.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${o.order_status === "delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{o.order_status}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {reportType === "inventory" && (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (<tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>) : data.length === 0 ? (<tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No data</td></tr>) : data.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-sm font-mono">{p.sku || "-"}</td>
                    <td className="px-4 py-3 text-sm capitalize">{p.category}</td>
                    <td className="px-4 py-3 text-sm font-medium">{p.stock}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= 5 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{p.stock === 0 ? "Out" : p.stock <= 5 ? "Low" : "OK"}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
