"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Factory, TrendingUp, DollarSign, Plus, CheckCircle, XCircle, Clock, Eye, Edit, Calculator, Settings, Loader2, Users } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface ProductionItem {
  id: number;
  name: string;
  code: string;
  rate: number;
  unit: string;
  description: string;
  status: 'active' | 'inactive';
}

interface ProductionEntry {
  id: number;
  employeeId: number;
  employeeName: string;
  itemId: number;
  itemName: string;
  quantity: number;
  rate: number;
  totalPayment: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  comments?: string;
}

export default function ProductionPage() {
  const { hasPermission, isSuperAdmin } = useAuth();
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [productionEntries, setProductionEntries] = useState<ProductionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [newEntry, setNewEntry] = useState({
    employeeId: "",
    itemId: "",
    quantity: 0
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const employeesFetchedRef = useRef(false);

  useEffect(() => {
    console.log("useEffect running, current ref value:", employeesFetchedRef.current);
    
    // Prevent multiple API calls - set flag immediately
    if (employeesFetchedRef.current) {
      console.log("Employees already fetched, skipping API call");
      return;
    }
    
    console.log("Setting ref to true and proceeding with API call");
    employeesFetchedRef.current = true; // Set immediately to prevent duplicate calls

    const fetchEmployees = async () => {
      console.log("Starting fetchEmployees function");
      setEmployeesLoading(true);
      try {
        console.log("Making API call to /user/all");
        const response = await api.post("/user/all");
        
        // Extract user data from the nested response structure
        const userData = response.data?.data || [];
        const employeeData = Array.isArray(userData) ? userData : [];
        
        setEmployees(employeeData);
        console.log("Employees fetched from API:", employeeData);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        // Fallback to mock data if API fails
        setEmployees([
          { id: 1, firstName: "John", lastName: "Doe" },
          { id: 2, firstName: "Sarah", lastName: "Connor" },
          { id: 3, firstName: "Mike", lastName: "Ross" },
        ]);
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();

    // Mock data for demonstration
    const mockItems: ProductionItem[] = [
      {
        id: 1,
        name: "Center Rula",
        code: "CR-001",
        rate: 80,
        unit: "pieces",
        description: "Central component for main assembly",
        status: "active"
      },
      {
        id: 2,
        name: "Cut Rula",
        code: "CR-002",
        rate: 180,
        unit: "pieces",
        description: "Cutting component for sub-assembly",
        status: "active"
      },
      {
        id: 3,
        name: "Dabbi Set",
        code: "CR-003",
        rate: 280,
        unit: "sets",
        description: "Complete set for final assembly",
        status: "active"
      }
    ];

    const mockEntries: ProductionEntry[] = [
      {
        id: 1,
        employeeId: 1,
        employeeName: "John Doe",
        itemId: 1,
        itemName: "Center Rula",
        quantity: 45,
        rate: 80,
        totalPayment: 3600,
        date: "2024-01-15",
        status: "approved",
        submittedDate: "2024-01-15",
        approvedBy: "Sarah Manager",
        approvedDate: "2024-01-15"
      },
      {
        id: 2,
        employeeId: 2,
        employeeName: "Sarah Connor",
        itemId: 2,
        itemName: "Cut Rula",
        quantity: 25,
        rate: 180,
        totalPayment: 4500,
        date: "2024-01-15",
        status: "pending",
        submittedDate: "2024-01-15"
      },
      {
        id: 3,
        employeeId: 3,
        employeeName: "Mike Ross",
        itemId: 3,
        itemName: "Dabbi Set",
        quantity: 12,
        rate: 280,
        totalPayment: 3360,
        date: "2024-01-15",
        status: "rejected",
        submittedDate: "2024-01-15",
        comments: "Quantity does not match physical output",
        approvedBy: "Sarah Manager",
        approvedDate: "2024-01-16"
      }
    ];

    setProductionItems(mockItems);
    setProductionEntries(mockEntries);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      // Mock API call - replace with actual API
      const payload = {
        employeeId: Number(newEntry.employeeId) || undefined,
        itemId: Number(newEntry.itemId) || undefined,
        quantity: Number(newEntry.quantity),
        date: new Date().toISOString().split('T')[0],
      };
      
      console.log('Creating production entry:', payload);
      
      // Reset form
      setNewEntry({ employeeId: "", itemId: "", quantity: 0 });
      setShowEntryModal(false);
    } catch (error) {
      console.error("Failed to create production entry", error);
    } finally {
      setCreateLoading(false);
    }
  };

  if (!hasPermission("production_view")) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <div className="text-center">
          <Factory className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view production tracking.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-8 relative min-h-screen">
      {/* Beautiful Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, .02) 25%, rgba(0, 0, 0, .02) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .02) 75%, rgba(0, 0, 0, .02) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, .02) 25%, rgba(0, 0, 0, .02) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .02) 75%, rgba(0, 0, 0, .02) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200"
      >
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tight text-black">
            Production Tracking
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">Monitor piece-rate production and earnings</p>
        </div>
        <div className="flex items-center gap-4">
          {isSuperAdmin() && (
            <motion.button 
              className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-medium text-gray-700 border border-gray-300 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300"
              onClick={() => setShowItemModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="h-4 w-4" />
              Item Master
            </motion.button>
          )}
          <motion.button 
            className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-full px-6 py-3 text-sm font-medium shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-gray-500/40 transition-all duration-300"
            onClick={() => setShowEntryModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4" />
            Log Production
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Stats Grid with Glassmorphism */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Items"
          value={productionItems.length.toString()}
          change={`${productionItems.filter(item => item.status === 'active').length} active`}
          icon={Package}
          color="bg-violet-500 text-white shadow-violet-500/50"
          gradient="bg-gradient-to-br from-violet-50 via-white to-purple-50 border-violet-200"
          delay={0.1}
        />
        <StatCard
          title="Today's Production"
          value={productionEntries.filter((e: ProductionEntry) => e.date === '2024-01-15').length.toString()}
          change="+15% from yesterday"
          icon={Factory}
          color="bg-blue-500 text-white shadow-blue-500/50"
          gradient="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200"
          delay={0.2}
        />
        <StatCard
          title="Pending Approval"
          value={productionEntries.filter((e: ProductionEntry) => e.status === 'pending').length.toString()}
          change="2 entries"
          icon={Clock}
          color="bg-amber-500 text-white shadow-amber-500/50"
          gradient="bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-200"
          delay={0.3}
        />
        <StatCard
          title="Total Earnings"
          value={formatCurrency(productionEntries.filter((e: ProductionEntry) => e.status === 'approved').reduce((sum: number, e: ProductionEntry) => sum + e.totalPayment, 0))}
          change="+8% from last week"
          icon={DollarSign}
          color="bg-emerald-500 text-white shadow-emerald-500/50"
          gradient="bg-gradient-to-br from-emerald-50 via-white to-green-50 border-emerald-200"
          delay={0.4}
        />
      </div>

      {/* Production Items (Admin Only) */}
      {isSuperAdmin() && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative overflow-hidden group"
        >
          <div className="bg-gradient-to-br from-white/70 via-gray-50/30 to-gray-50/30 rounded-3xl p-8 border border-gray-200/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 via-transparent to-gray-400/5"></div>
            <motion.div
              animate={{ rotate: 180 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-gray-400/20 to-gray-400/20 rounded-full blur-3xl"
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-black">Item Master</h3>
                <motion.button 
                  className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-full px-4 py-2 text-sm font-medium shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-gray-500/40 transition-all duration-300"
                  onClick={() => setShowItemModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </motion.button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/30">
                    <th className="text-left p-4 font-semibold text-black">Item Code</th>
                    <th className="text-left p-4 font-semibold text-black">Name</th>
                    <th className="text-left p-4 font-semibold text-black">Rate</th>
                    <th className="text-left p-4 font-semibold text-black">Unit</th>
                    <th className="text-left p-4 font-semibold text-black">Status</th>
                    <th className="text-left p-4 font-semibold text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productionItems.map((item: ProductionItem, index: number) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="border-b border-violet-200/20 hover:bg-violet-50/20 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-sm font-mono text-violet-600">{item.code}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-lg font-bold text-emerald-600">{formatCurrency(item.rate)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-violet-600">{item.unit}</span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border",
                          item.status === 'active' 
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-red-400 bg-red-500/10 border-red-500/20'
                        )}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Production Entries */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative overflow-hidden group"
      >
        <div className="bg-gradient-to-br from-white/70 via-gray-50/30 to-gray-50/30 rounded-3xl p-8 border border-gray-200/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 via-transparent to-gray-400/5"></div>
          <motion.div
            animate={{ rotate: 180 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-gray-400/20 to-gray-400/20 rounded-full blur-3xl"
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">Production Entries</h3>
              <div className="flex items-center gap-4">
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <motion.button 
                  className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <Calculator className="h-4 w-4" />
                  Calculate Total
                </motion.button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/30">
                  <th className="text-left p-4 font-semibold text-black">Employee</th>
                  <th className="text-left p-4 font-semibold text-black">Item</th>
                  <th className="text-left p-4 font-semibold text-black">Quantity</th>
                  <th className="text-left p-4 font-semibold text-black">Rate</th>
                  <th className="text-left p-4 font-semibold text-black">Total Payment</th>
                  <th className="text-left p-4 font-semibold text-black">Date</th>
                  <th className="text-left p-4 font-semibold text-black">Status</th>
                  <th className="text-left p-4 font-semibold text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productionEntries
                  .filter((entry: ProductionEntry) => !selectedStatus || entry.status === selectedStatus)
                  .map((entry: ProductionEntry, index: number) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="border-b border-violet-200/20 hover:bg-violet-50/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {entry.employeeName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{entry.employeeName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-semibold text-gray-800">{entry.itemName}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-lg font-bold text-blue-400">{entry.quantity}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(entry.rate)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-lg font-bold text-purple-400">{formatCurrency(entry.totalPayment)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">{entry.date}</span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <span className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border",
                        getStatusColor(entry.status)
                      )}>
                        {entry.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                        {entry.status === 'rejected' && <XCircle className="h-3 w-3" />}
                        {entry.status === 'pending' && <Clock className="h-3 w-3" />}
                        {entry.status.toUpperCase()}
                      </span>
                      {entry.approvedBy && (
                        <div className="text-xs text-gray-500">
                          by {entry.approvedBy} on {entry.approvedDate}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                      {entry.status === 'pending' && (
                        <motion.button
                          className="p-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </motion.div>

      {/* Production Summary */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative overflow-hidden group"
      >
        <div className="bg-gradient-to-br from-white/70 via-gray-50/30 to-gray-50/30 rounded-3xl p-8 border border-gray-200/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 via-transparent to-gray-400/5"></div>
          <motion.div
            animate={{ rotate: 180 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-gray-400/20 to-gray-400/20 rounded-full blur-3xl"
          />
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-black mb-6">Production Summary</h3>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">Today's Overview</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/50 border border-gray-200/30">
                    <span className="text-sm text-gray-600">Total Entries</span>
                    <span className="text-lg font-bold text-blue-400">
                      {productionEntries.filter((e: ProductionEntry) => e.date === '2024-01-15').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/50 border border-gray-200/30">
                    <span className="text-sm text-gray-600">Pending Approval</span>
                    <span className="text-lg font-bold text-amber-400">
                      {productionEntries.filter((e: ProductionEntry) => e.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/50 border border-gray-200/30">
                    <span className="text-sm text-gray-600">Total Payment</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrency(
                        productionEntries
                          .filter((e: ProductionEntry) => e.status === 'approved')
                          .reduce((sum: number, e: ProductionEntry) => sum + e.totalPayment, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">Top Performers</h4>
                {[
                  { name: "John Doe", items: 45, payment: 3600 },
                  { name: "Sarah Connor", items: 32, payment: 5760 },
                  { name: "Mike Ross", items: 28, payment: 3360 },
                ].map((performer, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/50 border border-gray-200/30">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{performer.name}</p>
                      <p className="text-xs text-gray-600">{performer.items} items</p>
                    </div>
                    <span className="text-sm font-bold text-purple-400">{formatCurrency(performer.payment)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Production Entry Modal */}
      <AnimatePresence>
        {showEntryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl max-w-lg w-full mx-4 shadow-2xl border border-gray-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                      <Factory className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black">Log Production Entry</h3>
                      <p className="text-sm text-gray-600">Record piece-rate production data</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowEntryModal(false)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Employee Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Users className="w-4 h-4" />
                      Employee
                    </label>
                    <div className="relative">
                      <select
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300 appearance-none cursor-pointer pr-10"
                        value={newEntry.employeeId}
                        onChange={(e) => setNewEntry({ ...newEntry, employeeId: e.target.value })}
                        style={{
                          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          backgroundSize: '16px'
                        }}
                      >
                        <option value="" className="text-gray-500">👤 Select Employee...</option>
                        {Array.isArray(employees) && employees.map((emp) => (
                          <option key={emp.id} value={emp.id} className="py-2">
                            {emp.employeeResponseDto ?
                              `👨‍💼 ${emp.employeeResponseDto.firstName} ${emp.employeeResponseDto.lastName} (${emp.employeeResponseDto.department || 'No Dept'})` :
                              `👤 ${emp.username || emp.email || `User ${emp.id}`}`}
                          </option>
                        ))}
                      </select>

                      {/* Selected employee indicator */}
                      {newEntry.employeeId && Array.isArray(employees) && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Item Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Package className="w-4 h-4" />
                      Production Item
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      value={newEntry.itemId}
                      onChange={(e) => setNewEntry({ ...newEntry, itemId: e.target.value })}
                    >
                      <option value="">Select Item...</option>
                      {productionItems.map((item: ProductionItem) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.code}) - {formatCurrency(item.rate)}/{item.unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Quantity Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calculator className="w-4 h-4" />
                      Quantity
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                        placeholder="Enter quantity..."
                        value={newEntry.quantity || ""}
                        onChange={(e) => setNewEntry({ ...newEntry, quantity: parseFloat(e.target.value) })}
                      />
                      {newEntry.itemId && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                          {productionItems.find(item => item.id === Number(newEntry.itemId))?.unit || 'pieces'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview Section */}
                  {newEntry.employeeId && newEntry.itemId && newEntry.quantity && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employee:</span>
                          <span className="font-medium text-gray-900">
                            {(() => {
                              const emp = Array.isArray(employees) ? employees.find(emp => emp.id === Number(newEntry.employeeId)) : null;
                              return emp ? (emp.employeeResponseDto ? 
                                `${emp.employeeResponseDto.firstName} ${emp.employeeResponseDto.lastName}` : 
                                emp.username || emp.email || `User ${emp.id}`) : 'Unknown Employee';
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Item:</span>
                          <span className="font-medium text-gray-900">
                            {productionItems.find(item => item.id === Number(newEntry.itemId))?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate:</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(productionItems.find(item => item.id === Number(newEntry.itemId))?.rate || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-lg text-emerald-600">
                            {formatCurrency((productionItems.find(item => item.id === Number(newEntry.itemId))?.rate || 0) * newEntry.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <motion.button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {createLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Save Entry
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
