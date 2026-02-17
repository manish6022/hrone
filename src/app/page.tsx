"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Package,
  Factory,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { EmployeeProfile } from "@/components/employee-profile";
import { AttendanceCalendar } from "@/components/ui/attendance-calendar";
import type { AttendanceRecord } from "@/components/ui/attendance-calendar";

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  pendingLeave: number;
  todayAttendance: number;
  lateToday: number;
  avgWorkHours: string;
  totalPayroll: number;
  pendingApprovals: number;
  productionItems: number;
  avgPerformance: number;
}

interface Birthday {
  id: number;
  name: string;
  date: string;
  daysUntil: number;
  avatar: string;
}

interface Holiday {
  date: number;
  name: string;
  type: "public" | "company";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    pendingLeave: 0,
    todayAttendance: 0,
    lateToday: 0,
    avgWorkHours: "0h",
    totalPayroll: 0,
    pendingApprovals: 0,
    productionItems: 0,
    avgPerformance: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Birthday[]>([]);
  const [currentBirthdayIndex, setCurrentBirthdayIndex] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    const abortController = new AbortController();
    
    const loadData = async () => {
      try {
        await fetchDashboardData(abortController.signal);
        fetchUpcomingBirthdays();
        fetchHolidays();
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Failed to load dashboard data", error);
        }
      }
    };
    
    loadData();
    
    return () => {
      abortController.abort();
    };
  }, []);

  const fetchDashboardData = async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    try {
      const usersResponse = await api.post("/user/all", {}, { signal });
      if (signal?.aborted) return;
      
      const users = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : usersResponse.data?.data || [];

      setStats({
        totalEmployees: users.length,
        activeEmployees: Math.floor(users.length * 0.92),
        onLeave: Math.floor(users.length * 0.05),
        pendingLeave: 3,
        todayAttendance: Math.floor(users.length * 0.88),
        lateToday: Math.floor(users.length * 0.08),
        avgWorkHours: "8.5h",
        totalPayroll: 2450000,
        pendingApprovals: 5,
        productionItems: 12,
        avgPerformance: 87.3,
      });

      setRecentActivities([
        {
          type: "leave",
          user: "Sarah Connor",
          action: "applied for leave",
          time: "5 mins ago",
          icon: Calendar,
        },
        {
          type: "attendance",
          user: "John Doe",
          action: "marked attendance",
          time: "15 mins ago",
          icon: CheckCircle,
        },
        {
          type: "production",
          user: "Mike Ross",
          action: "logged production",
          time: "1 hour ago",
          icon: Factory,
        },
        {
          type: "payroll",
          user: "System",
          action: "processed payroll",
          time: "2 hours ago",
          icon: DollarSign,
        },
      ]);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError' && error.message !== 'canceled') {
        console.error("Failed to fetch dashboard data", error);
      }
    }
  };

  const fetchUpcomingBirthdays = () => {
    // Mock birthday data - replace with actual API call
    const mockBirthdays: Birthday[] = [
      {
        id: 1,
        name: "Sarah Connor",
        date: "Feb 10",
        daysUntil: 3,
        avatar: "SC",
      },
      { id: 2, name: "John Doe", date: "Feb 15", daysUntil: 8, avatar: "JD" },
      { id: 3, name: "Mike Ross", date: "Feb 20", daysUntil: 13, avatar: "MR" },
      {
        id: 4,
        name: "Rachel Zane",
        date: "Feb 25",
        daysUntil: 18,
        avatar: "RZ",
      },
    ];
    setUpcomingBirthdays(mockBirthdays);
  };

  const fetchHolidays = () => {
    // Mock holidays for current month
    const mockHolidays: Holiday[] = [
      { date: 15, name: "Maha Shivaratri", type: "public" },
      { date: 19, name: "Chhatrapati Shivaji Maharaj Jayanti", type: "public" },
    ];
    setHolidays(mockHolidays);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const today = new Date().getDate();
    const isCurrentMonth =
      currentMonth.getMonth() === new Date().getMonth() &&
      currentMonth.getFullYear() === new Date().getFullYear();

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const holiday = holidays.find((h) => h.date === day);
      const isToday = isCurrentMonth && day === today;

      days.push(
        <motion.div
          key={day}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: day * 0.01, duration: 0.2 }}
          className={cn(
            "h-12 flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer relative",
            isToday && "bg-[#2D2D2D] text-white shadow-lg",
            !isToday &&
              holiday &&
              "bg-red-50 text-red-600 border border-red-200",
            !isToday && !holiday && "hover:bg-[#E8E2D5] text-[#2D2D2D]"
          )}
          whileHover={{ scale: 1.05 }}
        >
          <span>{day}</span>
          {holiday && (
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
          )}
        </motion.div>
      );
    }

    return days;
  };

  const handleNextBirthday = () => {
    setCurrentBirthdayIndex((prev) => {
      const nextIndex = prev < upcomingBirthdays.length - 1 ? prev + 1 : 0;
      return nextIndex;
    });
  };

  const handlePrevBirthday = () => {
    setCurrentBirthdayIndex((prev) => {
      const prevIndex = prev > 0 ? prev - 1 : upcomingBirthdays.length - 1;
      return prevIndex;
    });
  };

  const greeting = getGreeting();

  const StatCard = ({ title, value, change, icon: Icon, color, gradient, delay = 0 }: any) => (
    <div
      key={`stat-${title}`}
      className="relative overflow-hidden group transition-all duration-300 hover:-translate-y-2"
    >
      <div className={cn(
        "relative rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl hover:shadow-violet-200/40",
        gradient || "bg-gradient-to-br from-white to-gray-50 border-gray-200"
      )}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
        </div>
        
        {/* Enhanced Rounded Shadow Effect */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-100/15 via-violet-200/10 to-purple-100/15 blur-2xl"></div>
        </div>
        
        {/* Additional Soft Shadow Layer */}
        <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-200/10 via-transparent to-purple-200/10 blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-3 rounded-2xl shadow-lg transition-transform duration-200 hover:scale-110 hover:rotate-5", color)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                {title}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
              {value}
            </div>
            
            {change && (
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  change.includes('+') ? "bg-green-500" : change.includes('-') ? "bg-red-500" : "bg-gray-500"
                )} />
                <p className="text-sm font-medium text-gray-600">{change}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );

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
      {/* Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-black to-black bg-clip-text text-transparent">
            {greeting}, {user?.username || (user as any)?.name || "User"}!
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Here's your HROne overview for today
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          change={`${stats.activeEmployees} active`}
          icon={Users}
          color="bg-blue-500 text-white shadow-blue-500/50"
          gradient="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200"
          delay={0.1}
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.todayAttendance}/${stats.totalEmployees}`}
          change={`${stats.lateToday} late arrivals`}
          icon={CheckCircle}
          color="bg-emerald-500 text-white shadow-emerald-500/50"
          gradient="bg-gradient-to-br from-emerald-50 via-white to-green-50 border-emerald-200"
          delay={0.2}
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          change="Requires attention"
          icon={AlertCircle}
          color="bg-orange-500 text-white shadow-orange-500/50"
          gradient="bg-gradient-to-br from-orange-50 via-white to-amber-50 border-orange-200"
          delay={0.3}
        />
        <StatCard
          title="Avg Performance"
          value={`${stats.avgPerformance}%`}
          change="+2.3% from last month"
          icon={TrendingUp}
          color="bg-purple-500 text-white shadow-purple-500/50"
          gradient="bg-gradient-to-br from-purple-50 via-white to-pink-50 border-purple-200"
          delay={0.4}
        />
      </div>

    {/* Enhanced Birthday & Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-stretch">
        {/* Enhanced Employee Birthday Card with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative w-full min-h-[500px] h-full group" // CHANGED: Added w-full and h-full
        >
          {/* Birthday Card Stack */}
          {upcomingBirthdays.length > 0 && (
            <div className="relative h-full w-full"> {/* CHANGED: Added w-full */}
              {upcomingBirthdays.map((birthday, index) => {
                const offset = index - currentBirthdayIndex;
                const isActive = index === currentBirthdayIndex;

                // Only render active, previous, and next cards to save resources
                if (Math.abs(offset) > 1) return null;

                return (
                  <motion.div
                    key={birthday.id}
                    initial={false}
                    animate={{
                      x: isActive ? 0 : offset * 40, // Adjusted offset logic
                      scale: isActive ? 1 : 0.9,
                      opacity: isActive ? 1 : 0,
                      zIndex: isActive ? 10 : 0,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 w-full h-full" // CHANGED: Ensure wrapper fills container
                    style={{
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    <EmployeeProfile
                      name={birthday.name}
                      birthday={birthday.date}
                      daysUntil={birthday.daysUntil}
                      avatar={birthday.avatar}
                      variant="birthday"
                      isActive={isActive}
                      onNext={handleNextBirthday}
                      onPrev={handlePrevBirthday}
                      currentIndex={currentBirthdayIndex}
                      totalCount={upcomingBirthdays.length}
                      className="w-full h-full" // Explicitly passing full size
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative w-full min-h-[500px] h-full" // CHANGED: Added h-full to match neighbor
        >
          <AttendanceCalendar
            attendanceData={[]} // Empty array for main dashboard
            holidays={holidays}
          />
        </motion.div>
      </div>

      {/* Main Content Grid */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> */}
        {/* Enhanced Recent Activity with Glassmorphism */}
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="lg:col-span-2 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 rounded-3xl"></div>
          <div className="relative bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-blue-200/50 hover:shadow-2xl transition-all duration-300">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex items-center justify-between mb-6"
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Recent Activity
              </h3>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-green-500 rounded-full"
              />
            </motion.div>
            
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  whileHover={{ 
                    x: 5, 
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    transition: { duration: 0.2 }
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-gray-200/50 cursor-pointer"
                >
                  <motion.div 
                    className={cn(
                      "p-3 rounded-xl shadow-lg",
                      activity.type === 'leave' ? "bg-amber-100 text-amber-600" :
                      activity.type === 'attendance' ? "bg-emerald-100 text-emerald-600" :
                      activity.type === 'production' ? "bg-blue-100 text-blue-600" :
                      "bg-purple-100 text-purple-600"
                    )}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <activity.icon className="h-5 w-5" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {activity.user}{" "}
                      <span className="font-normal text-gray-600">
                        {activity.action}
                      </span>
                    </p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                      className="text-xs text-gray-500"
                    >
                      {activity.time}
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                    className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div> */}

      {/* Enhanced Additional Stats with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Leave Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-green-400/20 rounded-3xl"></div>
          <div className="relative bg-gradient-to-br from-emerald-50/80 via-white to-green-50/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 hover:shadow-2xl transition-all duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="flex items-center justify-between mb-6"
            >
              <h4 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                Leave Status
              </h4>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="p-2 rounded-xl bg-emerald-100 text-emerald-600 shadow-lg"
              >
                <Calendar className="h-5 w-5" />
              </motion.div>
            </motion.div>
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">On Leave Today</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.3 }}
                  className="text-2xl font-bold text-emerald-700"
                >
                  {stats.onLeave}
                </motion.span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">Pending Requests</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.3 }}
                  className="text-2xl font-bold text-amber-600"
                >
                  {stats.pendingLeave}
                </motion.span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Production Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-indigo-400/20 rounded-3xl"></div>
          <div className="relative bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-200/50 hover:shadow-2xl transition-all duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="flex items-center justify-between mb-6"
            >
              <h4 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Production
              </h4>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="p-2 rounded-xl bg-blue-100 text-blue-600 shadow-lg"
              >
                <Package className="h-5 w-5" />
              </motion.div>
            </motion.div>
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">Active Items</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.3 }}
                  className="text-2xl font-bold text-blue-700"
                >
                  {stats.productionItems}
                </motion.span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">Today's Entries</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.3 }}
                  className="text-2xl font-bold text-indigo-600"
                >
                  24
                </motion.span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Payroll Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-transparent to-orange-400/20 rounded-3xl"></div>
          <div className="relative bg-gradient-to-br from-amber-50/80 via-white to-orange-50/80 backdrop-blur-sm rounded-3xl p-8 border border-amber-200/50 hover:shadow-2xl transition-all duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="flex items-center justify-between mb-6"
            >
              <h4 className="text-lg font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                Payroll
              </h4>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-2 rounded-xl bg-amber-100 text-amber-600 shadow-lg"
              >
                <DollarSign className="h-5 w-5" />
              </motion.div>
            </motion.div>
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">This Month</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.3 }}
                  className="text-xl font-bold text-amber-700"
                >
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    notation: "compact",
                  }).format(stats.totalPayroll)}
                </motion.span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">Processed</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.3 }}
                  className="text-2xl font-bold text-orange-600"
                >
                  95%
                </motion.span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
