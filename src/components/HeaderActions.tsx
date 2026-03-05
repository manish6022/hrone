"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface HeaderActionsProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export function HeaderActions({ onMobileMenuToggle, isMobileMenuOpen }: HeaderActionsProps) {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-4 ml-auto relative">
      {/* Mobile Menu Button */}
      <motion.button
        onClick={onMobileMenuToggle}
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
    </div>
  );
}
