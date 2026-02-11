"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Loader2, CheckSquare, Shield, ShieldAlert, MoreVertical, X, Search, Edit, Trash2, Users, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

interface Role {
  id: number;
  name: string;
  privileges?: { id: number; name: string }[];
}

interface Privilege {
  id: number;
  name: string;
}

export default function RolesPage() {
  const { hasPermission, user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: "" });
  const [assignState, setAssignState] = useState({ roleId: 0, privilegeIds: [] as number[] });
  const [createLoading, setCreateLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRoles = async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    try {
      setLoading(true);
      const res = await api.post("/user/all-role", {}, { signal });
      
      if (signal?.aborted) return;
      
      const d = res.data;
      let list: Role[] = [];
      if (Array.isArray(d)) list = d;
      else if (d && Array.isArray(d.data)) list = d.data;
      setRoles(list);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError' && err.message !== 'canceled') {
        console.error("Failed to fetch roles", err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const fetchPrivileges = async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    try {
      const res = await api.post("/user/all-privilage", {}, { signal });
      
      if (signal?.aborted) return;
      
      const d = res.data;
      let list: Privilege[] = [];
      if (Array.isArray(d)) list = d;
      else if (d && Array.isArray(d.data)) list = d.data;
      setPrivileges(list);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError' && err.message !== 'canceled') {
        console.error("Failed to fetch privileges", err);
      }
    }
  };

  const fetchRolePrivilegeAssignments = async (signal?: AbortSignal) => {
    // This endpoint is not available, skipping for now
    console.log("Role-privilege mapping endpoint skipped");
  };

  const fetchRolePrivilegeMapping = async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    try {
      const res = await api.post("/user/all-role-privilage", {}, { signal });
      
      if (signal?.aborted) return;
      
      const d = res.data;
      console.log("Role-privilege API response:", d);
      
      let list: Role[] = [];
      if (Array.isArray(d)) {
        list = d;
      } else if (d && Array.isArray(d.data)) {
        list = d.data;
      } else if (d && Array.isArray(d.content)) {
        list = d.content;
      }
      
      console.log("Processed roles list:", list);
      setRoles(list);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError' && err.message !== 'canceled') {
        console.error("Failed to fetch role-privilege mapping", err);
      }
    }
  };

  useEffect(() => {
    if (user && hasPermission("role_view")) {
      const abortController = new AbortController();
      
      const loadData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchRolePrivilegeMapping(abortController.signal),
            fetchPrivileges(abortController.signal)
          ]);
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError' && error.message !== 'canceled') {
            console.error("Failed to load roles data", error);
          }
        } finally {
          if (!abortController.signal.aborted) {
            setLoading(false);
          }
        }
      };
      
      loadData();
      
      return () => {
        abortController.abort();
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post("/user/create-role", { name: newRole.name });
      setShowCreateModal(false);
      setNewRole({ name: "" });
      await fetchRolePrivilegeMapping();
    } catch (err) {
      console.error("Failed to create role", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAssignPrivileges = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      await api.post("/user/assign-privilage", {
        roleId: assignState.roleId,
        privilegeIds: assignState.privilegeIds,
      });
      setShowAssignModal(false);
      setAssignState({ roleId: 0, privilegeIds: [] });
      // Refresh the roles data
      await fetchRolePrivilegeMapping();
    } catch (err) {
      console.error("Failed to assign privileges", err);
    } finally {
      setAssignLoading(false);
    }
  };

  // Filter roles based on search
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!hasPermission("role_view")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-100 flex items-center justify-center px-4">
        <div className="max-w-4xl bg-white/70 backdrop-blur-xl rounded-2xl border border-violet-200 p-12 text-center shadow-lg">
          <ShieldAlert className="h-16 w-16 text-violet-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-violet-900">Access Denied</h3>
          <p className="text-violet-700 mt-2">You don't have permission to view roles.</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold text-slate-800">Role Management</h1>
              <p className="text-slate-600 mt-1">Configure user roles and associated privileges.</p>
            </div>
            <div className="flex gap-3">
              {hasPermission("privilege_assign") && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-violet-300 text-violet-700 rounded-xl font-semibold hover:bg-violet-50 transition-all"
                >
                  <CheckSquare className="h-5 w-5" />
                  Assign Privileges
                </button>
              )}
              {hasPermission("role_create") && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-md"
                >
                  <Plus className="h-5 w-5" />
                  Create Role
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Total Roles</div>
            <div className="text-3xl font-bold text-violet-700">{roles.length}</div>
            <div className="text-xs text-slate-500 mt-1">System roles</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Total Privileges</div>
            <div className="text-3xl font-bold text-violet-600">{privileges.length}</div>
            <div className="text-xs text-violet-600 mt-1">Available permissions</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Active Assignments</div>
            <div className="text-3xl font-bold text-violet-600">
              {roles.reduce((sum, role) => sum + (role.privileges?.length || 0), 0)}
            </div>
            <div className="text-xs text-violet-600 mt-1">Role-privilege links</div>
          </div>
        </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800">Roles & Permissions</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search roles..."
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
                  <th className="px-6 py-3 text-left">Role Name</th>
                  <th className="px-6 py-3 text-left">Defined Privileges</th>
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
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-500 italic">
                      {searchQuery ? "No roles found matching your search." : "No roles created yet."}
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role) => (
                    <motion.tr 
                      key={role.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-violet-100 text-violet-600 border border-violet-200">
                            <Shield className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-slate-800">{role.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {(role.privileges || []).length === 0 ? (
                            <span className="text-xs text-slate-500 italic">No Privileges Assigned</span>
                          ) : (
                            (role.privileges || []).map((p) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center rounded-lg bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700 border border-violet-200"
                              >
                                {p.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission("role_edit") && (
                            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all">
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission("role_delete") && (
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

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-violet-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">New System Role</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Manager"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ name: e.target.value })}
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
                  {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Privileges Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-2xl border border-violet-200 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Attach Privileges</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignPrivileges} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Role</label>
                <select
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  value={assignState.roleId}
                  onChange={(e) => setAssignState({ ...assignState, roleId: Number(e.target.value) })}
                >
                  <option value={0}>Select role...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Privileges Map</label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                  {privileges.map((p) => {
                    const checked = assignState.privilegeIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={cn(
                          "relative flex items-center justify-between cursor-pointer p-3 rounded-lg border transition-all duration-200",
                          checked ? "bg-violet-50 border-violet-300" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        <span className={cn("text-sm font-medium", checked ? "text-violet-700" : "text-slate-700")}>{p.name}</span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...assignState.privilegeIds, p.id]
                              : assignState.privilegeIds.filter((id) => id !== p.id);
                            setAssignState({ ...assignState, privilegeIds: next });
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {assignLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    Finalize Changes
                  </>
                )}
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
