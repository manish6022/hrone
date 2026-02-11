"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, CheckCircle, XCircle, Clock, FileText, Plus, Save, X, Search, Filter,
  ChevronLeft, ChevronRight, MoreVertical, Edit3, Trash2, Send, History,
  ChevronDown, ChevronUp, Eye, CheckSquare, XSquare, Users, Briefcase,
  AlertCircle, Sun, Moon, Settings, Bell, UserCheck, BarChart3, PieChart,
  TrendingUp, Download, Upload, Printer, Mail, MessageSquare, Info,
  Star, CalendarDays, MessageSquare as MsgSquare, Zap, Heart
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface LeaveType {
  id: string;
  name: string;
  type: 'casual' | 'sick' | 'paid' | 'unpaid' | 'maternity' | 'paternity';
  daysAllowed: number;
  daysUsed: number;
  daysRemaining: number;
  carryForward: boolean;
  encashable: boolean;
  maxCarryForward: number;
  description: string;
  applicableTo: 'all' | 'permanent' | 'contract';
}

interface LeaveApplication {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  leaveType: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  appliedDate: string;
  managerComments?: string;
  approvedBy?: string;
  approvedAt?: string;
  attachments?: string[];
  isHalfDay: boolean;
  halfDayType?: 'first_half' | 'second_half';
}

interface LeaveBalance {
  employeeId: number;
  employeeName: string;
  department: string;
  year: number;
  leaveTypes: {
    leaveTypeId: string;
    total: number;
    used: number;
    remaining: number;
    carriedForward: number;
    encashed: number;
  }[];
}

interface LeavePolicy {
  id: string;
  name: string;
  description: string;
  rules: string[];
  effectiveDate: string;
  active: boolean;
}

interface Holiday {
  id: number;
  name: string;
  date: string;
  type: 'public' | 'company' | 'optional';
  description?: string;
}

