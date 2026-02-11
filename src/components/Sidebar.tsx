"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  Factory,
  Shield,
  Key,
  LogOut,
  Sun,
  Moon,
  Clock,
  FileText,
  Menu,
  X,
  Calendar,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useState } from 'react';

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users, permission: "view_users" },
  { name: "Timesheet", href: "/timesheet", icon: FileText, permission: "view_attendance" },
  { name: "Roles", href: "/roles", icon: Shield, permission: "role_view" },
  {
    name: "Privileges",
    href: "/privileges",
    icon: Key,
    permission: "privilege_view",
  },
  {
    name: "Leave Types",
    href: "/leave-types",
    icon: Calendar,
    permission: "leave_type_view",
  },
  // {
  //   name: "Apply Leave",
  //   href: "/leave-application",
  //   icon: FileText,
  //   permission: "leave_apply",
  // },
  {
    name: "Item Master",
    href: "/items",
    icon: Package,
    permission: "item_view",
  },
  {
    name: "Production",
    href: "/production",
    icon: Factory,
    permission: "production_view",
  },
  {
    name: "UI Showcase",
    href: "/ui-showcase",
    icon: Palette,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasPermission, isSuperAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <motion.button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-border shadow-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </motion.button>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed top-0 right-0 z-40 h-full w-64 bg-background border-l border-border shadow-xl"
          >
            <div className="flex h-20 items-center justify-between px-6 border-b border-border shrink-0">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <span className="text-primary-foreground font-bold">H</span>
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-foreground tracking-tight">
                    HROne
                  </h1>
                  <AnimatePresence>
                    {isSuperAdmin() && (
                      <motion.span
                        className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none block"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        God Mode
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
              <div className="flex flex-col min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">
                  {user?.username || (user as any)?.name || "User"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-8">
              <nav className="space-y-2 px-6">
                {filteredNavigation.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          "group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden",
                          isActive
                            ? "bg-[#2D2D2D] text-white shadow-lg border border-[#2D2D2D]"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <motion.div
                          className={cn(
                            "mr-3 h-5 w-5 transition-all duration-300",
                            isActive
                              ? "text-white scale-110"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <item.icon className="h-5 w-5" />
                        </motion.div>
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-border p-6 space-y-4 shrink-0">
              <motion.button
                onClick={() => {
                  logout();
                  setIsSidebarOpen(false);
                }}
                className="flex w-full items-center px-4 py-3 text-sm font-medium text-destructive rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300 border border-transparent hover:border-destructive/20"
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col w-64 fixed left-4 top-4 bottom-4 z-20 bg-background border border-border rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-border shrink-0">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <span className="text-primary-foreground font-bold">H</span>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                HROne
              </h1>
              <AnimatePresence>
                {isSuperAdmin() && (
                  <motion.span
                    className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none block"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    God Mode
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            className="group relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-muted"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 transition-transform group-hover:scale-110" />
            ) : (
              <Sun className="h-5 w-5 transition-transform group-hover:scale-110" />
            )}
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto py-8">
          <nav className="space-y-2 px-6">
            <AnimatePresence>
              {filteredNavigation.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden",
                        isActive
                          ? "bg-[#2D2D2D] text-white shadow-lg border border-[#2D2D2D]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <motion.div
                        className={cn(
                          "mr-3 h-5 w-5 transition-all duration-300",
                          isActive
                            ? "text-white scale-110"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <item.icon className="h-5 w-5" />
                      </motion.div>
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </nav>
        </div>

        <div className="border-t border-border p-6 space-y-4 shrink-0">
          <motion.div
            className="flex items-center gap-3 p-3 rounded-2xl bg-muted border border-border"
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/10 border border-border"
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-primary-foreground font-bold text-sm">
                {(user?.username || (user as any)?.name || "US")
                  .substring(0, 2)
                  .toUpperCase()}
              </span>
            </motion.div>
            <div className="flex flex-col min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {user?.username || (user as any)?.name || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </motion.div>

          <motion.button
            onClick={logout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-destructive rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300 border border-transparent hover:border-destructive/20"
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
