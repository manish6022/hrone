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
  Clock,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { EmployeeProfile } from "@/components/employee-profile";
import { AttendanceCalendar } from "@/components/ui/attendance-calendar";
import type { AttendanceRecord } from "@/components/ui/attendance-calendar";
import { useRouter } from "next/navigation";

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

interface ESSData {
  leaveBalances: any[];
  upcomingHolidays: any[];
  monthlyAttendanceCount: number;
  attendanceData?: Array<{ date: string; status: string }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
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
  const [essData, setEssData] = useState<ESSData>({
    leaveBalances: [],
    upcomingHolidays: [],
    monthlyAttendanceCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Birthday[]>([]);
  const [currentBirthdayIndex, setCurrentBirthdayIndex] = useState(0);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    const abortController = new AbortController();
    
    const loadData = async () => {
      try {
        await fetchDashboardData(abortController.signal);
        await fetchEssData(abortController.signal);
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

    // Initialize with default values, will be updated when ESS data loads
    setStats({
      totalEmployees: 1, // Personal view - just the user
      activeEmployees: 1,
      onLeave: 0,
      pendingLeave: 0,
      todayAttendance: 1, // Will be updated with actual attendance
      lateToday: 0,
      avgWorkHours: "8.5h",
      totalPayroll: 0,
      pendingApprovals: 0,
      productionItems: 0,
      avgPerformance: 0,
    });
  };

  const fetchEssData = async (signal?: AbortSignal) => {
    if (!user?.id || signal?.aborted) return;

    try {
      const response = await api.get(`/api/ess/dashboard/${user.id}`, { signal });
      if (response.data && response.data.data) {
        const essData = response.data.data;
        setEssData(essData);

        // Update personal stats based on ESS data
        if (essData.monthlyAttendanceCount !== undefined) {
          setStats(prev => ({
            ...prev,
            todayAttendance: essData.monthlyAttendanceCount || 1, // Use monthly count as daily attendance indicator
            avgPerformance: 95, // Personal performance
          }));
        }
      }
    } catch (err: any) {
      // Properly handle CanceledError (AbortError)
      if (err.name === 'AbortError' || err.message === 'canceled' || err.code === 'ERR_CANCELED') {
        // Request was canceled, this is expected behavior
        console.log('ESS data fetch was canceled - component unmounted');
        return;
      }
      
      console.error("Failed to fetch ESS data", err);
    } finally {
      setLoading(false);
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
    <div className="space-y-8 pb-8 relative overflow-hidden overflow-x-hidden">
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
        <motion.div
          onClick={() => router.push('/employee-dashboard/attendance')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
        >
          <StatCard
            title="Monthly Attendance"
            value={essData.monthlyAttendanceCount}
            change="Days Present"
            icon={Clock}
            color="bg-blue-500 text-white shadow-blue-500/50"
            gradient="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200"
            delay={0.1}
          />
        </motion.div>
        <StatCard
          title="Leave Types"
          value={3}
          change="Active Types"
          icon={Calendar}
          color="bg-emerald-500 text-white shadow-emerald-500/50"
          gradient="bg-gradient-to-br from-emerald-50 via-white to-green-50 border-emerald-200"
          delay={0.2}
        />
        <StatCard
          title="Upcoming Holidays"
          value={5}
          change="This Year"
          icon={CalendarDays}
          color="bg-orange-500 text-white shadow-orange-500/50"
          gradient="bg-gradient-to-br from-orange-50 via-white to-amber-50 border-orange-200"
          delay={0.3}
        />
        <StatCard
          title="Leave Balance"
          value={15}
          change="Total Days"
          icon={Package}
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
            attendanceData={(essData.attendanceData || []) as AttendanceRecord[]}
            holidays={essData.upcomingHolidays || []}
          />
        </motion.div>
      </div>

      {/* Enhanced Additional Stats with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Leave Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-green-400/20 rounded-3xl"></div>
          <div className="relative h-full flex flex-col bg-gradient-to-br from-emerald-50/80 via-white to-green-50/80 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200/50 hover:shadow-2xl transition-all duration-300">
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
            
            <div className="space-y-4 flex-grow">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">Total Leave Balance</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0, duration: 0.3 }}
                  className="text-2xl font-bold text-emerald-700"
                >
                  0
                </motion.span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">Active Leave Types</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.3 }}
                  className="text-2xl font-bold text-blue-600"
                >
                  0
                </motion.span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Holiday Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-pink-400/20 rounded-3xl"></div>
          <div className="relative h-full flex flex-col bg-gradient-to-br from-purple-50/80 via-white to-pink-50/80 backdrop-blur-sm rounded-3xl p-8 border border-purple-200/50 hover:shadow-2xl transition-all duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="flex items-center justify-between mb-6"
            >
              <h4 className="text-lg font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                Holiday Information
              </h4>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-2 rounded-xl bg-purple-100 text-purple-600 shadow-lg"
              >
                <TrendingUp className="h-5 w-5" />
              </motion.div>
            </motion.div>
            
            <div className="space-y-4 flex-grow">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">Upcoming Holidays</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.3 }}
                  className="text-2xl font-bold text-purple-700"
                >
                  {holidays.length}
                </motion.span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">Next Holiday</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.3 }}
                  className="text-sm font-bold text-pink-600"
                >
                  {holidays.length > 0 ? 
                    new Date(holidays[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
                    : "N/A"}
                </motion.span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Attendance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative group h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-indigo-400/20 rounded-3xl"></div>
          <div className="relative h-full flex flex-col bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-200/50 hover:shadow-2xl transition-all duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="flex items-center justify-between mb-6"
            >
              <h4 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Attendance Summary
              </h4>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="p-2 rounded-xl bg-blue-100 text-blue-600 shadow-lg"
              >
                <CheckCircle className="h-5 w-5" />
              </motion.div>
            </motion.div>
            
            <div className="space-y-4 flex-grow">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">Monthly Attendance</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.3 }}
                  className="text-2xl font-bold text-blue-700"
                >
                  {stats.todayAttendance}
                </motion.span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3, duration: 0.4 }}
                className="flex justify-between items-center p-3 rounded-xl bg-white/50"
              >
                <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.3 }}
                  className="text-2xl font-bold text-indigo-600"
                >
                  {Math.round((stats.todayAttendance / stats.totalEmployees) * 100)}%
                </motion.span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
