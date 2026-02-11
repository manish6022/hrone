"use client";

import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
  department: string;
  workHours?: string;
  overtime?: string;
  avatar?: string;
}

function getStatusIcon(status: AttendanceRecord['status']): any {
  switch (status) {
    case 'present': return <CheckCircle className="h-3 w-3" />;
    case 'late': return <AlertCircle className="h-3 w-3" />;
    case 'absent': return <XCircle className="h-3 w-3" />;
    case 'early_leave': return <Clock className="h-3 w-3" />;
    default: return <Clock className="h-3 w-3" />;
  }
}

function statusChipColor(status: AttendanceRecord['status']): string {
  // Violet theme for all statuses
  return 'bg-violet-100 border-violet-200 text-violet-800';
}

function dotColor(status: AttendanceRecord['status']): string {
  switch (status) {
    case 'present': return 'bg-violet-600';
    case 'late': return 'bg-violet-500';
    case 'absent': return 'bg-violet-400';
    case 'early_leave': return 'bg-violet-700';
  }
  return 'bg-violet-600';
}

// Alternative getter to avoid potential hoisting issues in TypeScript TSX parsing
function getDotColor(status: AttendanceRecord['status']): string {
  return dotColor(status);
}

export default function AttendancePage() {
  const { hasPermission } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list'|'grid'>('grid');

  useEffect(() => {
    const mock: AttendanceRecord[] = [
      { id: 1, employeeId: 1, employeeName: "John Doe", date: "2024-01-15", checkIn: "09:00", checkOut: "18:30", status: 'present', department: "Engineering", workHours: "9h 30m" },
      { id: 2, employeeId: 2, employeeName: "Sarah Connor", date: "2024-01-15", checkIn: "08:45", checkOut: "17:45", status: 'present', department: "Marketing", workHours: "8h 45m" },
      { id: 3, employeeId: 3, employeeName: "Mike Ross", date: "2024-01-15", checkIn: "09:15", checkOut: "16:00", status: 'late', department: "Sales", workHours: "6h 45m" }
    ];
    setAttendance(mock);
  }, []);

  if (!hasPermission("view_attendance")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="bg-amber-100/80 border-amber-200 border rounded-xl p-6 text-center">
          <XCircle className="h-12 w-12 text-amber-700 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-amber-900">Access Denied</h3>
          <p className="text-sm text-amber-700">You don't have permission to view attendance management.</p>
        </div>
      </div>
    );
  }

  const filteredAttendance = attendance.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.employeeName.toLowerCase().includes(q) || r.department.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="px-4 py-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-100/80 rounded-2xl p-6 border border-amber-200 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Attendance Management</h1>
              <p className="text-sm text-amber-700">Overview of attendance with grid/list views</p>
            </div>
            <div className="flex gap-2">
              <button className={`px-4 py-2 rounded-md ${viewMode==='grid'?'bg-amber-600 text-white':'bg-amber-100 text-amber-900 border border-amber-200'}`} onClick={()=>setViewMode('grid')}>Grid</button>
              <button className={`px-4 py-2 rounded-md ${viewMode==='list'?'bg-amber-600 text-white':'bg-amber-100 text-amber-900 border border-amber-200'}`} onClick={()=>setViewMode('list')}>List</button>
            </div>
          </div>
        </motion.div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/40 shadow-md flex items-center justify-between">
          <div className="text-3xl font-semibold text-slate-800">Welcome in,</div>
          <div className="grid grid-cols-3 gap-4 text-sm text-slate-700">
            <div className="text-right">Employees<br/><span className="font-semibold text-slate-900">78</span></div>
            <div className="text-right">Hirings<br/><span className="font-semibold text-slate-900">56</span></div>
            <div className="text-right">Projects<br/><span className="font-semibold text-slate-900">203</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-4 shadow-md text-violet-800">
            <div className="text-sm">Present Today</div>
            <div className="text-2xl font-bold text-violet-900">3</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-4 shadow-md text-violet-800">
            <div className="text-sm">Late Today</div>
            <div className="text-2xl font-bold text-violet-900">1</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-4 shadow-md text-violet-800">
            <div className="text-sm">On Leave</div>
            <div className="text-2xl font-bold text-violet-900">1</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-4 shadow-md text-violet-800">
            <div className="text-sm">Attendance Rate</div>
            <div className="text-2xl font-bold text-violet-900">96.5%</div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-3 font-semibold text-amber-900">Employee</th>
                  <th className="text-left p-3 font-semibold text-amber-900">Department</th>
                  <th className="text-left p-3 font-semibold text-amber-900">Status</th>
                  <th className="text-left p-3 font-semibold text-amber-900">Check In</th>
                  <th className="text-left p-3 font-semibold text-amber-900">Check Out</th>
                  <th className="text-left p-3 font-semibold text-amber-900">Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="border-b border-amber-200 hover:bg-amber-50">
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-300 text-amber-900 flex items-center justify-center font-semibold">{record.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}</div>
                      <div>{record.employeeName}</div>
                    </td>
                    <td className="p-3 text-sm">{record.department}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusChipColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1">{record.status.replace('_',' ').toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="p-3">{record.checkIn}</td>
                    <td className="p-3">{record.checkOut ?? '--'}</td>
                    <td className="p-3">{record.workHours ?? '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAttendance.map((record) => {
              const initials = record.employeeName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();
              return (
            <div key={record.id} className="bg-cyan-100 border border-cyan-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-full bg-emerald-400 text-emerald-900 flex items-center justify-center font-semibold">{initials}</div>
                    <div>
                      <div className="font-semibold text-emerald-900">{record.employeeName}</div>
                      <div className="text-xs text-emerald-700">{record.department}</div>
                    </div>
                    <span className={`ml-auto w-3 h-3 rounded-full ${getDotColor(record.status)}`} />
                  </div>
                  <div className="text-sm text-emerald-800 mb-1">{record.date}</div>
                  <div className={statusChipColor(record.status) + ' inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border mt-2'}>
                    {getStatusIcon(record.status)}
                    <span className="ml-1">{record.status.replace('_',' ').toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-emerald-800 mt-2">In {record.checkIn} / Out {record.checkOut ?? '--'}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
