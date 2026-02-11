"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Loader2, Key, MoreVertical, X, ShieldAlert, Search, Filter, Edit, Trash2, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Privilege {
  id: number;
  name: string;
}

export default function PrivilegesPage() {
  const { hasPermission } = useAuth();
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPrivilege, setNewPrivilege] = useState({ name: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchPrivileges = async () => {
    try {
      setLoading(true);
      const res = await api.post("/user/all-privilage");
      const d = res.data;
      let list: Privilege[] = [];
      if (Array.isArray(d)) list = d;
      else if (d && Array.isArray(d.data)) list = d.data;
      setPrivileges(list);
    } finally {
      setLoading(false);
    }
  };

  // Filter privileges based on search
  const filteredPrivileges = privileges.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePrivilege = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this privilege?")) {
      try {
        await api.delete(`/user/privilege/${id}`);
        await fetchPrivileges();
      } catch (error) {
        console.error("Failed to delete privilege:", error);
      }
    }
  };

  useEffect(() => {
    fetchPrivileges();
  }, []);

  const handleCreatePrivilege = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post("/user/create-privilege", { name: newPrivilege.name });
      toast.success("Privilege created successfully!");
      setShowCreateModal(false);
      setNewPrivilege({ name: "" });
      await fetchPrivileges();
    } catch (error) {
      console.error("Failed to create privilege:", error);
      toast.error("Failed to create privilege. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-slate-800">Privilege Management</h1>
              <p className="text-slate-600 mt-1">Define and manage granular system permissions.</p>
            </div>
            <div className="flex gap-3">
              {hasPermission("privilege_create") && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-md"
                >
                  <Plus className="h-5 w-5" />
                  Create Privilege
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Total Privileges</div>
            <div className="text-3xl font-bold text-violet-700">{privileges.length}</div>
            <div className="text-xs text-slate-500 mt-1">System permissions</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Active Users</div>
            <div className="text-3xl font-bold text-violet-600">12</div>
            <div className="text-xs text-violet-600 mt-1">With permissions</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Roles Created</div>
            <div className="text-3xl font-bold text-violet-600">5</div>
            <div className="text-xs text-violet-600 mt-1">Custom roles</div>
          </div>
        </div>

      {!hasPermission("privilege_view") ? (
        <div className="max-w-4xl bg-white/70 backdrop-blur-xl rounded-2xl border border-violet-200 p-12 text-center shadow-lg">
          <ShieldAlert className="h-16 w-16 text-violet-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-violet-900">Access Denied</h3>
          <p className="text-violet-700 mt-2">You don't have permission to view privileges.</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800">System Privileges</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search privileges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <Filter className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-600 font-semibold tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3 text-left">Privilege Title</th>
                  <th className="px-6 py-3 text-left">Identifier</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto" />
                    </td>
                  </tr>
                ) : filteredPrivileges.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-500 italic">
                      {searchQuery ? "No privileges found matching your search." : "No privileges defined yet."}
                    </td>
                  </tr>
                ) : (
                  filteredPrivileges.map((p) => (
                    <motion.tr 
                      key={p.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-violet-100 text-violet-600 border border-violet-200">
                            <Key className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-slate-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">PRIV_{p.id}</code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission("privilege_edit") && (
                            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all">
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission("privilege_delete") && (
                            <button 
                              onClick={() => handleDeletePrivilege(p.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all"
                            >
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

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-violet-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">New Privilege</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrivilege} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Privilege Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAN_EDIT_USERS"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-mono"
                  value={newPrivilege.name}
                  onChange={(e) => setNewPrivilege({ name: e.target.value })}
                />
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
                  {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Privilege"}
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
