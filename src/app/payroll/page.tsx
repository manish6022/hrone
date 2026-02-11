"use client";

import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, FileText, Download, Calculator, Settings, Plus, Eye, Edit, CheckCircle, Search, Filter, Calendar, Building2, BarChart3, MoreVertical, ArrowUpRight, X } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Custom CSS to hide scrollbar while maintaining scroll functionality
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  month: string;
  basic: number;
  hra: number;
  da: number;
  bonus: number;
  allowances: number;
  deductions: number;
  tds: number;
  pf: number;
  esi: number;
  netSalary: number;
  status: 'draft' | 'processed' | 'paid';
  processedDate?: string;
}

interface SalaryComponent {
  name: string;
  amount: number;
  type: 'earning' | 'deduction';
  isPercentage?: boolean;
}

export default function PayrollPage() {
  const { hasPermission } = useAuth();
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollRecord | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockPayroll: PayrollRecord[] = [
      {
        id: 1,
        employeeId: 1,
        employeeName: "John Doe",
        department: "Engineering",
        month: "2024-01",
        basic: 50000,
        hra: 15000,
        da: 5000,
        bonus: 8000,
        allowances: 3000,
        deductions: 2000,
        tds: 5000,
        pf: 6000,
        esi: 1500,
        netSalary: 59500,
        status: "processed",
        processedDate: "2024-01-31"
      },
      {
        id: 2,
        employeeId: 2,
        employeeName: "Sarah Connor",
        department: "Marketing",
        month: "2024-01",
        basic: 45000,
        hra: 13500,
        da: 4500,
        bonus: 6000,
        allowances: 2500,
        deductions: 1500,
        tds: 4000,
        pf: 5400,
        esi: 1350,
        netSalary: 53250,
        status: "paid",
        processedDate: "2024-01-30"
      }
    ];
    setPayrollRecords(mockPayroll);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'paid': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      case 'draft': return 'text-amber-600 bg-amber-100 border-amber-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
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

  const handleViewEmployee = (employee: PayrollRecord) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const getEmployeeSalaryComponents = (employee: PayrollRecord) => {
    const earnings = [
      { name: 'Basic Salary', amount: employee.basic, type: 'earning' },
      { name: 'House Rent Allowance', amount: employee.hra, type: 'earning' },
      { name: 'Dearness Allowance', amount: employee.da, type: 'earning' },
      { name: 'Performance Bonus', amount: employee.bonus, type: 'earning' },
      { name: 'Other Allowances', amount: employee.allowances, type: 'earning' },
    ];
    
    const deductions = [
      { name: 'Provident Fund', amount: employee.pf, type: 'deduction' },
      { name: 'ESI', amount: employee.esi, type: 'deduction' },
      { name: 'Professional Tax', amount: 0, type: 'deduction' },
      { name: 'TDS', amount: employee.tds, type: 'deduction' },
      { name: 'Other Deductions', amount: employee.deductions, type: 'deduction' },
    ];
    
    return { earnings, deductions };
  };

  if (!hasPermission("view_payroll")) {
    return (
      <>
        <style>{scrollbarHideStyle}</style>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6"
        >
          <div className="text-center">
            <Calculator className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h3>
            <p className="text-slate-600">You don't have permission to view payroll management.</p>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <style>{scrollbarHideStyle}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                Payroll Management
              </h1>
              <p className="text-slate-600">Process salaries and manage compensation efficiently</p>
            </div>
            {/* <div className="flex items-center gap-3">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="h-4 w-4" />
                Export
              </motion.button>
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="h-4 w-4" />
                Salary Structure
              </motion.button>
              <motion.button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Calculator className="h-5 w-5" />
                Process Payroll
              </motion.button>
            </div> */}
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
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/50 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-800">{formatCurrency(payrollRecords.reduce((sum, record) => sum + record.netSalary, 0))}</div>
                <div className="text-sm text-emerald-700">Total Payroll</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-emerald-700">+18% from last month</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-800">{payrollRecords.filter(r => r.status === 'paid').length}</div>
                <div className="text-sm text-blue-700">Employees Paid</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700">+5% from last month</span>
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
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-800">{formatCurrency(Math.round(payrollRecords.reduce((sum, record) => sum + record.netSalary, 0) / payrollRecords.length))}</div>
                <div className="text-sm text-purple-700">Avg. Salary</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-purple-700">+8% from last month</span>
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
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-amber-800">{payrollRecords.filter(r => r.status === 'draft').length}</div>
                <div className="text-sm text-amber-700">Pending Process</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-amber-700">2 pending approval</span>
            </div>
          </motion.div>
        </motion.div>

      {/* Enhanced Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-600" />
              Search & Filter
            </h3>
            <div className="text-sm text-slate-600">
              {payrollRecords.length} payroll records
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by employee name or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
              <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500">
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="salary">Sort by Salary</option>
                <option value="status">Sort by Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <ArrowUpRight className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 ml-auto">
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
        </motion.div>

      {/* Enhanced Payroll Records */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Payroll Records
              </h3>
              <motion.button 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="h-4 w-4" />
                Export
              </motion.button>
            </div>
          </div>
          
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-semibold text-slate-600">Employee</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Basic</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Allowances</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Deductions</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Net Salary</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                            {record.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{record.employeeName}</p>
                            <p className="text-xs text-slate-500">{record.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-700 font-mono">{formatCurrency(record.basic)}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-600">
                          <div>HRA: {formatCurrency(record.hra)}</div>
                          <div>DA: {formatCurrency(record.da)}</div>
                          <div>Bonus: {formatCurrency(record.bonus)}</div>
                          <div>Other: {formatCurrency(record.allowances)}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-600">
                          <div>TDS: {formatCurrency(record.tds)}</div>
                          <div>PF: {formatCurrency(record.pf)}</div>
                          <div>ESI: {formatCurrency(record.esi)}</div>
                          <div>Other: {formatCurrency(record.deductions)}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-lg font-bold text-emerald-600">{formatCurrency(record.netSalary)}</span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border",
                          getStatusColor(record.status)
                        )}>
                          {record.status === 'paid' && <CheckCircle className="h-3 w-3" />}
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewEmployee(record)}
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          {record.status === 'draft' && (
                            <motion.button
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {payrollRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-lg font-bold">
                        {record.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">{record.employeeName}</h3>
                        <p className="text-sm text-slate-500">{record.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewEmployee(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                      {record.status === 'draft' && (
                        <motion.button
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Basic Salary</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(record.basic)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Net Salary</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(record.netSalary)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">HRA</span>
                        <span className="text-slate-700">{formatCurrency(record.hra)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">DA</span>
                        <span className="text-slate-700">{formatCurrency(record.da)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Bonus</span>
                        <span className="text-slate-700">{formatCurrency(record.bonus)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Allowances</span>
                        <span className="text-slate-700">{formatCurrency(record.allowances)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">TDS</span>
                        <span className="text-slate-700">{formatCurrency(record.tds)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">PF</span>
                        <span className="text-slate-700">{formatCurrency(record.pf)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">ESI</span>
                        <span className="text-slate-700">{formatCurrency(record.esi)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Other Deductions</span>
                        <span className="text-slate-700">{formatCurrency(record.deductions)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200">
                    <span className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(record.status)
                    )}>
                      {record.status === 'paid' && <CheckCircle className="h-3 w-3" />}
                      {record.status.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      {/* Enhanced Salary Breakdown */}
        {/* <div className="grid gap-6 lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-8 scrollbar-hide"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              Salary Structure
            </h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-600">Earnings</h4>
                {[
                  { name: 'Basic Salary', amount: 50000, type: 'earning' },
                  { name: 'House Rent Allowance', amount: 15000, type: 'earning' },
                  { name: 'Dearness Allowance', amount: 5000, type: 'earning' },
                  { name: 'Performance Bonus', amount: 8000, type: 'earning' },
                  { name: 'Other Allowances', amount: 3000, type: 'earning' },
                ].map((component, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-sm text-slate-700">{component.name}</span>
                    <span className="text-sm font-medium text-emerald-700">{formatCurrency(component.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-600">Deductions</h4>
                {[
                  { name: 'Provident Fund', amount: 6000, type: 'deduction' },
                  { name: 'ESI', amount: 1500, type: 'deduction' },
                  { name: 'Professional Tax', amount: 5000, type: 'deduction' },
                  { name: 'TDS', amount: 5000, type: 'deduction' },
                  { name: 'Other Deductions', amount: 2000, type: 'deduction' },
                ].map((component, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-red-50 border border-red-200">
                    <span className="text-sm text-slate-700">{component.name}</span>
                    <span className="text-sm font-medium text-red-700">{formatCurrency(component.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md p-8 scrollbar-hide"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Payroll Summary
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Gross Earnings</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {formatCurrency(81000)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Total Deductions</span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(19500)}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Net Salary</span>
                    <span className="text-xl font-bold text-slate-800">
                      {formatCurrency(61500)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Processing Date</div>
                  <div className="text-sm text-slate-700">Jan 31, 2024</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Payment Mode</div>
                  <div className="text-sm text-slate-700">Bank Transfer</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div> */}
      </div>

      {/* Employee Salary Structure Modal */}
      {showEmployeeModal && selectedEmployee && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEmployeeModal(false)}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Calculator className="h-6 w-6 text-emerald-600" />
                </div>
                {selectedEmployee.employeeName}'s Salary Structure
              </h3>
              <button 
                onClick={() => { setShowEmployeeModal(false); setSelectedEmployee(null); }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Earnings and Deductions Side by Side */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Earnings Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      Earnings
                    </h4>
                    <div className="space-y-3">
                      {getEmployeeSalaryComponents(selectedEmployee).earnings.map((component, index) => (
                        <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-sm text-slate-700">{component.name}</span>
                          <span className="text-sm font-medium text-emerald-700">{formatCurrency(component.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deductions Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-red-600" />
                      Deductions
                    </h4>
                    <div className="space-y-3">
                      {getEmployeeSalaryComponents(selectedEmployee).deductions.map((component, index) => (
                        <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-red-50 border border-red-200">
                          <span className="text-sm text-slate-700">{component.name}</span>
                          <span className="text-sm font-medium text-red-700">{formatCurrency(component.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payroll Summary at Bottom */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Payroll Summary
                  </h4>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Gross Earnings</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {formatCurrency(selectedEmployee.basic + selectedEmployee.hra + selectedEmployee.da + selectedEmployee.bonus + selectedEmployee.allowances)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">Total Deductions</span>
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(selectedEmployee.tds + selectedEmployee.pf + selectedEmployee.esi + selectedEmployee.deductions)}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Net Salary</span>
                        <span className="text-xl font-bold text-slate-800">
                          {formatCurrency(selectedEmployee.netSalary)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">Processing Date</div>
                      <div className="text-sm text-slate-700">{selectedEmployee.processedDate || 'Pending'}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">Payment Mode</div>
                      <div className="text-sm text-slate-700">Bank Transfer</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">Status</div>
                      <span className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border",
                        getStatusColor(selectedEmployee.status)
                      )}>
                        {selectedEmployee.status === 'paid' && <CheckCircle className="h-3 w-3" />}
                        {selectedEmployee.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
    </>
  );
}
