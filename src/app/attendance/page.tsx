"use client";

import { useEffect, useState, useMemo, useContext } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, AlertCircle, Clock, Smartphone, Fingerprint, 
  Upload, Download, Calendar, Briefcase, Timer, Moon, Sun, 
  FileText, CheckSquare, Settings, Bell, UserCheck, Users,
  ChevronDown, ChevronUp, Plus, Minus, Save, X, Filter,
  Search, MoreVertical, Clock3, LogOut, Building2, MapPin,
  History, List, Grid
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import AuthContext from "../../context/AuthContext";
import { PunchModal } from "../../components/attendance/PunchModal";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'half_day' | 'work_from_home';
  department: string;
  workHours?: string;
  overtime?: string;
  entryType: 'biometric' | 'mobile' | 'manual';
  location?: string;
}

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  overtimeThreshold: number;
}

interface OvertimeRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  hours: number;
  category: 'regular' | 'holiday' | 'night';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

interface Employee {
  id: number;
  name: string;
  department: string;
  email: string;
  type: 'permanent' | 'contract' | 'field';
  shiftId?: number;
}

interface RegularizationRequest {
  id?: number;
  employeeId: number;
  employeeName: string;
  date: string;
  currentCheckIn?: string;
  currentCheckOut?: string;
  currentStatus: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  requestedStatus: string;
  reason: string;
  status?: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
  attachments?: string[];
}

// ============================================
// API FUNCTIONS
// ============================================

const markAttendance = async (attendanceData: {
  employeeId: number;
  date: string;
  status: string;
  overtimeHours: number;
  punchIn: string;
  punchOut: string;
}) => {
  try {
    const response = await api.post('/attendance/mark', attendanceData);
    return response.data;
  } catch (error) {
    console.error('Failed to mark attendance:', error);
    throw error;
  }
};

function getStatusIcon(status: string): any {
  switch (status) {
    case 'present': return <CheckCircle className="h-4 w-4" />;
    case 'absent': return <XCircle className="h-4 w-4" />;
    case 'late': return <AlertCircle className="h-4 w-4" />;
    case 'early_leave': return <Clock className="h-4 w-4" />;
    case 'half_day': return <Clock3 className="h-4 w-4" />;
    case 'work_from_home': return <Building2 className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-slate-100 border-slate-300 text-slate-700';
    case 'submitted': return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'under_review': return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'approved': return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    case 'rejected': return 'bg-red-100 border-red-300 text-red-800';
    case 'pending': return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'present': return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    case 'absent': return 'bg-red-100 border-red-300 text-red-800';
    case 'late': return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'work_from_home': return 'bg-purple-100 border-purple-300 text-purple-800';
    case 'half_day': return 'bg-cyan-100 border-cyan-300 text-cyan-800';
    case 'early_leave': return 'bg-orange-100 border-orange-300 text-orange-800';
    default: return 'bg-gray-100 border-gray-300 text-gray-800';
  }
}

