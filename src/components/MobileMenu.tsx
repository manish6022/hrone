"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutDashboard, Users, Package, Factory, Shield, Key, FileText, Calendar, Palette, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { getNavigation } from "@/data/navigation";
import { COMPANY_NAME } from "@/lib/constants";

export function MobileMenu() {
  const { user, hasPermission, isRegularUser, logout, isSuperAdmin, isHR, isManager, getUserRole } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation filtering logic same as main sidebar
  const allNavigation = getNavigation(isRegularUser());

  const filteredNavigation = allNavigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Mobile Menu Backdrop */}
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
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-full max-w-sm flex flex-col",
              theme === 'dark' ? "bg-gray-900" : "bg-white"
            )}
          >
            {/* Mobile Header */}
            <div className={cn(
              "relative p-6 border-b-2",
              theme === 'dark'
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Clean Professional Logo */}
                  <Logo
                    size="sm"
                    iconText="K"
                    companyName={COMPANY_NAME}
                    isInteractive={true}
                  />
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
                  <X className="h-4 w-4" />
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
  );
}
