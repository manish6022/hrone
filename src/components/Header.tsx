"use client";

import { motion } from "framer-motion";
import { Bell, Menu } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="flex h-20 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-8"
    >

      <div className="flex items-center gap-4 ml-auto">
        <motion.button
          className="group relative p-3 rounded-2xl text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-muted"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
          <motion.span
            className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      </div>
    </motion.header>
  );
}
