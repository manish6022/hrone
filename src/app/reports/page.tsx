"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, Users, DollarSign, Download, Filter, Calendar, Eye, FileText, PieChart } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface ReportData {
  id: number;
  name: string;
  value: number;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

interface AnalyticsData {
  department: string;
  employees: number;
  avgSalary: number;
  attendance: number;
  productivity: number;
}

export default function ReportsPage() {
  const { hasPermission } = useAuth();
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    // Mock data for demonstration
    const mockReports: ReportData[] = [
      { id: 1, name: "Total Revenue", value: 2450000, change: "+18% from last month", trend: 'up' },
      { id: 2, name: "Total Employees", value: 156, change: "+5% from last month", trend: 'up' },
      { id: 3, name: "Avg Attendance", value: 92.5, change: "+2% from last month", trend: 'up' },
      { id: 4, name: "Productivity Score", value: 87.3, change: "-1% from last month", trend: 'down' },
      { id: 5, name: "Attrition Rate", value: 2.1, change: "-0.5% from last month", trend: 'stable' },
    ];

    const mockAnalytics: AnalyticsData[] = [
      { department: "Engineering", employees: 45, avgSalary: 85000, attendance: 94, productivity: 91 },
      { department: "Marketing", employees: 28, avgSalary: 65000, attendance: 89, productivity: 86 },
      { department: "Sales", employees: 32, avgSalary: 72000, attendance: 93, productivity: 88 },
      { department: "HR", employees: 12, avgSalary: 58000, attendance: 96, productivity: 92 },
      { department: "Finance", employees: 18, avgSalary: 78000, attendance: 95, productivity: 85 },
    ];

    setReportData(mockReports);
    setAnalyticsData(mockAnalytics);
    setLoading(false);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Generating report...');
  };

  if (!hasPermission("view_reports")) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view reports and analytics.</p>
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
          <h2 className="text-4xl font-extrabold tracking-tight gradient-text">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 leading-relaxed">Comprehensive insights and data analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            className="btn-ghost"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </motion.button>
          <motion.button 
            className="btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </motion.button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5"
      >
        {reportData.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="floating-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10">
                  {metric.name.includes('Revenue') || metric.name.includes('Salary') ? <DollarSign className="h-4 w-4 text-indigo-400" /> : 
                   metric.name.includes('Employees') ? <Users className="h-4 w-4 text-indigo-400" /> : 
                   <BarChart3 className="h-4 w-4 text-indigo-400" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-400">{metric.name}</p>
                  <p className="text-xs text-gray-500">{metric.change}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(metric.trend)}
                <span className={`text-lg font-bold ${getTrendColor(metric.trend)}`}>
                  {metric.name.includes('Revenue') || metric.name.includes('Salary') ? formatCurrency(metric.value) : 
                   metric.name.includes('Attendance') || metric.name.includes('Productivity') ? `${metric.value}%` : 
                   metric.value.toString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Report Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">Report Period</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-premium w-full"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">Report Type</label>
            <select 
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="input-premium w-full"
            >
              <option value="overview">Overview</option>
              <option value="hr">HR Reports</option>
              <option value="payroll">Payroll Reports</option>
              <option value="attendance">Attendance Reports</option>
              <option value="performance">Performance Reports</option>
              <option value="custom">Custom Report</option>
            </select>
          </div>
          <div className="flex items-end">
            <motion.button 
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Generate Report
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Analytics Dashboard */}
      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="floating-card p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Department Analytics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 font-semibold text-gray-400">Department</th>
                  <th className="text-left p-4 font-semibold text-gray-400">Employees</th>
                  <th className="text-left p-4 font-semibold text-gray-400">Avg Salary</th>
                  <th className="text-left p-4 font-semibold text-gray-400">Attendance</th>
                  <th className="text-left p-4 font-semibold text-gray-400">Productivity</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map((dept, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-semibold text-white">{dept.department}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{dept.employees}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">{formatCurrency(dept.avgSalary)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">{dept.attendance}%</span>
                        <div className="w-20 bg-white/10 rounded-full h-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${dept.attendance}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                            className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">{dept.productivity}%</span>
                        <div className="w-20 bg-white/10 rounded-full h-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${dept.productivity}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                            className="h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="floating-card p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Employee Report", description: "Complete employee directory with details", icon: <Users className="h-6 w-6" /> },
              { title: "Payroll Summary", description: "Monthly payroll breakdown and analysis", icon: <DollarSign className="h-6 w-6" /> },
              { title: "Attendance Analysis", description: "Attendance patterns and trends", icon: <BarChart3 className="h-6 w-6" /> },
              { title: "Performance Review", description: "Employee performance metrics and reviews", icon: <FileText className="h-6 w-6" /> },
              { title: "Custom Report Builder", description: "Create custom reports with filters", icon: <PieChart className="h-6 w-6" /> },
            ].map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-left group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10">
                    {action.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Export Options */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="floating-card p-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">Export Options</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              { format: "PDF", description: "Portable document format", icon: <FileText className="h-5 w-5" /> },
              { format: "Excel", description: "Spreadsheet for analysis", icon: <BarChart3 className="h-5 w-5" /> },
              { format: "CSV", description: "Data for integration", icon: <PieChart className="h-5 w-5" /> },
              { format: "JSON", description: "API-friendly format", icon: <FileText className="h-5 w-5" /> },
            ].map((exportOption, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 rounded-xl bg-indigo-500/10">
                  {exportOption.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">{exportOption.format}</p>
                  <p className="text-xs text-gray-500">{exportOption.description}</p>
                </div>
                <Download className="h-4 w-4 text-gray-400" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
