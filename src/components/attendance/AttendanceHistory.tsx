"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface AttendanceRecord {
  date: string;
  day: string;
  punchIn: string;
  punchOut: string;
  totalHours: string;
  late: boolean;
  overtime: string;
  status: "present" | "absent" | "holiday" | "weekend";
}

export interface MonthlyStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  overtimeHours: string;
  avgWorkHours: string;
}

export interface OvertimeRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  hours: number;
  category: 'regular' | 'holiday' | 'night';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

interface AttendanceHistoryProps {
  showBackButton?: boolean;
}

export function AttendanceHistory({ showBackButton = false }: AttendanceHistoryProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [overtimeData, setOvertimeData] = useState<OvertimeRecord[]>([]);
  const [stats, setStats] = useState<MonthlyStats>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    overtimeHours: "0h",
    avgWorkHours: "0h",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [currentMonth]);

  const fetchAttendanceData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockAttendanceData: AttendanceRecord[] = [
        {
          date: "2024-02-01",
          day: "Thu",
          punchIn: "09:15",
          punchOut: "18:30",
          totalHours: "9h 15m",
          late: true,
          overtime: "0h 30m",
          status: "present"
        },
        {
          date: "2024-02-02",
          day: "Fri",
          punchIn: "09:00",
          punchOut: "18:00",
          totalHours: "9h 00m",
          late: false,
          overtime: "0h 00m",
          status: "present"
        },
        {
          date: "2024-02-03",
          day: "Sat",
          punchIn: "-",
          punchOut: "-",
          totalHours: "-",
          late: false,
          overtime: "0h 00m",
          status: "weekend"
        },
        {
          date: "2024-02-04",
          day: "Sun",
          punchIn: "-",
          punchOut: "-",
          totalHours: "-",
          late: false,
          overtime: "0h 00m",
          status: "weekend"
        },
        {
          date: "2024-02-05",
          day: "Mon",
          punchIn: "08:45",
          punchOut: "19:15",
          totalHours: "10h 30m",
          late: false,
          overtime: "1h 30m",
          status: "present"
        },
        {
          date: "2024-02-06",
          day: "Tue",
          punchIn: "09:30",
          punchOut: "18:45",
          totalHours: "9h 15m",
          late: true,
          overtime: "0h 45m",
          status: "present"
        },
        {
          date: "2024-02-07",
          day: "Wed",
          punchIn: "09:00",
          punchOut: "18:00",
          totalHours: "9h 00m",
          late: false,
          overtime: "0h 00m",
          status: "present"
        },
      ];

      // Mock overtime data
      const mockOvertimeData: OvertimeRecord[] = [
        {
          id: 1,
          employeeId: 1,
          employeeName: "John Doe",
          date: "2024-02-01",
          hours: 2.5,
          category: 'regular',
          status: 'approved',
          reason: 'Client presentation preparation and delivery'
        },
        {
          id: 2,
          employeeId: 1,
          employeeName: "John Doe",
          date: "2024-02-05",
          hours: 3.0,
          category: 'regular',
          status: 'approved',
          reason: 'Emergency client meeting and follow-up work'
        },
        {
          id: 3,
          employeeId: 1,
          employeeName: "John Doe",
          date: "2024-02-06",
          hours: 1.5,
          category: 'holiday',
          status: 'pending',
          reason: 'Holiday work for urgent system maintenance'
        },
        {
          id: 4,
          employeeId: 1,
          employeeName: "John Doe",
          date: "2024-02-07",
          hours: 2.0,
          category: 'night',
          status: 'approved',
          reason: 'Night shift support for international client calls'
        }
      ];

      setAttendanceData(mockAttendanceData);
      setOvertimeData(mockOvertimeData);

      // Calculate stats
      const presentDays = mockAttendanceData.filter(d => d.status === "present").length;
      const absentDays = mockAttendanceData.filter(d => d.status === "absent").length;
      const lateDays = mockAttendanceData.filter(d => d.late).length;
      const totalOvertime = mockAttendanceData.reduce((sum, d) => {
        const hours = parseInt(d.overtime.split('h')[0]) || 0;
        return sum + hours;
      }, 0);
      const totalWorkHours = mockAttendanceData.reduce((sum, d) => {
        if (d.totalHours === "-") return sum;
        const hours = parseInt(d.totalHours.split('h')[0]) || 0;
        return sum + hours;
      }, 0);

      setStats({
        totalDays: mockAttendanceData.length,
        presentDays,
        absentDays,
        lateDays,
        overtimeHours: `${totalOvertime}h`,
        avgWorkHours: presentDays > 0 ? `${Math.round(totalWorkHours / presentDays)}h` : "0h"
      });
    } catch (error) {
      console.error("Failed to fetch attendance data", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getStatusColor = (status: string, late: boolean) => {
    if (status === "weekend") return "bg-gray-100 text-gray-600";
    if (status === "holiday") return "bg-red-100 text-red-600";
    if (status === "absent") return "bg-orange-100 text-orange-600";
    if (late) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-600";
  };

  const getStatusText = (status: string, late: boolean) => {
    if (status === "weekend") return "Weekend";
    if (status === "holiday") return "Holiday";
    if (status === "absent") return "Absent";
    if (late) return "Late";
    return "On Time";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 relative min-h-screen">
      {/* Beautiful Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            height: ["320px", "400px", "320px"],
            width: ["320px", "400px", "320px"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
          animate={{
            height: ["384px", "450px", "384px"],
            width: ["384px", "450px", "384px"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl"
          animate={{
            height: ["256px", "320px", "256px"],
            width: ["256px", "320px", "256px"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-8 border border-blue-100 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2 md:gap-4">
            {showBackButton && (
              <motion.button
                onClick={() => router.back()}
                className="p-2 rounded-xl hover:bg-white/80 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              </motion.button>
            )}
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-black to-black bg-clip-text text-transparent">
              Attendance History
            </h2>
          </div>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
            Your detailed attendance records for {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <motion.button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl hover:bg-white/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </motion.button>
          <div className="text-right bg-white rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-sm border border-gray-100">
            <p className="text-xs md:text-sm font-semibold text-gray-900">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <p className="text-xs text-gray-500">
              {stats.presentDays} days present
            </p>
          </div>
          <motion.button
            onClick={handleNextMonth}
            className="p-2 rounded-xl hover:bg-white/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-3xl p-4 md:p-6 border border-blue-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 md:p-3 rounded-2xl bg-blue-500 text-white shadow-lg">
              <Calendar className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Present Days</p>
            </div>
          </div>
          <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
            {stats.presentDays}
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-2">of {stats.totalDays} days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-3xl p-4 md:p-6 border border-orange-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 md:p-3 rounded-2xl bg-orange-500 text-white shadow-lg">
              <AlertCircle className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Late Days</p>
            </div>
          </div>
          <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-900 to-orange-700 bg-clip-text text-transparent">
            {stats.lateDays}
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-2">This month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl p-4 md:p-6 border border-purple-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 md:p-3 rounded-2xl bg-purple-500 text-white shadow-lg">
              <TrendingUp className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Overtime</p>
            </div>
          </div>
          <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-900 to-purple-700 bg-clip-text text-transparent">
            {stats.overtimeHours}
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-2">Total overtime</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-3xl p-4 md:p-6 border border-emerald-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 md:p-3 rounded-2xl bg-emerald-500 text-white shadow-lg">
              <Clock className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Avg Hours</p>
            </div>
          </div>
          <div className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent">
            {stats.avgWorkHours}
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-2">Per day</p>
        </motion.div>
      </div>

      {/* Enhanced Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative group"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50 to-purple-50 rounded-3xl p-4 md:p-8 border border-indigo-200 shadow-xl">
          {/* Decorative Background Elements - Optimized for Mobile */}
          <motion.div
            animate={{
              rotate: 180,
              height: ["160px", "200px", "160px"],
              width: ["160px", "200px", "160px"]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              height: { duration: 3, ease: "easeInOut" },
              width: { duration: 3, ease: "easeInOut" }
            }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl hidden sm:block"
          />
          <motion.div
            animate={{
              rotate: -180,
              height: ["128px", "160px", "128px"],
              width: ["128px", "160px", "128px"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              height: { duration: 2.5, ease: "easeInOut" },
              width: { duration: 2.5, ease: "easeInOut" }
            }}
            className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-pink-100/50 to-rose-100/50 rounded-full blur-3xl hidden sm:block"
          />

          {/* Mobile-friendly static background elements */}
          <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-sm sm:hidden" />
          <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-pink-100/30 to-rose-100/30 rounded-full blur-sm sm:hidden" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                Attendance Details
              </h3>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-2 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 shadow-lg hidden sm:block"
              >
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
              </motion.div>

              {/* Static clock for mobile */}
              <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 shadow-lg sm:hidden">
                <Clock className="h-4 w-4" />
              </div>
            </div>

            {/* Mobile Card View - Optimized for Performance */}
            <div className="block sm:hidden space-y-3">
              {attendanceData.map((record, index) => (
                <div
                  key={record.date}
                  className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-4 border border-indigo-200 shadow-lg active:shadow-xl transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl",
                          record.status === "weekend" ? "bg-gradient-to-br from-gray-200 to-gray-300" :
                          record.status === "holiday" ? "bg-gradient-to-br from-red-200 to-red-300" :
                          record.status === "absent" ? "bg-gradient-to-br from-orange-200 to-orange-300" :
                          record.late ? "bg-gradient-to-br from-yellow-200 to-yellow-300" :
                          "bg-gradient-to-br from-green-200 to-green-300"
                        )}
                      >
                        {record.status === "weekend" ? (
                          <Calendar className="h-5 w-5 text-gray-700" />
                        ) : record.status === "holiday" ? (
                          <AlertCircle className="h-5 w-5 text-red-700" />
                        ) : record.status === "absent" ? (
                          <XCircle className="h-5 w-5 text-orange-700" />
                        ) : record.late ? (
                          <AlertCircle className="h-5 w-5 text-yellow-700" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-700" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(record.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                        <p className="text-xs text-gray-500">{record.day}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-lg",
                        record.status === "weekend" ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700" :
                        record.status === "holiday" ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700" :
                        record.status === "absent" ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700" :
                        record.late ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700" :
                        "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                      )}
                    >
                      {getStatusText(record.status, record.late)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl p-3 border border-blue-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={cn(
                            "p-2 rounded-lg shadow-md",
                            record.punchIn !== "-" ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
                          )}
                        >
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-blue-700">Punch In</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{record.punchIn}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl p-3 border border-emerald-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={cn(
                            "p-2 rounded-lg shadow-md",
                            record.punchOut !== "-" ? "bg-emerald-500 text-white" : "bg-gray-300 text-gray-500"
                          )}
                        >
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-700">Punch Out</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{record.punchOut}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl p-3 border border-purple-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shadow-md",
                            record.totalHours !== "-" ? "bg-purple-500" : "bg-gray-300"
                          )}
                        />
                        <span className="text-xs font-semibold text-purple-700">Total Hours</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{record.totalHours}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/30 rounded-xl p-3 border border-orange-200/50">
                      <div className="flex items-center gap-2 mb-1">
                        {record.overtime !== "0h 00m" && (
                          <div className="w-2 h-2 rounded-full bg-orange-500 shadow-md" />
                        )}
                        <span className="text-xs font-semibold text-orange-700">Overtime</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{record.overtime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-1 border border-indigo-200 shadow-xl">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider border-r border-indigo-400">Date</th>
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider border-r border-indigo-400">Day</th>
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider border-r border-indigo-400">Punch In</th>
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider border-r border-indigo-400">Punch Out</th>
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider border-r border-indigo-400">Total Hours</th>
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider border-r border-indigo-400">Overtime</th>
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((record, index) => (
                      <motion.tr
                        key={record.date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.05, duration: 0.4 }}
                        whileHover={{
                          backgroundColor: "rgba(99, 102, 241, 0.05)",
                          transition: { duration: 0.2 }
                        }}
                        className="border-b border-indigo-100 hover:bg-indigo-50/30 transition-all duration-200"
                      >
                        <td className="py-4 px-4 border-r border-indigo-100">
                          <div className="flex items-center gap-3">
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                                record.status === "weekend" ? "bg-gradient-to-br from-gray-200 to-gray-300" :
                                record.status === "holiday" ? "bg-gradient-to-br from-red-200 to-red-300" :
                                record.status === "absent" ? "bg-gradient-to-br from-orange-200 to-orange-300" :
                                record.late ? "bg-gradient-to-br from-yellow-200 to-yellow-300" :
                                "bg-gradient-to-br from-green-200 to-green-300"
                              )}
                            >
                              {record.status === "weekend" ? (
                                <Calendar className="h-5 w-5 text-gray-700" />
                              ) : record.status === "holiday" ? (
                                <AlertCircle className="h-5 w-5 text-red-700" />
                              ) : record.status === "absent" ? (
                                <XCircle className="h-5 w-5 text-orange-700" />
                              ) : record.late ? (
                                <AlertCircle className="h-5 w-5 text-yellow-700" />
                              ) : (
                                <CheckCircle className="h-5 w-5 text-green-700" />
                              )}
                            </motion.div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {new Date(record.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                              </p>
                              <p className="text-xs text-gray-500">{record.day}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 border-r border-indigo-100">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800">
                            {record.day}
                          </span>
                        </td>
                        <td className="py-4 px-4 border-r border-indigo-100">
                          <div className="flex items-center gap-2">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className={cn(
                                "p-2 rounded-lg shadow-md",
                                record.punchIn !== "-" ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white" : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-500"
                              )}
                            >
                              <Clock className="h-4 w-4" />
                            </motion.div>
                            <span className="text-sm font-bold text-gray-900">{record.punchIn}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 border-r border-indigo-100">
                          <div className="flex items-center gap-2">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              className={cn(
                                "p-2 rounded-lg shadow-md",
                                record.punchOut !== "-" ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white" : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-500"
                              )}
                            >
                              <Clock className="h-4 w-4" />
                            </motion.div>
                            <span className="text-sm font-bold text-gray-900">{record.punchOut}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 border-r border-indigo-100">
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                              className={cn(
                                "w-2 h-2 rounded-full shadow-md",
                                record.totalHours !== "-" ? "bg-gradient-to-r from-purple-400 to-purple-500" : "bg-gradient-to-r from-gray-300 to-gray-400"
                              )}
                            />
                            <span className="text-sm font-bold text-gray-900">{record.totalHours}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 border-r border-indigo-100">
                          <div className="flex items-center gap-2">
                            {record.overtime !== "0h 00m" && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                                className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 shadow-md"
                              />
                            )}
                            <span className="text-sm font-bold text-gray-900">{record.overtime}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                            className={cn(
                              "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all duration-200",
                              record.status === "weekend" ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700" :
                              record.status === "holiday" ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700" :
                              record.status === "absent" ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700" :
                              record.late ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700" :
                              "bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                            )}
                          >
                            {getStatusText(record.status, record.late)}
                          </motion.span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overtime Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-3xl p-4 md:p-8 border border-orange-200 shadow-xl">
          {/* Decorative Background Elements */}
          <motion.div
            animate={{
              rotate: 45,
              height: ["200px", "250px", "200px"],
              width: ["200px", "250px", "200px"]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
              height: { duration: 4, ease: "easeInOut" },
              width: { duration: 4, ease: "easeInOut" }
            }}
            className="absolute -top-25 -right-25 w-50 h-50 bg-gradient-to-br from-orange-100/40 to-amber-100/40 rounded-full blur-3xl hidden sm:block"
          />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-700 via-amber-700 to-yellow-700 bg-clip-text text-transparent">
                Overtime Details
              </h3>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="p-2 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 shadow-lg hidden sm:block"
              >
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
              </motion.div>
            </div>

            {/* Mobile Overtime Cards */}
            <div className="block sm:hidden space-y-4">
              {overtimeData.map((record, index) => (
                <div
                  key={record.id}
                  className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-4 border border-orange-200 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(record.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                        </p>
                        <p className="text-xs text-slate-500">{record.category} overtime</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      record.status === 'approved' ? 'bg-green-100 border-green-300 text-green-800' :
                      record.status === 'pending' ? 'bg-amber-100 border-amber-300 text-amber-800' :
                      'bg-red-100 border-red-300 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl p-3 border border-blue-200/50">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-md" />
                          <span className="text-xs font-semibold text-blue-700">Hours</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{record.hours}h</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl p-3 border border-purple-200/50">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-purple-500 shadow-md" />
                          <span className="text-xs font-semibold text-purple-700">Category</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 capitalize">{record.category}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/30 rounded-xl p-3 border border-gray-200/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500 shadow-md" />
                        <span className="text-xs font-semibold text-gray-700">Reason</span>
                      </div>
                      <p className="text-sm text-slate-700">{record.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
              {overtimeData.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No overtime records</p>
                  <p className="text-slate-400 text-sm mt-1">Overtime hours will appear here</p>
                </div>
              )}
            </div>

            {/* Desktop Overtime Table */}
            <div className="hidden sm:block overflow-x-auto">
              <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-1 border border-orange-200 shadow-xl">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider border-r border-orange-400">Date</th>
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider border-r border-orange-400">Hours</th>
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider border-r border-orange-400">Category</th>
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider border-r border-orange-400">Reason</th>
                      <th className="text-left py-4 px-4 text-sm font-bold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overtimeData.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.05, duration: 0.4 }}
                        whileHover={{
                          backgroundColor: "rgba(251, 146, 60, 0.05)",
                          transition: { duration: 0.2 }
                        }}
                        className="border-b border-orange-100 hover:bg-orange-50/30 transition-all duration-200"
                      >
                        <td className="py-4 px-4 border-r border-orange-100">
                          <div className="flex items-center gap-3">
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                              className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg"
                            >
                              <Clock className="h-5 w-5 text-white" />
                            </motion.div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {new Date(record.date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                              </p>
                              <p className="text-xs text-slate-500">{record.category} overtime</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 border-r border-orange-100">
                          <div className="flex items-center gap-2">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="p-2 rounded-lg shadow-md bg-gradient-to-br from-blue-400 to-blue-500 text-white"
                            >
                              <Clock className="h-4 w-4" />
                            </motion.div>
                            <span className="text-sm font-bold text-slate-900">{record.hours}h</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 border-r border-orange-100">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 capitalize">
                            {record.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 border-r border-orange-100">
                          <p className="text-sm text-slate-700 max-w-xs truncate" title={record.reason}>
                            {record.reason}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.1 + index * 0.1, duration: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all duration-200 ${
                              record.status === 'approved' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                              record.status === 'pending' ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800' :
                              'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                            }`}
                          >
                            {record.status}
                          </motion.span>
                        </td>
                      </motion.tr>
                    ))}
                    {overtimeData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 px-4 text-center">
                          <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 font-medium">No overtime records found</p>
                          <p className="text-slate-400 text-sm mt-1">Overtime details will appear here</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
