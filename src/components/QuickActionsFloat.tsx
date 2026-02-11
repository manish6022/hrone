"use client";

import { Plus, X, Clock, Calendar, DollarSign, Factory } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const quickActions = [
  {
    label: "Mark Attendance",
    icon: Clock,
    href: "/attendance",
  },
  {
    label: "Apply Leave",
    icon: Calendar,
    href: "/leave",
  },
  {
    label: "View Payslip",
    icon: DollarSign,
    href: "/payroll",
  },
  {
    label: "Log Production",
    icon: Factory,
    href: "/production",
  },
];

export function QuickActionsFloat() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: showMenu ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="h-6 w-6" />
        </motion.div>
      </motion.button>

      {/* Menu */}
      {showMenu && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMenu(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[220px]"
          >
            <div className="space-y-1">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.2 }}
                >
                  <Link
                    href={action.href}
                    onClick={() => setShowMenu(false)}
                    className="block"
                  >
                    <button className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-3 group">
                      <action.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      <span className="font-medium text-gray-800 group-hover:text-gray-900">{action.label}</span>
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
