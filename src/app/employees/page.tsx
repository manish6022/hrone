"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, UserPlus, Edit, Trash2, Eye, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import api from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface Employee {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  roles: Array<string | { id: number; name: string }>;
  status: 'active' | 'inactive' | 'on_leave';
}

export default function EmployeesPage() {
  const { hasPermission, user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchEmployees = async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    try {
      setLoading(true);
      const response = await api.post("/user/all", {}, { signal });
      
      if (signal?.aborted) return;
      
      const responseData = response.data;
      if (Array.isArray(responseData)) {
        setEmployees(responseData);
      } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
        setEmployees(responseData.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError' && error.message !== 'canceled') {
        console.error("Failed to fetch employees", error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user && hasPermission("employee_view")) {
      const abortController = new AbortController();
      
      const loadData = async () => {
        try {
          await fetchEmployees(abortController.signal);
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError' && error.message !== 'canceled') {
            console.error("Failed to load employees data", error);
          }
        }
      };
      
      loadData();
      
      return () => {
        abortController.abort();
      };
    }
  }, [user]);

  const filteredEmployees = employees.filter(employee =>
    employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'inactive': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'on_leave': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const toggleEmployeeSelection = (id: number) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
    );
  };

  if (!hasPermission("view_users")) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view employee management.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tight gradient-text">Employee Management</h2>
          <p className="text-sm text-gray-500 leading-relaxed">Manage your workforce and organizational structure</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            className="btn-ghost"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </motion.button>
          <motion.button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={employees.length.toString()}
          change="+5% from last month"
          icon={UserPlus}
        />
        <StatCard
          title="Active Now"
          value={employees.filter(e => e.status === 'active').length.toString()}
          change="+2% from last week"
          icon={Eye}
        />
        <StatCard
          title="On Leave"
          value={employees.filter(e => e.status === 'on_leave').length.toString()}
          change="-1% from last week"
          icon={Calendar}
        />
        <StatCard
          title="Departments"
          value={new Set(employees.map(e => e.department).filter(Boolean)).size.toString()}
          change="No change"
          icon={MapPin}
        />
      </div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search employees by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium w-full pl-12"
            />
          </div>
          <div className="flex gap-2">
            <select className="input-premium">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
            <select className="input-premium">
              <option value="">All Departments</option>
              {[...new Set(employees.map(e => e.department).filter(Boolean))].map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Employees Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="floating-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-semibold text-gray-400">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees(filteredEmployees.map(emp => emp.id));
                      } else {
                        setSelectedEmployees([]);
                      }
                    }}
                    className="rounded border-white/10 bg-white/5"
                  />
                </th>
                <th className="text-left p-4 font-semibold text-gray-400">Employee</th>
                <th className="text-left p-4 font-semibold text-gray-400">Contact</th>
                <th className="text-left p-4 font-semibold text-gray-400">Department</th>
                <th className="text-left p-4 font-semibold text-gray-400">Status</th>
                <th className="text-left p-4 font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredEmployees.map((employee, index) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => toggleEmployeeSelection(employee.id)}
                        className="rounded border-white/10 bg-white/5"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{employee.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">{employee.department || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border",
                        getStatusColor(employee.status)
                      )}>
                        {employee.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {selectedEmployees.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 glass-card px-6 py-4 flex items-center gap-4 z-50"
        >
          <span className="text-sm text-gray-300">
            {selectedEmployees.length} employee{selectedEmployees.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <motion.button className="btn-ghost text-sm" whileHover={{ scale: 1.05 }}>
              Export
            </motion.button>
            <motion.button className="btn-ghost text-sm text-red-400" whileHover={{ scale: 1.05 }}>
              Delete
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