interface Employee {
  id: number;
  name: string;
  department: string;
  email: string;
  role: string;
  joiningDate: string;
  manager?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-slate-100 border-slate-300 text-slate-700';
    case 'submitted': return 'bg-blue-100 border-blue-300 text-blue-700';
    case 'under_review': return 'bg-amber-100 border-amber-300 text-amber-700';
    case 'approved': return 'bg-emerald-100 border-emerald-300 text-emerald-700';
    case 'rejected': return 'bg-red-100 border-red-300 text-red-700';
    case 'cancelled': return 'bg-gray-100 border-gray-300 text-gray-700';
    default: return 'bg-gray-100 border-gray-300 text-gray-700';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'draft': return <FileText className="h-4 w-4" />;
    case 'submitted': return <Send className="h-4 w-4" />;
    case 'under_review': return <Eye className="h-4 w-4" />;
    case 'approved': return <CheckCircle className="h-4 w-4" />;
    case 'rejected': return <XCircle className="h-4 w-4" />;
    case 'cancelled': return <XSquare className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

function calculateDays(startDate: string, endDate: string, isHalfDay: boolean): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return isHalfDay ? 0.5 : diffDays;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

// ============================================
// MOCK DATA
// ============================================

const mockLeaveTypes: LeaveType[] = [
  { 
    id: 'casual', 
    name: 'Casual Leave', 
    type: 'casual', 
    daysAllowed: 12, 
    daysUsed: 3,
    daysRemaining: 9,
    carryForward: true, 
    encashable: false, 
    maxCarryForward: 3,
    description: 'For personal errands and short breaks',
    applicableTo: 'all'
  },
  { 
    id: 'sick', 
    name: 'Sick Leave', 
    type: 'sick', 
    daysAllowed: 10, 
    daysUsed: 2,
    daysRemaining: 8,
    carryForward: false, 
    encashable: false, 
    maxCarryForward: 0,
    description: 'For medical appointments and illness',
    applicableTo: 'all'
  },
  { 
    id: 'paid', 
    name: 'Paid Leave', 
    type: 'paid', 
    daysAllowed: 20, 
    daysUsed: 5,
    daysRemaining: 15,
    carryForward: true, 
    encashable: true, 
    maxCarryForward: 5,
    description: 'Annual paid time off',
    applicableTo: 'permanent'
  },
  { 
    id: 'unpaid', 
    name: 'Unpaid Leave', 
    type: 'unpaid', 
    daysAllowed: 30, 
    daysUsed: 0,
    daysRemaining: 30,
    carryForward: false, 
    encashable: false, 
    maxCarryForward: 0,
    description: 'Leave without pay',
    applicableTo: 'all'
  },
  { 
    id: 'maternity', 
    name: 'Maternity Leave', 
    type: 'maternity', 
    daysAllowed: 180, 
    daysUsed: 0,
    daysRemaining: 180,
    carryForward: false, 
    encashable: false, 
    maxCarryForward: 0,
    description: 'For childbirth and childcare',
    applicableTo: 'all'
  },
  { 
    id: 'paternity', 
    name: 'Paternity Leave', 
    type: 'paternity', 
    daysAllowed: 15, 
    daysUsed: 0,
    daysRemaining: 15,
    carryForward: false, 
    encashable: false, 
    maxCarryForward: 0,
    description: 'For childcare support',
    applicableTo: 'all'
  },
];

const mockEmployees: Employee[] = [
  { id: 1, name: "John Doe", department: "Engineering", email: "john@company.com", role: "Senior Developer", joiningDate: "2022-03-15", manager: "David Kumar" },
  { id: 2, name: "Sarah Connor", department: "Design", email: "sarah@company.com", role: "UI/UX Designer", joiningDate: "2021-06-20", manager: "David Kumar" },
  { id: 3, name: "Mike Ross", department: "Sales", email: "mike@company.com", role: "Sales Manager", joiningDate: "2020-01-10", manager: "Emily Chen" },
  { id: 4, name: "Emily Chen", department: "Engineering", email: "emily@company.com", role: "Engineering Manager", joiningDate: "2019-08-05" },
  { id: 5, name: "David Kumar", department: "Management", email: "david@company.com", role: "CTO", joiningDate: "2018-05-12" },
];

const mockHolidays: Holiday[] = [
  { id: 1, name: "New Year's Day", date: "2024-01-01", type: "public" },
  { id: 2, name: "Republic Day", date: "2024-01-26", type: "public" },
  { id: 3, name: "Holi", date: "2024-03-25", type: "public" },
  { id: 4, name: "Good Friday", date: "2024-03-29", type: "public" },
  { id: 5, name: "Independence Day", date: "2024-08-15", type: "public" },
  { id: 6, name: "Gandhi Jayanti", date: "2024-10-02", type: "public" },
  { id: 7, name: "Diwali", date: "2024-11-01", type: "public" },
  { id: 8, name: "Christmas", date: "2024-12-25", type: "public" },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function LeavePage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'my_leaves' | 'team_leaves' | 'approvals' | 'calendar' | 'policies'>('my_leaves');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Leave state
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [leaveTypes] = useState<LeaveType[]>(mockLeaveTypes);
  const [holidays] = useState<Holiday[]>(mockHolidays);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveApplication | null>(null);
  const [showLeavePolicy, setShowLeavePolicy] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Stats
  const [leaveStats, setLeaveStats] = useState({
    totalApplications: 0,
    pendingApprovals: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
  });

  // Initialize mock data
  useEffect(() => {
    const mockLeaves: LeaveApplication[] = [
      {
        id: 1,
        employeeId: 1,
        employeeName: "John Doe",
        department: "Engineering",
        leaveType: 'Casual Leave',
        leaveTypeId: 'casual',
        startDate: '2024-02-15',
        endDate: '2024-02-17',
        days: 3,
        reason: 'Family function - attending cousin\'s wedding',
        status: 'approved',
        appliedDate: '2024-02-01',
        approvedBy: "David Kumar",
        approvedAt: '2024-02-02T10:00:00Z',
        isHalfDay: false,
      },
      {
        id: 2,
        employeeId: 1,
        employeeName: "John Doe",
        department: "Engineering",
        leaveType: 'Sick Leave',
        leaveTypeId: 'sick',
        startDate: '2024-01-25',
        endDate: '2024-01-25',
        days: 1,
        reason: 'Medical appointment - annual health checkup',
        status: 'approved',
        appliedDate: '2024-01-24',
        approvedBy: "David Kumar",
        approvedAt: '2024-01-24T14:00:00Z',
        isHalfDay: false,
      },
      {
        id: 3,
        employeeId: 2,
        employeeName: "Sarah Connor",
        department: "Design",
        leaveType: 'Paid Leave',
        leaveTypeId: 'paid',
        startDate: '2024-03-10',
        endDate: '2024-03-15',
        days: 6,
        reason: 'Vacation - traveling to Europe',
        status: 'under_review',
        appliedDate: '2024-02-20',
        isHalfDay: false,
      },
      {
        id: 4,
        employeeId: 3,
        employeeName: "Mike Ross",
        department: "Sales",
        leaveType: 'Casual Leave',
        leaveTypeId: 'casual',
        startDate: '2024-02-20',
        endDate: '2024-02-20',
        days: 0.5,
        reason: 'Personal work in the morning',
        status: 'submitted',
        appliedDate: '2024-02-19',
        isHalfDay: true,
        halfDayType: 'first_half',
      },
      {
        id: 5,
        employeeId: 4,
        employeeName: "Emily Chen",
        department: "Engineering",
        leaveType: 'Paid Leave',
        leaveTypeId: 'paid',
        startDate: '2024-04-01',
        endDate: '2024-04-05',
        days: 5,
        reason: 'Family vacation',
        status: 'draft',
        appliedDate: '2024-02-15',
        isHalfDay: false,
      },
    ];
    
    setLeaveApplications(mockLeaves);
    
    // Calculate stats
    setLeaveStats({
      totalApplications: mockLeaves.length,
      pendingApprovals: mockLeaves.filter(l => l.status === 'submitted' || l.status === 'under_review').length,
      approvedThisMonth: mockLeaves.filter(l => l.status === 'approved' && new Date(l.appliedDate).getMonth() === new Date().getMonth()).length,
      rejectedThisMonth: mockLeaves.filter(l => l.status === 'rejected' && new Date(l.appliedDate).getMonth() === new Date().getMonth()).length,
    });
  }, []);

  // Filter leaves
  const filteredLeaves = leaveApplications.filter(leave => {
    const matchesSearch = !searchQuery || 
      leave.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    const matchesType = typeFilter === 'all' || leave.leaveTypeId === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Navigation functions
  const previousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Leave management functions
  const handleSaveLeave = (leaveData: Partial<LeaveApplication>) => {
    if (editingLeave) {
      setLeaveApplications(prev => prev.map(l => 
        l.id === editingLeave.id ? { ...l, ...leaveData } as LeaveApplication : l
      ));
    } else {
      const newLeave: LeaveApplication = {
        id: Date.now(),
        employeeId: 1,
        employeeName: "John Doe",
        department: "Engineering",
        leaveType: leaveTypes.find(t => t.id === leaveData.leaveTypeId)?.name || '',
        leaveTypeId: leaveData.leaveTypeId || '',
        startDate: leaveData.startDate || new Date().toISOString().split('T')[0],
        endDate: leaveData.endDate || new Date().toISOString().split('T')[0],
        days: calculateDays(leaveData.startDate || '', leaveData.endDate || '', leaveData.isHalfDay || false),
        reason: leaveData.reason || '',
        status: 'draft',
        appliedDate: new Date().toISOString().split('T')[0],
        isHalfDay: leaveData.isHalfDay || false,
        halfDayType: leaveData.halfDayType,
      };
      setLeaveApplications(prev => [...prev, newLeave]);
    }
    setShowLeaveForm(false);
    setEditingLeave(null);
  };

  const handleSubmitLeave = (leaveId: number) => {
    setLeaveApplications(prev => prev.map(l => 
      l.id === leaveId ? { ...l, status: 'submitted', appliedDate: new Date().toISOString().split('T')[0] } : l
    ));
  };

  const handleCancelLeave = (leaveId: number) => {
    setLeaveApplications(prev => prev.map(l => 
      l.id === leaveId ? { ...l, status: 'cancelled' } : l
    ));
  };

  const handleApproveLeave = (leaveId: number, comments?: string) => {
    setLeaveApplications(prev => prev.map(l => 
      l.id === leaveId ? { 
        ...l, 
        status: 'approved', 
        approvedAt: new Date().toISOString(),
        approvedBy: "Manager",
        managerComments: comments
      } : l
    ));
  };

  const handleRejectLeave = (leaveId: number, comments: string) => {
    setLeaveApplications(prev => prev.map(l => 
      l.id === leaveId ? { 
        ...l, 
        status: 'rejected',
        managerComments: comments
      } : l
    ));
  };

  if (!hasPermission("view_attendance")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-violet-100">
        <div className="bg-white/80 backdrop-blur-md border border-violet-200 rounded-2xl p-8 text-center shadow-xl">
          <XCircle className="h-16 w-16 text-violet-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-violet-900">Access Denied</h3>
          <p className="text-violet-700 mt-2">You don't have permission to view leave management.</p>
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
              <h1 className="text-3xl font-bold text-slate-800">Leave Management</h1>
              <p className="text-slate-600 mt-1">Apply for leave, track balances, and manage approvals</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLeaveForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-md"
              >
                <Plus className="h-5 w-5" />
                Apply for Leave
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Total Applications</div>
            <div className="text-3xl font-bold text-violet-700">{leaveStats.totalApplications}</div>
            <div className="text-xs text-slate-500 mt-1">This year</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Pending Approvals</div>
            <div className="text-3xl font-bold text-amber-600">{leaveStats.pendingApprovals}</div>
            <div className="text-xs text-amber-600 mt-1">Awaiting decision</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Approved (This Month)</div>
            <div className="text-3xl font-bold text-violet-600">{leaveStats.approvedThisMonth}</div>
            <div className="text-xs text-violet-600 mt-1">Applications</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Available Balance</div>
            <div className="text-3xl font-bold text-violet-600">32</div>
            <div className="text-xs text-violet-600 mt-1">Days remaining</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 border border-white/50 shadow-md mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'my_leaves', label: 'My Leaves', icon: Calendar },
              { id: 'team_leaves', label: 'Team Leaves', icon: Users },
              { id: 'approvals', label: 'Pending Approvals', icon: CheckSquare },
              { id: 'calendar', label: 'Leave Calendar', icon: Sun },
              { id: 'policies', label: 'Leave Policies', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
        </div>

        {/* MY LEAVES TAB */}
        {activeTab === 'my_leaves' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* Leave Balance */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-md">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-violet-600" />
                Leave Balance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leaveTypes.map((type) => (
                  <div key={type.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-800">{type.name}</h4>
                        <p className="text-xs text-slate-500">{type.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        type.daysRemaining > 5 ? 'bg-emerald-100 text-emerald-700' : 
                        type.daysRemaining > 0 ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {type.daysRemaining} left
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{type.daysUsed} used</span>
                        <span className="text-slate-600">{type.daysAllowed} total</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            (type.daysUsed / type.daysAllowed) > 0.8 ? 'bg-red-500' : 
                            (type.daysUsed / type.daysAllowed) > 0.5 ? 'bg-amber-500' : 
                            'bg-emerald-500'
                          }`}
                          style={{ width: `${(type.daysUsed / type.daysAllowed) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 text-xs">
                      {type.carryForward && (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Carry forward
                        </span>
                      )}
                      {type.encashable && (
                        <span className="text-blue-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Encashable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-md">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search leave applications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500"
                >
                  <option value="all">All Types</option>
                  {leaveTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* My Leave Applications */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">My Leave Applications</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {filteredLeaves.filter(l => l.employeeId === 1).map((leave) => (
                    <div key={leave.id} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1">
                          {/* Header with Avatar and Status */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {leave.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-bold text-slate-800 text-lg">{leave.leaveType}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${getStatusColor(leave.status)}`}>
                                  {getStatusIcon(leave.status)}
                                  <span className="ml-1">{leave.status.replace('_', ' ').toUpperCase()}</span>
                                </span>
                                {leave.isHalfDay && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                                    Half Day ({leave.halfDayType === 'first_half' ? 'First' : 'Second'})
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 font-medium">{leave.employeeName} • {leave.department}</p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <Calendar className="h-4 w-4 text-violet-500" />
                              <span className="font-medium">
                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                <span className="text-violet-600 ml-2">({leave.days} days)</span>
                              </span>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                              <p className="text-sm text-slate-700 font-medium mb-1">Reason:</p>
                              <p className="text-sm text-slate-600">{leave.reason}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 lg:min-w-[200px]">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => handleApproveLeave(leave.id, 'Approved - have a great time!')}
                              className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <CheckSquare className="h-5 w-5" />
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectLeave(leave.id, 'Please provide more details')}
                              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <XSquare className="h-5 w-5" />
                              Reject
                            </button>
                          </div>
                          
                          {/* Applied Date */}
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Applied on</p>
                            <p className="text-sm font-medium text-slate-700">{formatDate(leave.appliedDate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TEAM LEAVES TAB */}
        {activeTab === 'team_leaves' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Team Leave Calendar</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-slate-600 py-2">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 2; // Offset for calendar alignment
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day + 1);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    
                    // Check if any leaves on this date
                    const leavesOnDate = leaveApplications.filter(l => {
                      const start = new Date(l.startDate);
                      const end = new Date(l.endDate);
                      return date >= start && date <= end;
                    });
                    
                    return (
                      <div 
                        key={i} 
                        className={`min-h-[80px] p-2 rounded-lg border ${
                          isToday ? 'bg-emerald-50 border-emerald-300' : 
                          isCurrentMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className={`text-sm font-medium ${isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>
                          {date.getDate()}
                        </div>
                        <div className="mt-1 space-y-1">
                          {leavesOnDate.slice(0, 2).map((leave, idx) => (
                            <div 
                              key={idx} 
                              className="text-xs px-1 py-0.5 rounded truncate"
                              style={{ 
                                backgroundColor: leave.status === 'approved' ? '#10b98120' : 
                                        (leave.status === 'submitted' || leave.status === 'under_review') ? '#f59e0b20' : '#ef444420',
                                color: leave.status === 'approved' ? '#059669' : 
                                      (leave.status === 'submitted' || leave.status === 'under_review') ? '#d97706' : '#dc2626'
                              }}
                            >
                              {leave.employeeName.split(' ')[0]}
                            </div>
                          ))}
                          {leavesOnDate.length > 2 && (
                            <div className="text-xs text-slate-500">+{leavesOnDate.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Pending Approvals</h3>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  {leaveApplications.filter(l => l.status === 'submitted' || l.status === 'under_review').length} pending
                </span>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {leaveApplications.filter(l => l.status === 'submitted' || l.status === 'under_review').map((leave) => (
                    <div key={leave.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-semibold">
                            {leave.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">{leave.employeeName}</h4>
                            <p className="text-sm text-slate-500">{leave.department} • Applied {formatDate(leave.appliedDate)}</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-emerald-700">{leave.days}d</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-slate-800">{leave.leaveType}</h4>
                          {leave.isHalfDay && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              Half Day
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 text-sm text-slate-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{leave.reason}</p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleApproveLeave(leave.id, 'Approved - have a great time!')}
                          className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center justify-center gap-2"
                        >
                          <CheckSquare className="h-4 w-4" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectLeave(leave.id, 'Please provide more details')}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                        >
                          <XSquare className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company Holidays */}
              <div className="lg:col-span-1">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-md">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-amber-500" />
                    Company Holidays 2024
                  </h3>
                  <div className="space-y-3">
                    {holidays.map((holiday) => (
                      <div key={holiday.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <p className="font-medium text-slate-800">{holiday.name}</p>
                          <p className="text-sm text-slate-500">{formatDate(holiday.date)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          holiday.type === 'public' ? 'bg-emerald-100 text-emerald-700' :
                          holiday.type === 'company' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {holiday.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leave Trends */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-md">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Monthly Leave Trends
                  </h3>
                  <div className="space-y-4">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, idx) => {
                      const monthLeaves = [12, 15, 8, 20, 10][idx];
                      const maxLeaves = 25;
                      
                      return (
                        <div key={month} className="flex items-center gap-4">
                          <span className="w-10 text-sm font-medium text-slate-600">{month}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                            <div 
                              className="h-full rounded-full flex items-center justify-end px-2 bg-emerald-500"
                              style={{ width: `${(monthLeaves / maxLeaves) * 100}%` }}
                            >
                              <span className="text-white text-xs font-medium">{monthLeaves}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* POLICIES TAB */}
        {activeTab === 'policies' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Leave Policy Guidelines
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">
                  <Download className="h-4 w-4" />
                  Download Policy PDF
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-semibold text-slate-800 mb-2">1. Leave Application Process</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    <li>Apply for leave at least 3 days in advance for planned leaves</li>
                    <li>Emergency leaves should be notified within 24 hours</li>
                    <li>All leaves require manager approval</li>
                    <li>Track application status in real-time</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-slate-800 mb-2">2. Carry Forward Rules</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    <li>Casual Leave: Maximum 3 days can be carried forward</li>
                    <li>Paid Leave: Maximum 5 days can be carried forward</li>
                    <li>Sick Leave: Cannot be carried forward</li>
                    <li>Carried forward leaves expire by March 31st</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold text-slate-800 mb-2">3. Encashment Policy</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    <li>Only Paid Leave is eligible for encashment</li>
                    <li>Maximum 5 days can be encashed per year</li>
                    <li>Encashment processed in December payroll</li>
                    <li>Rate: Basic salary / 30 days</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-violet-500 pl-4">
                  <h4 className="font-semibold text-slate-800 mb-2">4. Special Leave Provisions</h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    <li>Maternity Leave: 180 days for female employees</li>
                    <li>Paternity Leave: 15 days for male employees</li>
                    <li>Bereavement Leave: 5 days for immediate family</li>
                    <li>Marriage Leave: 5 days for self-marriage</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leave Form Modal */}
        <AnimatePresence>
          {showLeaveForm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">
                    {editingLeave ? 'Edit Leave Application' : 'Apply for Leave'}
                  </h3>
                  <button 
                    onClick={() => { setShowLeaveForm(false); setEditingLeave(null); }}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                <div className="p-1">
                  <LeaveApplicationForm 
                    leave={editingLeave}
                    leaveTypes={leaveTypes}
                    onSave={handleSaveLeave}
                    onCancel={() => { setShowLeaveForm(false); setEditingLeave(null); }}
                  />
                </div>
              </motion.div>
             </motion.div> 
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// LEAVE APPLICATION FORM COMPONENT
// ============================================

interface LeaveApplicationFormProps {
  leave: LeaveApplication | null;
  leaveTypes: LeaveType[];
  onSave: (data: Partial<LeaveApplication>) => void;
  onCancel: () => void;
}

interface ApiLeaveType {
  id: number;
  name: string;
  maxLeavesPerYear: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  encashmentAllowed: boolean;
}

const leaveTypeIcons = {
  "Annual Leave": CalendarDays,
  "Sick Leave": Heart,
  "Casual Leave": Briefcase,
  "Maternity Leave": Users,
  "Paternity Leave": Users,
  "Emergency Leave": AlertCircle,
  "Vacation": Sun,
};

function LeaveApplicationForm({ leave, leaveTypes, onSave, onCancel }: LeaveApplicationFormProps) {
  const { user } = useAuth();
  const [apiLeaveTypes, setApiLeaveTypes] = useState<ApiLeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    leaveTypeId: leave?.leaveTypeId || '',
    startDate: leave?.startDate || '',
    endDate: leave?.endDate || '',
    isHalfDay: leave?.isHalfDay || false,
    halfDayType: leave?.halfDayType || 'first_half',
    reason: leave?.reason || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  // Fetch leave types from API
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/hr/leave-type");
        const responseData = res.data;
        let list: ApiLeaveType[] = [];
        if (Array.isArray(responseData)) {
          list = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          list = responseData.data;
        }
        setApiLeaveTypes(list);
      } catch (error) {
        console.error("Failed to fetch leave types", error);
        toast.error("Failed to load leave types");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.leaveTypeId) {
      newErrors.leaveTypeId = "Please select a leave type";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Please select a start date";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Please select an end date";
    }

    if (formData.startDate && formData.endDate) {
      const fromDate = new Date(formData.startDate);
      const toDate = new Date(formData.endDate);

      if (toDate < fromDate) {
        newErrors.endDate = "End date cannot be before start date";
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Please provide a reason for your leave";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateLeaveDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const fromDate = new Date(formData.startDate);
    const toDate = new Date(formData.endDate);

    // Calculate inclusive days
    const diffTime = toDate.getTime() - fromDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return formData.isHalfDay ? 0.5 : diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", formData);

    if (!validateForm()) {
      console.log("Form validation failed", errors);
      return;
    }

    console.log("Form validation passed, proceeding with API call");
    setSubmitting(true);

    try {
      // Get employee ID from user context
      const employeeId = user?.id || 0;
      console.log("Employee ID:", employeeId);

      const payload = {
        employeId: employeeId,
        leaveTypeId: parseInt(formData.leaveTypeId),
        fromDate: formData.startDate,
        toDate: formData.endDate,
        reason: formData.reason
      };

      console.log("API Payload:", payload);
      console.log("API Endpoint:", "/api/employee/leave/apply");

      const response = await api.post("/api/employee/leave/apply", payload);
      console.log("API Response:", response);

      toast.success("Leave application submitted successfully!");

      // Reset form
      setFormData({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        isHalfDay: false,
        halfDayType: 'first_half',
        reason: ''
      });
      setErrors({});

      // Close modal after successful submission
      onCancel();

    } catch (error: any) {
      console.error("Failed to submit leave application", error);
      console.error("Error details:", error.response?.data);

      // Handle specific error messages from API
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to submit leave application. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const selectedApiLeaveType = apiLeaveTypes.find(type => type.id === parseInt(formData.leaveTypeId));

  // New Card-Based Design
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1: Leave Type Selection */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
            1
          </div>
          <h3 className="text-lg font-semibold text-blue-900">Select Leave Type</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              name="leaveTypeId"
              value={formData.leaveTypeId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            >
              <option value="">Select leave type</option>
              {apiLeaveTypes.map(leaveType => (
                <option key={leaveType.id} value={leaveType.id}>
                  {leaveType.name} ({leaveType.maxLeavesPerYear} days/year)
                </option>
              ))}
            </select>
            {errors.leaveTypeId && (
              <p className="text-red-600 text-sm mt-1">{errors.leaveTypeId}</p>
            )}
          </div>
        </div>

        {errors.leaveTypeId && (
          <p className="text-red-600 text-sm mt-3 ml-11">{errors.leaveTypeId}</p>
        )}
      </div>

      {/* Step 2: Date Selection */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
            2
          </div>
          <h3 className="text-lg font-semibold text-green-900">Select Dates</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                required
              />
              {errors.startDate && (
                <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                required
              />
              {errors.endDate && (
                <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Half Day Toggle */}
          <div className="flex items-center space-x-3 py-3">
            <input
              type="checkbox"
              id="isHalfDay"
              checked={formData.isHalfDay}
              onChange={(e) => setFormData(prev => ({ ...prev, isHalfDay: e.target.checked }))}
              className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
            />
            <label htmlFor="isHalfDay" className="text-sm font-medium text-gray-700">
              Half Day Leave
            </label>
          </div>

          {/* Half Day Options */}
          {formData.isHalfDay && (
            <div className="ml-8 space-y-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="halfDayType"
                    value="first_half"
                    checked={formData.halfDayType === 'first_half'}
                    onChange={(e) => setFormData(prev => ({ ...prev, halfDayType: e.target.value as 'first_half' | 'second_half' }))}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Morning Session</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="halfDayType"
                    value="second_half"
                    checked={formData.halfDayType === 'second_half'}
                    onChange={(e) => setFormData(prev => ({ ...prev, halfDayType: e.target.value as 'first_half' | 'second_half' }))}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Afternoon Session</span>
                </label>
              </div>
            </div>
          )}

          {/* Duration Calculator */}
          {formData.startDate && formData.endDate && calculateLeaveDays() > 0 && (
            <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-sm">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {calculateLeaveDays()}
                </div>
                <div className="text-xl text-gray-700 mb-2">
                  {calculateLeaveDays() === 1 ? 'day' : 'days'} of leave
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(formData.startDate)} → {formatDate(formData.endDate)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Reason */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
            3
          </div>
          <h3 className="text-lg font-semibold text-purple-900">Provide Reason</h3>
        </div>

        <div>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none"
            placeholder="Please explain the reason for your leave application..."
            required
          />
          {errors.reason && (
            <p className="text-red-600 text-sm mt-1">{errors.reason}</p>
          )}
        </div>
      </div>

      {/* Submit Section */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || loading}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
        >
          {submitting ? 'Submitting...' : 'Apply for Leave'}
        </button>
      </div>
    </form>
  );
}
