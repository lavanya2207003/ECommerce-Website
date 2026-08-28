import { useState, useEffect } from "react";
import { adminAPI } from "../services/api";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getCategories();
      const enriched = await Promise.all(
        data.categories.map(async (cat) => {
          const products = await adminAPI.getProducts({ category: cat, limit: 1 });
          return { name: cat, productCount: products.total };
        })
      );
      setCategories(enriched);
    } catch (err) {
      console.error("Fetch categories error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const name = newCategory.toLowerCase().trim();
    if (categories.find((c) => c.name === name)) {
      alert("Category already exists");
      return;
    }
    setCategories([...categories, { name, productCount: 0 }]);
    setNewCategory("");
  };

  const handleDeleteCategory = (name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setCategories(categories.filter((c) => c.name !== name));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500 mt-1">Manage product categories</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            placeholder="Category name (e.g. womens-dress)"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm"
          >
            Add Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">All Categories ({categories.length})</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No categories found</div>
          ) : (
            categories.map((cat) => (
              <div key={cat.name} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    {editCategory === cat.name ? (
                      <input
                        type="text"
                        defaultValue={cat.name}
                        onBlur={(e) => { setEditCategory(null); }}
                        onKeyDown={(e) => { if (e.key === "Enter") setEditCategory(null); }}
                        className="px-2 py-1 border border-gray-200 rounded text-sm"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 capitalize">{cat.name}</p>
                    )}
                    <p className="text-xs text-gray-500">{cat.productCount} products</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditCategory(cat.name)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDeleteCategory(cat.name)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
