"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Loader2, Package, Search, MoreVertical, X, Trash2, Edit, TrendingUp, DollarSign, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

interface Item {
  id: number;
  itemName: string;
  rate: number;
  unit: string;
}

export default function ItemsPage() {
  const { hasPermission, user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newItem, setNewItem] = useState({
    itemName: "",
    rate: 0,
    unit: ""
  });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchItems = async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    try {
      setLoading(true);
      const response = await api.post("/items/all", {
        page: 0,
        size: 100
      }, { signal });

      if (signal?.aborted) return;

      const responseData = response.data;
      if (Array.isArray(responseData)) {
        setItems(responseData);
      } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
        setItems(responseData.data);
      } else if (responseData && responseData.content && Array.isArray(responseData.content)) {
        setItems(responseData.content);
      } else if (responseData && responseData.data && responseData.data.content && Array.isArray(responseData.data.content)) {
        setItems(responseData.data.content);
      } else {
        setItems([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError' && error.message !== 'canceled') {
        console.error("Failed to fetch items data", error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    
    const loadData = async () => {
      if (!isMounted) return;
      
      try {
        await fetchItems(abortController.signal);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError' && error.message !== 'canceled' && isMounted) {
          console.error("Failed to load items data", error);
        }
      }
    };
    
    if (user && hasPermission("item_view")) {
      loadData();
    } else {
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [user]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post("/items/add", newItem);
      setShowCreateModal(false);
      setNewItem({ itemName: "", rate: 0, unit: "" });
      fetchItems();
    } catch (error) {
      console.error("Failed to create item", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-100">
      <div className="px-4 py-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Item Master</h1>
              <p className="text-slate-600 mt-1">Manage product catalog and pricing units.</p>
            </div>
            <div className="flex gap-3">
              {hasPermission("item_create") && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-md"
                >
                  <Plus className="h-5 w-5" />
                  Add New Item
                </button>
              )}
            </div>
          </div>
        </motion.div>

      {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Total Items</div>
            <div className="text-3xl font-bold text-violet-700">{items.length}</div>
            <div className="text-xs text-slate-500 mt-1">Product catalog</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Average Price</div>
            <div className="text-3xl font-bold text-violet-600">
              {items.length > 0 
                ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
                    items.reduce((sum, item) => sum + item.rate, 0) / items.length
                  )
                : '₹0'
              }
            </div>
            <div className="text-xs text-violet-600 mt-1">Per unit</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Unique Units</div>
            <div className="text-3xl font-bold text-violet-600">
              {new Set(items.map(item => item.unit)).size}
            </div>
            <div className="text-xs text-violet-600 mt-1">Measurement types</div>
          </div>
        </div>

      {!hasPermission("item_view") ? (
        <div className="max-w-4xl bg-white/70 backdrop-blur-xl rounded-2xl border border-violet-200 p-12 text-center shadow-lg">
          <Package className="h-16 w-16 text-violet-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-violet-900">Access Denied</h3>
          <p className="text-violet-700 mt-2">You don't have permission to view the item master.</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800">Catalog List</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm w-full sm:w-72"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-600 font-semibold tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3 text-left">Item Details</th>
                  <th className="px-6 py-3 text-left">Price / Rate</th>
                  <th className="px-6 py-3 text-left">Unit</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto" />
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic">
                      {searchQuery ? "No items found matching your search." : "No items found."}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {item.itemName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{item.itemName}</p>
                            <p className="text-xs text-slate-500">ID: {item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-violet-600">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.rate)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission("item_edit") && (
                            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all">
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission("item_delete") && (
                            <button className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-violet-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add New Catalog Item</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Wire"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    value={newItem.rate || ""}
                    onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KG"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
