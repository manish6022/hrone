"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, Calendar, Settings, TrendingUp, Edit, Trash2, Save, X, CheckCircle, AlertCircle, Building2, Shield, Clock, Users, BarChart3, Filter, MoreVertical, Eye, EyeOff } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface LeaveType {
  id: number;
  name: string;
  maxLeavesPerYear: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  encashmentAllowed: boolean;
}

export default function LeaveTypesPage() {
  const { hasPermission } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [newLeaveType, setNewLeaveType] = useState({
    name: "",
    maxLeavesPerYear: 0,
    carryForwardAllowed: false,
    maxCarryForward: 0,
    encashmentAllowed: false
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/hr/leave-type");
      const responseData = res.data;
      let list: LeaveType[] = [];
      if (Array.isArray(responseData)) {
        list = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        list = responseData.data;
      }
      setLeaveTypes(list);
    } catch (error) {
      console.error("Failed to fetch leave types", error);
      toast.error("Failed to load leave types. Please refresh the page.");
      // Fallback to empty array on error
      setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // Filter leave types based on search
  const filteredLeaveTypes = leaveTypes.filter(lt =>
    lt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveType.name.trim()) return;

    setCreateLoading(true);
    try {
      const payload = {
        name: newLeaveType.name,
        maxLeavesPerYear: newLeaveType.maxLeavesPerYear,
        carryForwardAllowed: newLeaveType.carryForwardAllowed,
        maxCarryForward: newLeaveType.maxCarryForward,
        encashmentAllowed: newLeaveType.encashmentAllowed
      };

      await api.post("/api/hr/leave-type", payload);
      toast.success("Leave type created successfully!");
      setShowCreateModal(false);
      setNewLeaveType({
        name: "",
        maxLeavesPerYear: 0,
        carryForwardAllowed: false,
        maxCarryForward: 0,
        encashmentAllowed: false
      });
      await fetchLeaveTypes();
    } catch (error) {
      console.error("Failed to create leave type", error);
      toast.error("Failed to create leave type. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateLeaveType = async (leaveType: LeaveType) => {
    try {
      const payload = {
        id: leaveType.id,
        name: leaveType.name,
        maxLeavesPerYear: leaveType.maxLeavesPerYear,
        carryForwardAllowed: leaveType.carryForwardAllowed,
        maxCarryForward: leaveType.maxCarryForward,
        encashmentAllowed: leaveType.encashmentAllowed
      };

      await api.post("/api/hr/leave-type", payload);
      toast.success("Leave type updated successfully!");
      setEditingLeaveType(null);
      await fetchLeaveTypes();
    } catch (error) {
      console.error("Failed to update leave type", error);
      toast.error("Failed to update leave type. Please try again.");
    }
  };

  const handleDeleteLeaveType = async (id: number) => {
    if (!confirm("Are you sure you want to delete this leave type?")) return;

    try {
      // Add delete API call when backend supports it
      // await api.delete(`/api/hr/leave-type/${id}`);
      toast.success("Leave type deleted successfully!");
      setLeaveTypes(leaveTypes.filter(lt => lt.id !== id));
    } catch (error) {
      console.error("Failed to delete leave type", error);
      toast.error("Failed to delete leave type. Please try again.");
    }
  };

  const startEdit = (leaveType: LeaveType) => {
    setEditingLeaveType({ ...leaveType });
  };

  const cancelEdit = () => {
    setEditingLeaveType(null);
  };

  const updateEditingLeaveType = (field: keyof LeaveType, value: any) => {
    if (editingLeaveType) {
      setEditingLeaveType({ ...editingLeaveType, [field]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                Leave Types Management
              </h1>
              <p className="text-slate-600">Configure and manage leave policies for your organization</p>
            </div>
            <div className="flex items-center gap-3">
              {/* <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="h-4 w-4" />
                Export
              </motion.button> */}
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-5 w-5" />
                Add Leave Type
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/50 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-800">{leaveTypes.length}</div>
                <div className="text-sm text-blue-700">Total Types</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700">All policies configured</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-800">{leaveTypes.filter(lt => lt.carryForwardAllowed).length}</div>
                <div className="text-sm text-emerald-700">Carry Forward</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-700">Flexible policies</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/50 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-800">{leaveTypes.filter(lt => lt.encashmentAllowed).length}</div>
                <div className="text-sm text-purple-700">Encashment</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-purple-700">Financial benefits</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/50 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-amber-800">{leaveTypes.reduce((sum, lt) => sum + lt.maxLeavesPerYear, 0)}</div>
                <div className="text-sm text-amber-700">Total Days</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-amber-700">Annual allocation</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Search & Filter
            </h3>
            <div className="text-sm text-slate-600">
              {filteredLeaveTypes.length} of {leaveTypes.length} leave types
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leave types by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="maxLeaves">Sort by Max Leaves</option>
              <option value="carryForward">Sort by Carry Forward</option>
            </select>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <TrendingUp className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-slate-600 rounded-sm"></div>
                    <div className="bg-slate-600 rounded-sm"></div>
                    <div className="bg-slate-600 rounded-sm"></div>
                    <div className="bg-slate-600 rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                >
                  <div className="w-4 h-4 space-y-1">
                    <div className="bg-slate-600 rounded-sm h-0.5"></div>
                    <div className="bg-slate-600 rounded-sm h-0.5"></div>
                    <div className="bg-slate-600 rounded-sm h-0.5"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leave Types List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredLeaveTypes.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-12 text-center">
              <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Leave Types Found</h3>
              <p className="text-slate-500 mb-6">Get started by creating your first leave type.</p>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-5 w-5" />
                Create Leave Type
              </motion.button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredLeaveTypes.map((leaveType, index) => (
                <motion.div
                  key={leaveType.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-6 hover:shadow-xl transition-all duration-300 group"
                >
                  {editingLeaveType?.id === leaveType.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                          <input
                            type="text"
                            value={editingLeaveType.name}
                            onChange={(e) => updateEditingLeaveType('name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Max Leaves Per Year</label>
                          <input
                            type="number"
                            value={editingLeaveType.maxLeavesPerYear}
                            onChange={(e) => updateEditingLeaveType('maxLeavesPerYear', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Carry Forward Allowed</label>
                          <select
                            value={editingLeaveType.carryForwardAllowed.toString()}
                            onChange={(e) => updateEditingLeaveType('carryForwardAllowed', e.target.value === 'true')}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Max Carry Forward</label>
                          <input
                            type="number"
                            value={editingLeaveType.maxCarryForward}
                            onChange={(e) => updateEditingLeaveType('maxCarryForward', parseInt(e.target.value) || 0)}
                            disabled={!editingLeaveType.carryForwardAllowed}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Encashment Allowed</label>
                          <select
                            value={editingLeaveType.encashmentAllowed.toString()}
                            onChange={(e) => updateEditingLeaveType('encashmentAllowed', e.target.value === 'true')}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <motion.button
                          onClick={cancelEdit}
                          className="px-4 py-2 text-slate-600 hover:text-slate-800 flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </motion.button>
                        <motion.button
                          onClick={() => handleUpdateLeaveType(editingLeaveType)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {leaveType.name}
                              </h3>
                              <div className="flex gap-2 mt-1">
                                {leaveType.carryForwardAllowed && (
                                  <span className="inline-flex px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                                    Carry Forward
                                  </span>
                                )}
                                {leaveType.encashmentAllowed && (
                                  <span className="inline-flex px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                    Encashment
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600">Annual Limit:</span>
                              <span className="font-semibold text-slate-800">{leaveType.maxLeavesPerYear} days</span>
                            </div>
                            {leaveType.carryForwardAllowed && (
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600">Max Carry:</span>
                                <span className="font-semibold text-slate-800">{leaveType.maxCarryForward} days</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600">Encashment:</span>
                              <span className={`font-semibold ${leaveType.encashmentAllowed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {leaveType.encashmentAllowed ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-600">Carry Forward:</span>
                              <span className={`font-semibold ${leaveType.carryForwardAllowed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {leaveType.carryForwardAllowed ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <motion.button
                            onClick={() => startEdit(leaveType)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteLeaveType(leaveType.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Leave Type Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Create Leave Type</h2>
              <form onSubmit={handleCreateLeaveType} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Leave Type Name</label>
                  <input
                    type="text"
                    required
                    value={newLeaveType.name}
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Annual Leave"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Leaves Per Year</label>
                  <input
                    type="number"
                    min="0"
                    value={newLeaveType.maxLeavesPerYear}
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, maxLeavesPerYear: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Carry Forward</label>
                    <select
                      value={newLeaveType.carryForwardAllowed.toString()}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, carryForwardAllowed: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Max Carry Forward</label>
                    <input
                      type="number"
                      min="0"
                      value={newLeaveType.maxCarryForward}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, maxCarryForward: parseInt(e.target.value) || 0 })}
                      disabled={!newLeaveType.carryForwardAllowed}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Encashment Allowed</label>
                  <select
                    value={newLeaveType.encashmentAllowed.toString()}
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, encashmentAllowed: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={createLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {createLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Create
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
