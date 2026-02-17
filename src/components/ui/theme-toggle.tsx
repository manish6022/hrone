"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline";
}

export function ThemeToggle({ className, size = "md", variant = "default" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const sizeClasses = {
    sm: "p-2",
    md: "p-2.5",
    lg: "p-3"
  };

  const variantClasses = {
    default: theme === 'dark'
      ? "bg-gray-700 hover:bg-gray-600 text-yellow-400"
      : "bg-gray-200 hover:bg-gray-300 text-gray-700",
    ghost: theme === 'dark'
      ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    outline: theme === 'dark'
      ? "border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800"
      : "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
  };

  return (
    <motion.button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={cn(
        "group relative rounded-xl transition-all duration-300",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'light' ? (
          <Moon className={cn(
            "transition-transform group-hover:scale-110",
            size === 'sm' ? "h-4 w-4" : size === 'lg' ? "h-6 w-6" : "h-5 w-5"
          )} />
        ) : (
          <Sun className={cn(
            "transition-transform group-hover:scale-110",
            size === 'sm' ? "h-4 w-4" : size === 'lg' ? "h-6 w-6" : "h-5 w-5"
          )} />
        )}
      </motion.div>
    </motion.button>
  );
}
