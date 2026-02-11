"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  color?: string;
  gradient?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = "bg-blue-500/10 text-blue-600",
  gradient = "bg-gradient-to-br from-white to-gray-50 border-gray-200",
  delay = 0
}: StatCardProps) {
  const isPositive = change.startsWith("+");
  const [bgColor, textColor] = color.split(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -5, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden group transition-all duration-300 hover:-translate-y-2"
    >
      <div className={cn(
        "relative rounded-3xl p-6 border transition-all duration-300 hover:shadow-xl hover:shadow-violet-200/40",
        gradient
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
            <motion.div 
              className={cn("p-3 rounded-2xl shadow-lg transition-transform duration-200 hover:scale-110 hover:rotate-5", bgColor)}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Icon className={cn("h-6 w-6", textColor)} />
            </motion.div>
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
            
            <motion.p
              className="text-sm font-medium text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3, duration: 0.3 }}
            >
              {change}
            </motion.p>
          </div>
        </div>
        
        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </motion.div>
  );
}