function getEntryTypeIcon(type: string): any {
  switch (type) {
    case 'biometric': return <Fingerprint className="h-4 w-4 text-violet-600" />;
    case 'mobile': return <Smartphone className="h-4 w-4 text-blue-600" />;
    case 'manual': return <UserCheck className="h-4 w-4 text-amber-600" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

// ============================================
// MOCK DATA
// ============================================

const mockEmployees: Employee[] = [
  { id: 1, name: "John Doe", department: "Engineering", email: "john@company.com", type: "permanent", shiftId: 1 },
  { id: 2, name: "Sarah Connor", department: "Marketing", email: "sarah@company.com", type: "permanent", shiftId: 1 },
  { id: 3, name: "Mike Ross", department: "Sales", email: "mike@company.com", type: "contract" },
  { id: 4, name: "Emily Chen", department: "Engineering", email: "emily@company.com", type: "field" },
  { id: 5, name: "David Kumar", department: "Operations", email: "david@company.com", type: "permanent", shiftId: 2 },
];

const mockShifts: Shift[] = [
  { id: 1, name: "Day Shift", startTime: "09:00", endTime: "18:00", breakDuration: 60, overtimeThreshold: 8 },
  { id: 2, name: "Night Shift", startTime: "18:00", endTime: "03:00", breakDuration: 60, overtimeThreshold: 8 },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function AttendancePage() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used within an AuthProvider');
  const { user, hasPermission, isSuperAdmin, isHR } = auth;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'attendance' | 'shifts' | 'regularization'>('attendance');
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);
  const [showPunchModal, setShowPunchModal] = useState(false);

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Shift & Overtime state
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>([]);
  const [shifts] = useState<Shift[]>(mockShifts);
  const [showOvertimeForm, setShowOvertimeForm] = useState(false);

  // Timesheet state

  // Regularization state
  const [regularizationRequests, setRegularizationRequests] = useState<RegularizationRequest[]>([]);

  // Initialize mock data
  useEffect(() => {
    const mockAttendance: AttendanceRecord[] = [
      { id: 1, employeeId: 1, employeeName: "John Doe", date: "2024-01-15", checkIn: "09:00", checkOut: "18:30", status: 'present', department: "Engineering", workHours: "9h 30m", entryType: 'biometric' },
      { id: 2, employeeId: 2, employeeName: "Sarah Connor", date: "2024-01-15", checkIn: "08:45", checkOut: "17:45", status: 'present', department: "Marketing", workHours: "8h 45m", entryType: 'biometric' },
      { id: 3, employeeId: 3, employeeName: "Mike Ross", date: "2024-01-15", checkIn: "09:15", checkOut: "16:00", status: 'late', department: "Sales", workHours: "6h 45m", entryType: 'mobile', location: 'Client Site A' },
      { id: 4, employeeId: 4, employeeName: "Emily Chen", date: "2024-01-15", checkIn: "09:30", checkOut: "14:00", status: 'half_day', department: "Engineering", workHours: "4h 30m", entryType: 'mobile', location: 'Remote' },
      { id: 5, employeeId: 5, employeeName: "David Kumar", date: "2024-01-15", checkIn: "10:00", checkOut: "18:00", status: 'work_from_home', department: "Operations", workHours: "8h 00m", entryType: 'manual' },
    ];
    setAttendanceRecords(mockAttendance);

    const mockOvertime: OvertimeRecord[] = [
      { id: 1, employeeId: 1, employeeName: "John Doe", date: "2024-01-14", hours: 3, category: 'regular', status: 'approved', reason: 'Project deadline' },
      { id: 2, employeeId: 2, employeeName: "Sarah Connor", date: "2024-01-13", hours: 2, category: 'holiday', status: 'pending', reason: 'Marketing campaign' },
    ];
    setOvertimeRecords(mockOvertime);

    const mockRegularization: RegularizationRequest[] = [
      {
        id: 1,
        employeeId: 1,
        employeeName: "John Doe",
        date: "2024-01-15",
        currentCheckIn: "10:00",
        currentStatus: "late",
        requestedCheckIn: "09:00",
        requestedStatus: "present",
        reason: "Traffic delay due to road construction",
        status: "pending",
        submittedAt: "2024-01-15T08:30:00Z"
      },
      {
        id: 2,
        employeeId: 2,
        employeeName: "Sarah Connor",
        date: "2024-01-14",
        currentStatus: "absent",
        requestedCheckIn: "09:00",
        requestedCheckOut: "17:00",
        requestedStatus: "present",
        reason: "Medical emergency - doctor's appointment",
        status: "approved",
        submittedAt: "2024-01-14T10:00:00Z",
        reviewedAt: "2024-01-14T11:00:00Z",
        reviewedBy: "Manager Name"
      }
    ];
    setRegularizationRequests(mockRegularization);


  }, []);

  const handlePunchSubmit = async (attendanceData: {
    employeeId: number;
    date: string;
    status: string;
    overtimeHours: number;
    punchIn: string;
    punchOut: string;
  }) => {
    try {
      const response = await markAttendance(attendanceData);

      setIsPunchedIn(!isPunchedIn);
      setPunchTime(attendanceData.punchIn);
      setShowPunchModal(false);

      alert('Successfully punched in!');
    } catch (error: any) {
      console.error('Failed to punch in:', error);
      alert(`Failed to punch in: ${error.message || 'Unknown error'}`);
    }
  };

  // Filter attendance records (memoized for performance)
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter(r => {
      const matchesSearch = !searchQuery || r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || r.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [attendanceRecords, searchQuery, statusFilter]);

  // Memoized stats calculations
  const attendanceStats = useMemo(() => ({
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    halfDay: attendanceRecords.filter(r => r.status === 'half_day').length,
    workFromHome: attendanceRecords.filter(r => r.status === 'work_from_home').length,
    onLeave: 12, // Mock value
  }), [attendanceRecords]);

  // Memoized regularization stats
  const regularizationStats = useMemo(() => ({
    pending: regularizationRequests.filter(r => r.status === 'pending').length,
    approved: regularizationRequests.filter(r => r.status === 'approved').length,
    rejected: regularizationRequests.filter(r => r.status === 'rejected').length,
  }), [regularizationRequests]);

  if (!hasPermission("ATTENDANCE_VIEW")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-violet-100">
        <div className="bg-white/80 backdrop-blur-md border border-violet-200 rounded-2xl p-8 text-center shadow-xl">
          <XCircle className="h-16 w-16 text-violet-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-violet-900">Access Denied</h3>
          <p className="text-violet-700 mt-2">You don't have permission to view attendance management.</p>
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
              <h1 className="text-3xl font-bold text-slate-800">Attendance Management</h1>
              <p className="text-slate-600 mt-1">Track employee attendance, manage shifts, and streamline approvals</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPunchModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-md"
              >
                <Plus className="h-5 w-5" />
                Quick Punch
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all">
                <Download className="h-5 w-5" />
                Export Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 border border-white/50 shadow-md mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              ...(hasPermission("ATTENDANCE_VIEW") ? [{ id: 'attendance', label: 'Today\'s Attendance', icon: Users }] : []),
              ...(hasPermission("ATTENDANCE_REGULARIZATION_VIEW") ? [{ id: 'regularization', label: 'Requests', icon: FileText }] : []),
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Present Today</div>
            <div className="text-3xl font-bold text-emerald-600">{attendanceStats.present}</div>
            <div className="text-xs text-slate-500 mt-1">Employees</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Late Arrivals</div>
            <div className="text-3xl font-bold text-amber-600">{attendanceStats.late}</div>
            <div className="text-xs text-slate-500 mt-1">Employees</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Absent Today</div>
            <div className="text-3xl font-bold text-red-600">{attendanceStats.absent}</div>
            <div className="text-xs text-slate-500 mt-1">Employees</div>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
            <div className="text-sm text-slate-600 mb-1">Work From Home</div>
            <div className="text-3xl font-bold text-violet-600">{attendanceStats.workFromHome}</div>
            <div className="text-xs text-slate-500 mt-1">Employees</div>
          </div>
        </div>

        {/* Today's Attendance Tab */}
        {activeTab === 'attendance' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-md">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search employees or departments..."
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
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="work_from_home">Work From Home</option>
                </select>
              </div>
            </div>

            {/* Attendance Records */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
              <div className="p-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Today's Attendance</h3>
                  <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          viewMode === 'table'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <List className="h-4 w-4 inline mr-1" />
                        Table
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                          viewMode === 'grid'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <Grid className="h-4 w-4 inline mr-1" />
                        Grid
                      </button>
                    </div>
                    <button
                      onClick={() => router.push('/attendance/history')}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all"
                    >
                      <History className="h-4 w-4" />
                      View History
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {filteredAttendance.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No attendance records found</p>
                    <p className="text-slate-400 text-sm mt-1">Records will appear here as employees check in</p>
                  </div>
                ) : viewMode === 'table' ? (
                  /* Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-4 font-semibold text-slate-700">Employee</th>
                          <th className="text-left p-4 font-semibold text-slate-700">Department</th>
                          <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                          <th className="text-left p-4 font-semibold text-slate-700">Check In</th>
                          <th className="text-left p-4 font-semibold text-slate-700">Check Out</th>
                          <th className="text-left p-4 font-semibold text-slate-700">Hours</th>
                          <th className="text-left p-4 font-semibold text-slate-700">Entry Type</th>
                          {(isSuperAdmin() || isHR()) && <th className="text-left p-4 font-semibold text-slate-700">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAttendance.map((record) => (
                          <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-semibold text-sm">
                                  {record.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-900">{record.employeeName}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600">{record.department}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                                {getStatusIcon(record.status)}
                                {record.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600">{record.checkIn}</td>
                            <td className="p-4 text-slate-600">{record.checkOut || '—'}</td>
                            <td className="p-4 text-slate-600 font-medium">{record.workHours}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {getEntryTypeIcon(record.entryType)}
                                <span className="text-sm text-slate-600 capitalize">{record.entryType}</span>
                              </div>
                            </td>
                            {(isSuperAdmin() || isHR()) && (
                              <td className="p-4">
                                <button
                                  onClick={() => router.push(`/attendance/history?userId=${record.employeeId}`)}
                                  className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all text-sm"
                                >
                                  View Details
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Grid/Card View */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAttendance.map((record) => (
                      <div key={record.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-semibold">
                              {record.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{record.employeeName}</h4>
                              <p className="text-sm text-slate-500">{record.department}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                            {record.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                {getStatusIcon('present')}
                                <span className="text-xs font-semibold text-blue-700">Check In</span>
                              </div>
                              <p className="text-sm font-bold text-slate-900">{record.checkIn}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                                <span className="text-xs font-semibold text-emerald-700">Check Out</span>
                              </div>
                              <p className="text-sm font-bold text-slate-900">{record.checkOut || '—'}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-2">
                              {getEntryTypeIcon(record.entryType)}
                              <span className="text-xs text-slate-600 capitalize">{record.entryType}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">Total Hours</p>
                              <p className="text-sm font-bold text-slate-900">{record.workHours}</p>
                            </div>
                          </div>

                          {(isSuperAdmin() || isHR()) && (
                            <button
                              onClick={() => router.push(`/attendance/history?userId=${record.employeeId}`)}
                              className="w-full mt-3 px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all text-sm"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Regularization Tab */}
        {activeTab === 'regularization' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
                <div className="text-sm text-slate-600 mb-1">Pending Requests</div>
                <div className="text-3xl font-bold text-amber-600">{regularizationStats.pending}</div>
                <div className="text-xs text-slate-500 mt-1">Awaiting approval</div>
              </div>
              <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
                <div className="text-sm text-slate-600 mb-1">Approved</div>
                <div className="text-3xl font-bold text-emerald-600">{regularizationStats.approved}</div>
                <div className="text-xs text-slate-500 mt-1">This month</div>
              </div>
              <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
                <div className="text-sm text-slate-600 mb-1">Rejected</div>
                <div className="text-3xl font-bold text-red-600">{regularizationStats.rejected}</div>
                <div className="text-xs text-slate-500 mt-1">This month</div>
              </div>
              <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
                <div className="text-sm text-slate-600 mb-1">Total Requests</div>
                <div className="text-3xl font-bold text-blue-600">
                  {regularizationStats.pending + regularizationStats.approved + regularizationStats.rejected}
                </div>
                <div className="text-xs text-slate-500 mt-1">All time</div>
              </div>
            </div>

            {/* Regularization Requests */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
              <div className="p-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Regularization Requests
                  </h3>
                  <select className="px-4 py-2 rounded-lg border border-slate-200 focus:border-violet-500">
                    <option>All Status</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {regularizationRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No regularization requests found</p>
                      <p className="text-slate-400 text-sm mt-1">New requests will appear here</p>
                    </div>
                  ) : (
                    regularizationRequests.map((request) => (
                      <div key={request.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-semibold">
                              {request.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800">{request.employeeName}</h4>
                              <p className="text-sm text-slate-500">{new Date(request.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status || 'pending')}`}>
                            {(request.status || 'pending').toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-slate-500">Current:</span>
                            <span className="ml-2 font-medium capitalize">{request.currentStatus}</span>
                            {request.currentCheckIn && <span className="ml-2">({request.currentCheckIn})</span>}
                          </div>
                          <div>
                            <span className="text-slate-500">Requested:</span>
                            <span className="ml-2 font-medium capitalize">{request.requestedStatus}</span>
                            {request.requestedCheckIn && <span className="ml-2">({request.requestedCheckIn})</span>}
                          </div>
                        </div>

                        <p className="text-slate-700 mb-4">{request.reason}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            Submitted: {request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : 'N/A'}
                          </span>
                          <div className="flex gap-2">
                            <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                              View Details
                            </button>
                            {request.status === 'pending' && hasPermission("ATTENDANCE_REGULARIZATION_APPROVE") && (
                              <>
                                <button className="px-3 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                                  Approve
                                </button>
                                <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Punch Modal - Controlled by Quick Punch Button */}
        <PunchModal
          isPunchedIn={isPunchedIn}
          onPunchSubmit={handlePunchSubmit}
          user={user}
          isOpen={showPunchModal}
          onOpen={() => setShowPunchModal(true)}
        />
      </div>
    </div>
  );
}
