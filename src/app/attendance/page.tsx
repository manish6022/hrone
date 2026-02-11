"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, XCircle, AlertCircle, Clock, Smartphone, Fingerprint, 
  Upload, Download, Calendar, Briefcase, Timer, Moon, Sun, 
  FileText, CheckSquare, Settings, Bell, UserCheck, Users,
  ChevronDown, ChevronUp, Plus, Minus, Save, X, Filter,
  Search, MoreVertical, Clock3, LogOut, Building2, MapPin
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

// ============================================
// HELPER FUNCTIONS
// ============================================

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

function statusChipColor(status: string): string {
  switch (status) {
    case 'present': return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    case 'absent': return 'bg-red-100 border-red-300 text-red-800';
    case 'late': return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'early_leave': return 'bg-orange-100 border-orange-300 text-orange-800';
    case 'half_day': return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'work_from_home': return 'bg-violet-100 border-violet-300 text-violet-800';
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
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'shifts'>('attendance');
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchLocation, setPunchLocation] = useState<'office' | 'outside'>('office');
  const [remarks, setRemarks] = useState('');
  const [facialCaptured, setFacialCaptured] = useState(false);
  const [locationData, setLocationData] = useState<{lat?: number, lng?: number, geofenceOk?: boolean}>({});
  const [gpsError, setGpsError] = useState(false);

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Shift & Overtime state
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>([]);
  const [shifts] = useState<Shift[]>(mockShifts);
  const [showOvertimeForm, setShowOvertimeForm] = useState(false);

  // Timesheet state

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


  }, []);

  // Handle location-based checks
  useEffect(() => {
    setGpsError(false); // Clear previous errors
    if (punchLocation === 'office') {
      // Mock geofencing check - assume user is within office bounds
      setLocationData({ geofenceOk: true });
    } else if (punchLocation === 'outside') {
      // Mock GPS capture for development - replace with real GPS in production
      setLocationData({ lat: 28.6139, lng: 77.2090 }); // Mock coordinates (Delhi, India)
    }
  }, [punchLocation]);

  // Punch In/Out handler
  const handlePunch = () => {
    if (!isPunchedIn) {
      setShowPunchModal(true);
    } else {
      setIsPunchedIn(false);
      setPunchTime(null);
    }
  };

  const handlePunchSubmit = () => {
    if (punchLocation === 'outside' && !remarks.trim()) {
      alert('Remarks are required for outside location');
      return;
    }
    setIsPunchedIn(true);
    setPunchTime(new Date().toLocaleTimeString());
    setShowPunchModal(false);
    // Reset modal state
    setPunchLocation('office');
    setRemarks('');
    setFacialCaptured(false);
  };

  // Filter attendance records
  const filteredAttendance = attendanceRecords.filter(r => {
    const matchesSearch = !searchQuery || r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || r.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!hasPermission("view_attendance")) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Attendance & Time Management</h1>
              <p className="text-slate-600 mt-1">Complete HR solution for attendance, shifts, timesheets, and leave management</p>
            </div>
            <div className="flex gap-2">
              {/* Mobile Punch Button */}
              <button
                onClick={handlePunch}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isPunchedIn 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                {isPunchedIn ? <LogOut className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                {isPunchedIn ? `Punch Out ${punchTime ? `(${punchTime})` : ''}` : 'Punch In'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-2 border border-white/50 shadow-md mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'attendance', label: 'Attendance & Time', icon: Clock },
              { id: 'shifts', label: 'Shifts & Overtime', icon: Timer },
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

        {/* ATTENDANCE & TIME CAPTURE TAB */}
        {activeTab === 'attendance' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {[
                { label: 'Present', value: '45', color: 'emerald' },
                { label: 'Absent', value: '3', color: 'red' },
                { label: 'Late', value: '5', color: 'amber' },
                { label: 'Half Day', value: '2', color: 'blue' },
                { label: 'WFH', value: '8', color: 'violet' },
                { label: 'On Leave', value: '12', color: 'rose' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl p-4 shadow-md">
                  <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Hybrid Entry Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-violet-100 to-violet-50 border border-violet-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
                    <Fingerprint className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-violet-900">Biometric Sync</h3>
                    <p className="text-xs text-violet-700">Auto-sync with devices</p>
                  </div>
                </div>
                <div className="text-sm text-violet-800">
                  <p>32 employees synced</p>
                  <p className="text-xs mt-1">Last sync: 2 mins ago</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">Mobile Entry</h3>
                    <p className="text-xs text-blue-700">Remote punch in/out</p>
                  </div>
                </div>
                <div className="text-sm text-blue-800">
                  <p>15 field employees</p>
                  <p className="text-xs mt-1">GPS tracking enabled</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900">Manual Entry</h3>
                    <p className="text-xs text-amber-700">HR/admin override</p>
                  </div>
                </div>
                <div className="text-sm text-amber-800">
                  <p>3 entries today</p>
                  <p className="text-xs mt-1">Requires approval</p>
                </div>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-md mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
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
                  <option value="half_day">Half Day</option>
                  <option value="work_from_home">Work From Home</option>
                </select>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200">
                    <Upload className="h-4 w-4" />
                    Import
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Records */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Today's Attendance</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-lg ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Grid
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-lg ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    List
                  </button>
                </div>
              </div>

              {viewMode === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-slate-700">Employee</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Department</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Check In</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Check Out</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Entry Type</th>
                        <th className="text-left p-4 font-semibold text-slate-700">Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.map((record) => (
                        <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-semibold">
                                {record.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-800">{record.employeeName}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">{record.department}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusChipColor(record.status)}`}>
                              {getStatusIcon(record.status)}
                              {record.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600">{record.checkIn || '--'}</td>
                          <td className="p-4 text-slate-600">{record.checkOut || '--'}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getEntryTypeIcon(record.entryType)}
                              <span className="text-sm text-slate-600 capitalize">{record.entryType}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">{record.workHours || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAttendance.map((record) => (
                    <div key={record.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-bold">
                            {record.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">{record.employeeName}</h4>
                            <p className="text-sm text-slate-500">{record.department}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusChipColor(record.status)}`}>
                          {record.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Check In:</span>
                          <span className="font-medium">{record.checkIn || '--'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Check Out:</span>
                          <span className="font-medium">{record.checkOut || '--'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Hours:</span>
                          <span className="font-medium">{record.workHours || '--'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-slate-500">Entry:</span>
                          <div className="flex items-center gap-1">
                            {getEntryTypeIcon(record.entryType)}
                            <span className="capitalize">{record.entryType}</span>
                          </div>
                        </div>
                        {record.location && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin className="h-3 w-3" />
                            <span>{record.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SHIFTS & OVERTIME TAB */}
        {activeTab === 'shifts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Shift Configuration */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-md">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-amber-500" />
                    Shift Configuration
                  </h3>
                  <div className="space-y-4">
                    {shifts.map((shift) => (
                      <div key={shift.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-800">{shift.name}</h4>
                          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
                            {shift.startTime} - {shift.endTime}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p>Break: {shift.breakDuration} mins</p>
                          <p>Overtime after: {shift.overtimeThreshold} hours</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Shift
                  </button>
                </div>

                {/* Late/Early Tracking */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-md">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Non-Adherence Tracking
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-red-800">Late Arrivals</p>
                        <p className="text-sm text-red-600">5 employees today</p>
                      </div>
                      <span className="text-2xl font-bold text-red-600">5</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-medium text-orange-800">Early Exits</p>
                        <p className="text-sm text-orange-600">2 employees today</p>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">2</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="font-medium text-blue-800">Mid-Day Changes</p>
                        <p className="text-sm text-blue-600">1 employee today</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overtime Records */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-md">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Moon className="h-5 w-5 text-violet-600" />
                      Overtime Records
                    </h3>
                    <button 
                      onClick={() => setShowOvertimeForm(true)}
                      className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Claim Overtime
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {overtimeRecords.map((record) => (
                        <div key={record.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-violet-200 text-violet-800 flex items-center justify-center font-semibold">
                                {record.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800">{record.employeeName}</h4>
                                <p className="text-sm text-slate-500">{record.date}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              record.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              record.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {record.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Hours:</span>
                              <span className="ml-2 font-semibold">{record.hours}h</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Category:</span>
                              <span className="ml-2 font-semibold capitalize">{record.category}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Reason:</span>
                              <span className="ml-2">{record.reason}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    <AnimatePresence>
      {showPunchModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPunchModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Punch In</h3>
                <div className="text-3xl font-mono font-bold text-violet-600">
                  {new Date().toLocaleTimeString()}
                </div>
                <p className="text-sm text-slate-500 mt-1">Current time</p>
              </div>

              <div className="space-y-4">
                {/* Facial Capture */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${facialCaptured ? 'bg-green-100' : 'bg-slate-200'}`}>
                      <Upload className={`h-5 w-5 ${facialCaptured ? 'text-green-600' : 'text-slate-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Facial Recognition</p>
                      <p className="text-sm text-slate-500">Capture face for verification</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={() => setFacialCaptured(true)}
                    className="hidden"
                    id="facial-capture"
                  />
                  <label
                    htmlFor="facial-capture"
                    className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${facialCaptured ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                  >
                    {facialCaptured ? 'Captured' : 'Capture'}
                  </label>
                </div>

                {/* Biometric Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <select
                    value={punchLocation}
                    onChange={(e) => setPunchLocation(e.target.value as 'office' | 'outside')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="office">Office (Inside)</option>
                    <option value="outside">Outside Office</option>
                  </select>
                  {punchLocation === 'office' && locationData.geofenceOk && <p className="text-sm text-green-600 mt-2">Geofencing verified</p>}
                  {punchLocation === 'outside' && locationData.lat && <p className="text-sm text-blue-600 mt-2">GPS: {locationData.lat.toFixed(4)}, {locationData.lng?.toFixed(4)}</p>}
                  {punchLocation === 'outside' && gpsError && <p className="text-sm text-red-600 mt-2">GPS not available, please check permissions</p>}
                </div>

                {/* Remarks for Outside */}
                {punchLocation === 'outside' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Remarks <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Please provide reason for outside punch-in..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                      rows={3}
                      required
                    />
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handlePunchSubmit}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Smartphone className="h-5 w-5" />
                  Punch In
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </div>

  
  );
}
