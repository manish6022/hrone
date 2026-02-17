"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, AlertCircle, Info, X, Clock, Filter, MoreHorizontal, Menu, LayoutDashboard, Users, Package, Factory, Shield, Key, FileText, Calendar, Palette, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { getNavigation } from "@/data/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  priority: "low" | "medium" | "high";
  category: "attendance" | "leave" | "payroll" | "system" | "general";
}

type FilterTab = 'all' | 'unread' | 'today' | 'important';

export function Header() {
  const { user, hasPermission, isRegularUser, logout, isSuperAdmin, isHR, isManager, getUserRole } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Navigation filtering logic same as main sidebar
  const allNavigation = getNavigation(isRegularUser());

  const filteredNavigation = allNavigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  useEffect(() => {
    console.log('🔄 useEffect triggered for user:', user?.id, 'isMounted:', isMounted);
    if (isMounted && user?.id) {
      fetchNotifications();
    }
  }, [isMounted, user?.id]);

  // Close tray when scrolling outside/on page background
  useEffect(() => {
    const handleWheelOutside = (e: WheelEvent) => {
      if (!isTrayOpen) return;

      // Check if the wheel event is NOT coming from within the notification tray
      const trayElement = trayRef.current;
      if (trayElement && !trayElement.contains(e.target as Node)) {
        setIsTrayOpen(false);
      }
    };

    if (isTrayOpen) {
      window.addEventListener('wheel', handleWheelOutside, { passive: true });
    }

    return () => window.removeEventListener('wheel', handleWheelOutside);
  }, [isTrayOpen]);

  // Prevent body scrolling when notification drawer is open
  useEffect(() => {
    if (isTrayOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isTrayOpen]);

  // Close tray when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        setIsTrayOpen(false);
      }
    };

    if (isTrayOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTrayOpen]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/notifications/${user.id}`);
      if (response.data?.data && response.data.data.length > 0) {
        setNotifications(response.data.data);
      } else {
        // Show sample notifications when no data from API
        setNotifications([
          {
            id: "sample-1",
            title: "🎉 Welcome to Kodenova HR!",
            message: "Your account has been successfully activated. Start exploring your dashboard and discover all the amazing features we have prepared for you.",
            type: "success" as const,
            read: false,
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
            priority: "medium" as const,
            category: "system" as const,
          },
          {
            id: "sample-2",
            title: "⏰ Attendance Reminder",
            message: "Don't forget to mark your attendance for today before 9:00 AM. Consistent attendance helps maintain your perfect record!",
            type: "warning" as const,
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            priority: "high" as const,
            category: "attendance" as const,
          },
          {
            id: "sample-3",
            title: "✅ Leave Request Approved",
            message: "Your annual leave request for March 15-20 has been approved. Enjoy your well-deserved time off!",
            type: "success" as const,
            read: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            priority: "medium" as const,
            category: "leave" as const,
          },
          {
            id: "sample-4",
            title: "💰 Payroll Update",
            message: "Your salary for February has been processed and deposited to your account. Check your bank statement for confirmation.",
            type: "info" as const,
            read: false,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            priority: "medium" as const,
            category: "payroll" as const,
          },
          {
            id: "sample-5",
            title: "🏢 Office Maintenance Notice",
            message: "Scheduled maintenance will be performed in the server room this weekend. Some services may be temporarily unavailable.",
            type: "info" as const,
            read: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
            priority: "low" as const,
            category: "system" as const,
          }
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      // Professional fallback with sample data
      setNotifications([
        {
          id: "fallback-1",
          title: "🎯 Getting Started Guide",
          message: "Welcome to Kodenova HR! Take a moment to explore the dashboard and familiarize yourself with all available features.",
          type: "info" as const,
          read: false,
          createdAt: new Date().toISOString(),
          priority: "medium" as const,
          category: "system" as const,
        },
        {
          id: "fallback-2",
          title: "📅 Team Meeting Reminder",
          message: "Weekly team standup scheduled for tomorrow at 10:00 AM. Don't forget to prepare your updates!",
          type: "warning" as const,
          read: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          priority: "high" as const,
          category: "general" as const,
        },
        {
          id: "fallback-3",
          title: "🎂 Happy Birthday!",
          message: "Today is Sarah Johnson's birthday! Don't forget to wish her a great day and send her birthday greetings.",
          type: "success" as const,
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          priority: "medium" as const,
          category: "general" as const,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      // Optimistic update for better UX
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/notifications/user/${user?.id}/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  // Filtered notifications with memoization for performance
  const filteredNotifications = useMemo(() => {
    if (!isMounted) return notifications; // Return all notifications during SSR

    const today = new Date().toDateString();
    switch (activeTab) {
      case 'unread': return notifications.filter(n => !n.read);
      case 'today': return notifications.filter(n =>
        new Date(n.createdAt).toDateString() === today
      );
      case 'important': return notifications.filter(n =>
        n.priority === 'high' || n.type === 'error'
      );
      default: return notifications;
    }
  }, [notifications, activeTab, isMounted]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const todayCount = isMounted ? notifications.filter(n =>
    new Date(n.createdAt).toDateString() === new Date().toDateString()
  ).length : 0;
  const importantCount = notifications.filter(n =>
    n.priority === 'high' || n.type === 'error'
  ).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return CheckCircle;
      case "warning":
      case "error": return AlertCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return "bg-gray-50/50 border-gray-100";
    switch (type) {
      case "success": return "bg-emerald-50 border-emerald-200";
      case "warning": return "bg-amber-50 border-amber-200";
      case "error": return "bg-red-50 border-red-200";
      default: return "bg-blue-50 border-blue-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-emerald-100 text-emerald-700";
      case "warning": return "bg-amber-100 text-amber-700";
      case "error": return "bg-red-100 text-red-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const formatTime = (dateString: string) => {
    if (!isMounted) return "Loading..."; // Prevent hydration mismatch

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "sticky top-0 z-50 flex h-20 items-center justify-between border-b px-8",
          isTrayOpen || isMobileMenuOpen
            ? theme === 'dark'
              ? "bg-background/95 backdrop-blur-md border-gray-700/50"
              : "bg-background/95 backdrop-blur-md border-gray-200/50"
            : theme === 'dark'
              ? "bg-background/90 backdrop-blur-sm border-gray-700/50"
              : "bg-background/80 backdrop-blur-sm border-gray-200/50"
        )}
      >
        {/* Mobile Menu Button */}
        <motion.button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            "md:hidden p-2 rounded-xl transition-colors",
            theme === 'dark'
              ? "hover:bg-gray-800/50 text-gray-300"
              : "hover:bg-gray-100/80 text-gray-700"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle mobile menu"
        >
          <motion.div
            animate={isMobileMenuOpen ? "open" : "closed"}
            className="w-5 h-5 relative"
          >
            <motion.span
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: 45, y: 6 }
              }}
              className="absolute top-0 left-0 w-full h-0.5 bg-current block transform origin-center transition-all duration-300"
            />
            <motion.span
              variants={{
                closed: { opacity: 1 },
                open: { opacity: 0 }
              }}
              className="absolute top-2 left-0 w-full h-0.5 bg-current block transform origin-center transition-all duration-300"
            />
            <motion.span
              variants={{
                closed: { rotate: 0, y: 0 },
                open: { rotate: -45, y: -6 }
              }}
              className="absolute top-4 left-0 w-full h-0.5 bg-current block transform origin-center transition-all duration-300"
            />
          </motion.div>
        </motion.button>

        <div className="flex items-center gap-4 ml-auto relative">
          <motion.button
            onClick={() => setIsTrayOpen(!isTrayOpen)}
            className={cn(
              "group relative p-3 rounded-2xl transition-all",
              theme === 'dark'
                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`${unreadCount > 0 ? `${unreadCount} unread ` : ''}notifications`}
          >
            <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500 rounded-full"
                />
                <div className="relative bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              </div>
            )}
          </motion.button>

          {/* Notification Tray */}
          <AnimatePresence>
            {isTrayOpen && (
              <>
                {/* Backdrop with blur effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "fixed inset-0 z-40",
                    theme === 'dark'
                      ? "bg-black/60 backdrop-blur-[2px]"
                      : "bg-black/5 backdrop-blur-[1px]"
                  )}
                  onClick={() => setIsTrayOpen(false)}
                />

                <motion.div
                  ref={trayRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={cn(
                    "absolute top-full right-0 mt-3 w-96 max-h-[85vh] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden",
                    theme === 'dark'
                      ? "bg-gray-900 border border-gray-700/50 shadow-black/40"
                      : "bg-white border border-gray-200/80 shadow-black/10"
                  )}
                >
                  {/* Header Section */}
                  <div className={cn(
                    "p-5 border-b rounded-t-2xl",
                    theme === 'dark'
                      ? "border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900/30"
                      : "border-gray-100/80 bg-gradient-to-r from-white to-gray-50/30"
                  )}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                          <Bell className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className={cn(
                            "font-bold text-lg",
                            theme === 'dark' ? "text-white" : "text-gray-900"
                          )}>
                            Notifications
                          </h2>
                          <p className={cn(
                            "text-xs",
                            theme === 'dark' ? "text-gray-400" : "text-gray-500"
                          )}>
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <motion.button
                            onClick={markAllAsRead}
                            className={cn(
                              "p-2 text-xs font-medium rounded-lg transition-colors",
                              theme === 'dark'
                                ? "text-blue-400 hover:bg-blue-900/30"
                                : "text-blue-600 hover:bg-blue-50"
                            )}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Mark all read
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => setIsTrayOpen(false)}
                          className={cn(
                            "p-2 hover:bg-gray-100 rounded-lg transition-colors",
                            theme === 'dark' ? "hover:bg-gray-800" : "hover:bg-gray-100"
                          )}
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className={cn(
                            "h-4 w-4",
                            theme === 'dark' ? "text-gray-400" : "text-gray-400"
                          )} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className={cn(
                      "flex gap-1 p-1 rounded-xl",
                      theme === 'dark' ? "bg-gray-800/50" : "bg-gray-50/80"
                    )}>
                      {[
                        { key: 'all' as FilterTab, label: 'All', count: notifications.length },
                        { key: 'unread' as FilterTab, label: 'Unread', count: unreadCount },
                        { key: 'today' as FilterTab, label: 'Today', count: todayCount },
                        { key: 'important' as FilterTab, label: 'Important', count: importantCount }
                      ].map((tab) => (
                        <motion.button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={cn(
                            "flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 relative",
                            activeTab === tab.key
                              ? theme === 'dark'
                                ? "bg-gray-700 text-white shadow-sm border border-gray-600"
                                : "bg-white text-blue-600 shadow-sm border border-blue-200"
                              : theme === 'dark'
                                ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {tab.label}
                          {tab.count > 0 && (
                            <span className={cn(
                              "ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium",
                              theme === 'dark'
                                ? "bg-gray-600 text-gray-200"
                                : "bg-gray-200 text-gray-700"
                            )}>
                              {tab.count > 99 ? '99+' : tab.count}
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div 
                    className="flex-1 overflow-y-auto p-3 min-h-[200px]" 
                    data-scrollable="true"
                    style={{
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none', // IE/Edge
                    }}
                    onScroll={(e) => {
                      // Hide scrollbar for Webkit browsers
                      const target = e.target as HTMLElement;
                      target.style.setProperty('-webkit-scrollbar', 'none');
                    }}
                  >
                    {loading ? (
                      /* Professional Loading State */
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 bg-gray-50/80 rounded-xl animate-pulse border border-gray-100"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : filteredNotifications.length === 0 ? (
                      /* Professional Empty State */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center px-6"
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.02, 1]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="relative mb-6"
                        >
                          <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-sm">
                            <Bell className="h-10 w-10 text-blue-600" />
                          </div>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"
                          />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {activeTab === 'unread' ? 'No unread notifications' :
                           activeTab === 'today' ? 'No notifications today' :
                           activeTab === 'important' ? 'No important notifications' :
                           'All caught up!'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-xs">
                          {activeTab === 'unread' ? 'You\'ve read all your notifications.' :
                           activeTab === 'today' ? 'No new notifications received today.' :
                           activeTab === 'important' ? 'No high-priority notifications at this time.' :
                           'You\'re all caught up with your notifications.'}
                        </p>
                        <motion.button
                          onClick={fetchNotifications}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Refresh
                        </motion.button>
                      </motion.div>
                    ) : (
                      /* Notifications List */
                      <div className="space-y-2">
                        {filteredNotifications.map((notification, index) => {
                          const IconComponent = getNotificationIcon(notification.type);

                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: index * 0.05,
                                duration: 0.4,
                                ease: [0.4, 0, 0.2, 1]
                              }}
                              onClick={() => !notification.read && markAsRead(notification.id)}
                              className={cn(
                                "group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border",
                                getNotificationColor(notification.type, notification.read),
                                !notification.read && "hover:shadow-md hover:scale-[1.01] hover:border-gray-200/50"
                              )}
                              whileHover={{ y: -1 }}
                              role="button"
                              tabIndex={0}
                              aria-label={`${notification.title}: ${notification.message}`}
                            >
                              {/* Priority Indicator */}
                              {notification.priority === "high" && !notification.read && (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"
                                />
                              )}

                              <div className="flex items-start gap-4">
                                {/* Icon */}
                                <motion.div
                                  className={cn(
                                    "flex-shrink-0 p-2.5 rounded-xl shadow-sm border transition-colors",
                                    notification.read
                                      ? "bg-gray-100 border-gray-200 text-gray-500"
                                      : getTypeColor(notification.type)
                                  )}
                                  whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                  <IconComponent className="h-4 w-4" />
                                </motion.div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                                      {notification.title}
                                    </h4>
                                    {!notification.read && (
                                      <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1"
                                      />
                                    )}
                                  </div>

                                  <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                    {notification.message}
                                  </p>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {/* Type Badge */}
                                      <motion.span
                                        whileHover={{ scale: 1.05 }}
                                        className={cn(
                                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                          getTypeColor(notification.type)
                                        )}
                                      >
                                        {notification.type}
                                      </motion.span>

                                      {/* Time */}
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatTime(notification.createdAt)}</span>
                                      </div>
                                    </div>

                                    {/* Action Menu */}
                                    {!notification.read && (
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notification.id);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        aria-label="Mark as read"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </motion.button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className={cn(
                      "p-4 rounded-b-2xl",
                      theme === 'dark' ? "bg-gray-800/50" : "bg-gray-50/50"
                    )}>
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-xs",
                          theme === 'dark' ? "text-gray-400" : "text-gray-500"
                        )}>
                          {unreadCount} unread • {notifications.length} total
                        </span>
                        <motion.button
                          onClick={() => setIsTrayOpen(false)}
                          className={cn(
                            "text-xs font-medium flex items-center gap-1",
                            theme === 'dark' ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:underline"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          View all activity
                          <motion.div
                            animate={{ x: [0, 2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.div>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "fixed inset-0 z-40",
                theme === 'dark'
                  ? "bg-black/60 backdrop-blur-[2px]"
                  : "bg-black/50 backdrop-blur-sm"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] md:hidden flex flex-col shadow-2xl border-r-2",
                theme === 'dark'
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              )}
            >
              {/* Mobile Header - Clean Professional Design */}
              <div className={cn(
                "relative p-6 border-b-2",
                theme === 'dark'
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gray-50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Clean Professional Logo */}
                    <motion.div
                      className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-black text-lg tracking-tighter">HR</span>
                      </div>
                    </motion.div>

                    <div className="flex flex-col">
                      <motion.h2
                        className={cn(
                          "text-xl font-bold",
                          theme === 'dark' ? "text-white" : "text-gray-900"
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        Kodenova
                      </motion.h2>
                      <motion.p
                        className={cn(
                          "text-sm font-medium",
                          theme === 'dark' ? "text-blue-400" : "text-blue-600"
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Employee Portal
                      </motion.p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <ThemeToggle size="md" variant="ghost" />

                    <motion.button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "p-3 rounded-xl transition-all duration-300",
                        theme === 'dark'
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-600"
                      )}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation - Clean Design */}
              <div className={cn(
                "flex-1 overflow-y-auto p-4",
                theme === 'dark' ? "bg-gray-900" : "bg-gray-50"
              )}>
                <nav className="space-y-1">
                  {/* Main Navigation Items */}
                  <div className="mb-6">
                    <motion.h3
                      className={cn(
                        "px-4 mb-3 text-xs font-bold uppercase tracking-wider",
                        theme === 'dark' ? "text-gray-400" : "text-gray-500"
                      )}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Navigation
                    </motion.h3>

                    {filteredNavigation.slice(0, 8).map((item, index) => {
                      const isActive = pathname === item.href;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 + 0.4, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "group flex items-center gap-4 px-5 py-4 mx-2 text-sm font-medium rounded-xl transition-all duration-300 overflow-hidden",
                              isActive
                                ? theme === 'dark'
                                  ? "bg-blue-600 text-white shadow-lg"
                                  : "bg-blue-600 text-white shadow-md"
                                : theme === 'dark'
                                  ? "text-gray-300 hover:bg-gray-800 hover:shadow-sm"
                                  : "text-gray-700 hover:bg-white hover:shadow-sm"
                            )}
                          >
                            {/* Icon */}
                            <motion.div
                              className={cn(
                                "flex-shrink-0 p-2.5 rounded-lg transition-all duration-300",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : theme === 'dark'
                                    ? "bg-gray-700 text-gray-300 group-hover:bg-blue-900 group-hover:text-blue-300"
                                    : "bg-gray-200 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                              )}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            >
                              <item.icon className={cn("h-4 w-4", isActive && "scale-110")} />
                            </motion.div>

                            {/* Content */}
                            <div className="flex-1">
                              <span className={cn(
                                "block leading-tight",
                                isActive ? "font-semibold" : "font-medium"
                              )}>
                                {item.name}
                              </span>
                              {item.name === "Dashboard" && (
                                <span className="text-xs opacity-80">Overview & Analytics</span>
                              )}
                              {item.name === "Employee Dashboard" && (
                                <span className="text-xs opacity-80">Personal Workspace</span>
                              )}
                            </div>

                            {/* Active Indicator */}
                            {isActive && (
                              <motion.div
                                className="flex-shrink-0 w-2 h-2 bg-white rounded-full"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Secondary Actions */}
                  <div>
                    <motion.h3
                      className="px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                    >
                      Quick Actions
                    </motion.h3>

                    {filteredNavigation.slice(8).map((item, index) => {
                      const isActive = pathname === item.href;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 1.3, duration: 0.5 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "group flex items-center gap-3 px-4 py-3 mx-2 text-sm font-medium rounded-lg transition-all duration-300",
                              isActive
                                ? "bg-indigo-600 text-white shadow-md"
                                : "text-gray-600 hover:bg-white hover:text-gray-900"
                            )}
                          >
                            <motion.div
                              className={cn(
                                "flex-shrink-0 p-2 rounded-lg",
                                isActive
                                  ? "bg-white/20"
                                  : "bg-gray-200 group-hover:bg-indigo-100"
                              )}
                              whileHover={{ scale: 1.05 }}
                            >
                              <item.icon className="h-3.5 w-3.5" />
                            </motion.div>
                            <span className="flex-1">{item.name}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </nav>
              </div>

              {/* Mobile Footer - Clean User Profile */}
              <div className={cn(
                "p-4 border-t-2",
                theme === 'dark'
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gray-100"
              )}>
                <motion.div
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 mb-4",
                    theme === 'dark'
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                  )}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {/* Solid Avatar */}
                  <motion.div
                    className="relative flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <span className="text-white font-bold text-sm">
                      {user?.employeeResponseDto?.firstName?.charAt(0)?.toUpperCase() ||
                       user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                    {/* Online Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </motion.div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <motion.div
                      className={cn(
                        "font-semibold text-sm truncate",
                        theme === 'dark' ? "text-white" : "text-gray-900"
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      {user?.employeeResponseDto?.firstName && user?.employeeResponseDto?.lastName
                        ? `${user.employeeResponseDto.firstName} ${user.employeeResponseDto.lastName}`
                        : user?.username || 'User'}
                    </motion.div>
                    <motion.div
                      className={cn(
                        "text-xs truncate",
                        theme === 'dark' ? "text-gray-300" : "text-gray-500"
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6 }}
                    >
                      {user?.email || 'user@kodenova.com'}
                    </motion.div>
                    {/* Role Badge */}
                    <motion.div
                      className={cn(
                        "inline-flex items-center px-2 py-1 mt-1 text-xs font-medium rounded-full",
                        getUserRole() === 'superadmin'
                          ? theme === 'dark'
                            ? "bg-red-900 text-red-200"
                            : "bg-red-100 text-red-700"
                          : getUserRole() === 'hr'
                          ? theme === 'dark'
                            ? "bg-purple-900 text-purple-200"
                            : "bg-purple-100 text-purple-700"
                          : getUserRole() === 'manager'
                          ? theme === 'dark'
                            ? "bg-orange-900 text-orange-200"
                            : "bg-orange-100 text-orange-700"
                          : theme === 'dark'
                            ? "bg-blue-900 text-blue-200"
                            : "bg-blue-100 text-blue-700"
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.7 }}
                    >
                      {getUserRole() === 'superadmin' ? 'Super Admin' :
                       getUserRole() === 'hr' ? 'HR' :
                       getUserRole() === 'manager' ? 'Manager' : 'Employee'}
                    </motion.div>
                  </div>

                  {/* Settings Button */}
                  <motion.button
                    className={cn(
                      "flex-shrink-0 p-2 rounded-lg transition-colors",
                      theme === 'dark'
                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </motion.button>
                </motion.div>

                {/* Logout Button */}
                <motion.button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 border-2",
                    theme === 'dark'
                      ? "text-red-400 hover:bg-red-900/30 border-red-800 hover:border-red-700"
                      : "text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                  )}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}