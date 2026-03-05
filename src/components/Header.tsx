"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";
import { NotificationTray } from "./NotificationTray";
import { HeaderActions } from "./HeaderActions";

export function Header() {
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "sticky top-0 z-50 flex h-20 items-center justify-between border-b px-8",
          isMobileMenuOpen
            ? theme === 'dark'
              ? "bg-background/95 backdrop-blur-md border-gray-700/50"
              : "bg-background/95 backdrop-blur-md border-gray-200/50"
            : theme === 'dark'
              ? "bg-background/90 backdrop-blur-sm border-gray-700/50"
              : "bg-background/80 backdrop-blur-sm border-gray-200/50"
        )}
      >
        <HeaderActions
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Right side actions */}
        <div className="flex items-center gap-4 ml-auto relative">
          <NotificationTray />
        </div>
      </motion.header>

      <MobileMenu />
    </>
  );
}