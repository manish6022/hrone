"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, UserPlus, Users, Shield, Zap, TrendingUp, MoreVertical, Building2, DollarSign, ArrowUpRight, MoreHorizontal, LucideIcon, ShieldAlert, Filter, Mail, ChevronLeft, ChevronRight, List, Grid, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  roles: Array<string | { id: number; name: string; privileges?: any[] }>;
  employeeResponseDto?: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    department: string;
    designation: string;
    joiningDate: string;
  };
}

export default function UsersPage() {
  const { hasPermission, user, isHR, isSuperAdmin, isManager, isRegularUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [assignState, setAssignState] = useState({ userId: 0, roleId: 0 });
  const [managerAssignState, setManagerAssignState] = useState({ userId: 0, managerId: 0 });
  const [assignLoading, setAssignLoading] = useState(false);
  const [managerAssignLoading, setManagerAssignLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchUsers = async (page = 1, signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    try {
      setLoading(true);
      const response = await api.post("/user/all", { page, limit: 10 }, { signal });
      
      if (signal?.aborted) return;
      
      const responseData = response.data;
      if (Array.isArray(responseData)) {
        setUsers(responseData);
        setTotalPages(1);
      } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
        setUsers(responseData.data);
        setTotalPages(responseData.totalPages || 1);
      } else {
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError' && error.message !== 'canceled') {
        console.error("Failed to fetch users", error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const fetchRoles = async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    try {
      const res = await api.post("/user/all-role", {}, { signal });
      
      if (signal?.aborted) return;
      
      const d = res.data;
      let list: { id: number; name: string }[] = [];
      if (Array.isArray(d)) list = d;
      else if (d && Array.isArray(d.data)) list = d.data;
      setRoles(list);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError' && err.message !== 'canceled') {
        console.error("Failed to fetch roles", err);
      }
    }
  };

  useEffect(() => {
    if (user && hasPermission("view_users")) {
      const abortController = new AbortController();
      
      const loadData = async () => {
        try {
          await Promise.all([
            fetchUsers(currentPage, abortController.signal),
            fetchRoles(abortController.signal)
          ]);
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError' && error.message !== 'canceled') {
            console.error("Failed to load users data", error);
          }
        }
      };
      
      loadData();
      
      return () => {
        abortController.abort();
      };
    }
  }, [user, currentPage]);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assignState.userId === 0 || assignState.roleId === 0) return;

    setAssignLoading(true);
    try {
      await api.post("/user/assign-role", {
        userId: assignState.userId,
        roleId: assignState.roleId,
      });
      setAssignState({ userId: 0, roleId: 0 });
      await fetchUsers(currentPage);
    } catch (error) {
      console.error("Failed to assign role", error);
      alert("Failed to assign role");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (managerAssignState.userId === 0 || managerAssignState.managerId === 0) return;

    setManagerAssignLoading(true);
    try {
      await api.post("/user/assign-manager", {
        userId: managerAssignState.userId,
        managerId: managerAssignState.managerId,
      });
      setManagerAssignState({ userId: 0, managerId: 0 });
      await fetchUsers(currentPage);
    } catch (error) {
      console.error("Failed to assign manager", error);
      alert("Failed to assign manager");
    } finally {
      setManagerAssignLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.roles.some(role => (typeof role === 'string' ? role : role.name) === selectedRole);
    return matchesSearch && matchesRole;
  });

  if (!hasPermission("view_users")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-6 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">
          You don't have the required permissions to view or manage system users.
          Please contact your administrator if you believe this is an error.
        </p>
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
          transition={{ duration: 0.6 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
              <p className="text-slate-600 mt-1">Manage system access and team member profiles.</p>
            </div>
            {(isHR() || isSuperAdmin()) && (
              <Link href="/users/create">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-md">
                  <Plus className="w-5 h-5" />
                  <span>Add User</span>
                </button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 border border-white/50 shadow-md mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'roles', label: 'Roles & Permissions', icon: Shield },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-violet-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200 rounded-xl p-4 shadow-md">
                <div className="text-sm text-slate-600 mb-1">Total Users</div>
                <div className="text-3xl font-bold text-violet-700">{users.length}</div>
                <div className="text-xs text-violet-600 mt-1">Registered accounts</div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-xl p-4 shadow-md">
                <div className="text-sm text-slate-600 mb-1">Active Now</div>
                <div className="text-3xl font-bold text-blue-600">{filteredUsers.length}</div>
                <div className="text-xs text-blue-600 mt-1">Currently online</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-md">
                <div className="text-sm text-slate-600 mb-1">Roles</div>
                <div className="text-3xl font-bold text-emerald-600">{roles.length}</div>
                <div className="text-xs text-emerald-600 mt-1">Available</div>
              </div>
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 rounded-xl p-4 shadow-md">
                <div className="text-sm text-slate-600 mb-1">New This Month</div>
                <div className="text-3xl font-bold text-amber-600">3</div>
                <div className="text-xs text-amber-600 mt-1">Recent additions</div>
              </div>
            </div>

      {/* Quick Role Assignment */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-6 mb-6"
            >
          <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-violet-100 text-violet-600 border border-violet-200">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800">Quick Role Assignment</h3>
              </div>
              <form onSubmit={handleAssignRole} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select User</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    value={assignState.userId}
                    onChange={(e) => setAssignState({ ...assignState, userId: Number(e.target.value) })}
                  >
                    <option value={0}>Choose user...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Role</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    value={assignState.roleId}
                    onChange={(e) => setAssignState({ ...assignState, roleId: Number(e.target.value) })}
                  >
                    <option value={0}>Choose role...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={assignLoading || assignState.userId === 0 || assignState.roleId === 0}
                  className="w-full rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {assignLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Assign
                    </>
                  )}
                </button>
              </form>
            </motion.div>

        {/* Quick Manager Assignment */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-6 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800">Quick Manager Assignment</h3>
              </div>
              <form onSubmit={handleAssignManager} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select User</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={managerAssignState.userId}
                    onChange={(e) => setManagerAssignState({ ...managerAssignState, userId: Number(e.target.value) })}
                  >
                    <option value={0}>Choose user...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.employeeResponseDto ? 
                          `${u.employeeResponseDto.firstName} ${u.employeeResponseDto.lastName}` : 
                          u.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Select Manager</label>
                  <select
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={managerAssignState.managerId}
                    onChange={(e) => setManagerAssignState({ ...managerAssignState, managerId: Number(e.target.value) })}
                  >
                    <option value={0}>Choose manager...</option>
                    {users.filter(u => u.roles.some(r => (typeof r === 'string' ? r : r.name) === 'Manager')).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.employeeResponseDto ? 
                          `${u.employeeResponseDto.firstName} ${u.employeeResponseDto.lastName}` : 
                          u.username}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={managerAssignLoading || managerAssignState.userId === 0 || managerAssignState.managerId === 0}
                  className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {managerAssignLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      Assign Manager
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Search and Filter */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-4 mb-6"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 w-full"
                    />
                  </div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="all">All Roles</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Users Display */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
                  <p className="text-slate-500">No users found matching your criteria.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredUsers.map((user) => (
                    <motion.div 
                      key={user.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16 border-2 border-violet-200 shadow-lg">
                            <AvatarImage src="" alt={user.username} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-violet-600 text-white text-lg font-bold">
                              {user.employeeResponseDto ? 
                                `${user.employeeResponseDto.firstName.charAt(0)}${user.employeeResponseDto.lastName.charAt(0)}` :
                                user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <button className="text-slate-500 hover:text-slate-700 transition">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>

                      <h3 className="font-semibold text-lg text-slate-800 mb-1">
                        {user.employeeResponseDto ? 
                          `${user.employeeResponseDto.firstName} ${user.employeeResponseDto.lastName}` : 
                          user.username}
                      </h3>
                      <p className="text-slate-600 text-sm mb-1">{user.roles.map(r => typeof r === 'string' ? r : r.name).join(', ')}</p>
                      <p className="text-slate-500 text-xs mb-4">ID: {user.id}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.employeeResponseDto?.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="w-4 h-4 flex items-center justify-center text-xs">📞</span>
                            <span>{user.employeeResponseDto.phone}</span>
                          </div>
                        )}
                        {user.employeeResponseDto?.joiningDate && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="w-4 h-4 flex items-center justify-center text-xs">📅</span>
                            <span>Joined {formatDate(user.employeeResponseDto.joiningDate)}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {user.employeeResponseDto?.department || user.employeeResponseDto?.designation || 'User'}
                        </span>
                        <button className="text-sm text-violet-600 hover:text-violet-800 transition font-medium">
                          View Profile
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 overflow-hidden shadow-md">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Joining Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Roles</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredUsers.map((user) => (
                        <motion.tr 
                          key={user.id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="relative">
                                <Avatar className="w-10 h-10 border border-violet-200 shadow-sm">
                                  <AvatarImage src="" alt={user.username} />
                                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-violet-600 text-white text-sm font-bold">
                                    {user.employeeResponseDto ? 
                                      `${user.employeeResponseDto.firstName.charAt(0)}${user.employeeResponseDto.lastName.charAt(0)}` :
                                      user.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                  user.enabled ? 'bg-green-400' : 'bg-red-400'
                                }`}></div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-slate-800">
                                  {user.employeeResponseDto ? 
                                    `${user.employeeResponseDto.firstName} ${user.employeeResponseDto.lastName}` : 
                                    user.username}
                                </div>
                                <div className="text-sm text-slate-500">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600">{user.employeeResponseDto?.phone || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600">
                              {user.employeeResponseDto?.joiningDate ? 
                                formatDate(user.employeeResponseDto.joiningDate) : 
                                '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600">{user.roles.map(r => typeof r === 'string' ? r : r.name).join(', ')}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.enabled 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.enabled ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button className="text-violet-600 hover:text-violet-900 transition">
                                View Profile
                              </button>
                              <button className="text-slate-500 hover:text-slate-700 transition">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Pagination */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 flex justify-start"
            >
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm border rounded-md transition ${
                      currentPage === page 
                        ? 'bg-violet-600 text-white border-violet-600' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </motion.div>

          </motion.div>
        )}

        {/* ROLES & PERMISSIONS TAB */}
        {activeTab === 'roles' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-8 text-center">
              <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Roles & Permissions Management</h3>
              <p className="text-slate-600">Role and permission management features coming soon.</p>
            </div>
          </motion.div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-8 text-center">
              <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">User Reports & Analytics</h3>
              <p className="text-slate-600">User analytics and reporting features coming soon.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
