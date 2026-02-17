"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---
export interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "holiday" | "weekend" | "leave" | "late";
}

interface Holiday {
  date: number;
  name: string;
}

interface AttendanceCalendarProps {
  attendanceData?: AttendanceRecord[];
  holidays?: Holiday[];
  className?: string;
}

// --- Configuration ---
// Fix: Explicitly typed to Record<AttendanceRecord['status'], ...> to prevent missing keys
const statusConfig: Record<AttendanceRecord['status'], { bg: string; text: string; badge: string }> = {
  present: {
    bg: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 dark:bg-emerald-500/20",
  },
  absent: {
    bg: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
    badge: "bg-rose-100 dark:bg-rose-500/20",
  },
  late: {
    bg: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 dark:bg-amber-500/20",
  },
  leave: {
    bg: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 dark:bg-blue-500/20",
  },
  holiday: {
    bg: "bg-purple-500",
    text: "text-purple-700 dark:text-purple-300",
    badge: "bg-purple-100 dark:bg-purple-500/20",
  },
  // Fix: Added missing "weekend" key
  weekend: {
    bg: "bg-zinc-200",
    text: "text-zinc-500 dark:text-zinc-400",
    badge: "bg-zinc-100 dark:bg-zinc-800",
  },
};

export function AttendanceCalendar({
  attendanceData = [],
  holidays = [],
  className,
}: AttendanceCalendarProps) {
  const currentDate = new Date();
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Grid Generation
  const calendarDays: (number | null)[] = Array(firstDayOfMonth).fill(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  while (calendarDays.length < 42) calendarDays.push(null);

  // Helpers
  const getDayStatus = (day: number) => {
    const date = new Date(year, month, day);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    const dateString = localDate.toISOString().split("T")[0];

    const holiday = holidays.find((h) => h.date === day);
    if (holiday) return "holiday";

    const attendance = attendanceData.find((a) => a.date === dateString);
    return attendance?.status || null;
  };

  const getHolidayName = (day: number) => holidays.find((h) => h.date === day)?.name;
  
  const today = new Date().getDate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("w-full h-full font-sans p-1", className)}
    >
      <div className="relative w-full h-full rounded-3xl shadow-xl dark:shadow-2xl bg-white dark:bg-zinc-900">
        
        {/* 1. BACKGROUND LAYER (CLIPPED) */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-white via-purple-50/30 to-purple-100/50 dark:border-purple-900/50 dark:from-zinc-900 dark:via-purple-900/10 dark:to-zinc-900 pointer-events-none">
           <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-500/20 blur-[80px]" />
           <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-[80px]" />
        </div>

        {/* 2. CONTENT LAYER (VISIBLE) */}
        <div className="relative z-10 flex h-full flex-col p-6">
          
          {/* --- HEADER --- */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent dark:from-purple-300 dark:to-indigo-300">
                  {currentDate.toLocaleDateString("en-US", { month: "long" })}
                </h3>
                <p className="text-sm font-medium text-purple-400 dark:text-purple-400/80">
                  {year}
                </p>
              </div>
            </div>

            <div className="hidden sm:block rounded-full border border-purple-200 bg-white/50 px-3 py-1 text-xs font-semibold text-purple-700 backdrop-blur-sm dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Today: {new Date().toLocaleDateString("en-US", { weekday: 'short', day: 'numeric' })}
            </div>
          </div>

          {/* --- WEEKDAY LABELS --- */}
          <div className="mb-3 grid grid-cols-7 border-b border-purple-100 pb-2 dark:border-purple-800/30">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => {
              const isWeekendDay = index === 0 || index === 6;
              return (
                <div
                  key={day}
                  className={cn(
                    "text-center text-xs font-bold uppercase tracking-wider",
                    isWeekendDay 
                      ? "text-red-500 dark:text-red-400" 
                      : "text-purple-400 dark:text-purple-500"
                  )}
                >
                  {day.slice(0, 3)}
                </div>
              );
            })}
          </div>

          {/* --- CALENDAR GRID --- */}
          <div className="grid flex-grow grid-cols-7 grid-rows-6 gap-2 sm:gap-3">
            {calendarDays.map((day, index) => {
              if (!day) return <div key={index} className="pointer-events-none" />;

              const cellDate = new Date(year, month, day);
              const dayOfWeek = cellDate.getDay(); // 0 = Sun, 6 = Sat
              const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;

              const status = getDayStatus(day);
              const holidayName = getHolidayName(day);
              const isToday = day === today;
              const isHovered = hoveredDate === day;
              
              // No error now because 'weekend' is defined in statusConfig
              const config = status ? statusConfig[status] : null;

              return (
                <div
                  key={index}
                  className={cn("relative flex items-center justify-center", isHovered ? "z-50" : "z-0")}
                >
                  <motion.button
                    onMouseEnter={() => setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                    whileHover={{ scale: 1.1, translateY: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "group relative flex h-10 w-10 flex-col items-center justify-center rounded-xl border transition-all duration-300 sm:h-12 sm:w-12",
                      "border-transparent bg-white/80 shadow-sm dark:bg-zinc-800/80",
                      isWeekendDay && "bg-red-50/50 dark:bg-red-900/10",
                      "hover:border-purple-300 hover:shadow-md dark:hover:border-purple-500/50",
                      isToday && "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50 dark:bg-purple-900/20"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-bold transition-colors",
                        isToday 
                          ? "text-purple-700 dark:text-purple-300" 
                          : isWeekendDay 
                            ? "text-red-500 dark:text-red-400"
                            : "text-zinc-600 dark:text-zinc-300",
                      )}
                    >
                      {day}
                    </span>

                    {(config || isWeekendDay) && (
                      <div className="absolute bottom-1.5 flex gap-0.5">
                        <div
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            config 
                              ? config.bg 
                              : (isWeekendDay ? "bg-red-300 dark:bg-red-700" : "bg-transparent")
                          )}
                        />
                      </div>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        className="pointer-events-none absolute bottom-full left-1/2 z-[100] w-max -translate-x-1/2"
                      >
                        <div className="relative flex flex-col items-center gap-1 rounded-2xl border border-purple-100 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-purple-900 dark:bg-zinc-900/95">
                          <div className={cn(
                            "text-xs font-bold",
                            isWeekendDay ? "text-red-500" : "text-purple-900 dark:text-purple-100"
                          )}>
                             {new Date(year, month, day).toLocaleDateString("en-US", { weekday: 'long', day: 'numeric' })}
                          </div>

                          {(status || holidayName) ? (
                            <div className={cn(
                              "flex items-center gap-2 rounded-lg px-2 py-1",
                              config?.badge || "bg-zinc-100 dark:bg-zinc-800"
                            )}>
                               <div className={cn("h-2 w-2 rounded-full", config?.bg || "bg-zinc-400")} />
                               <span className={cn(
                                 "text-[10px] font-bold uppercase tracking-wide",
                                 config?.text || "text-zinc-500"
                               )}>
                                 {holidayName || status}
                               </span>
                            </div>
                          ) : (
                            <span className="text-[10px] italic text-zinc-400">
                              {isWeekendDay ? "Weekend" : "No events"}
                            </span>
                          )}

                          <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-purple-100 bg-white dark:border-purple-900 dark:bg-zinc-900" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}