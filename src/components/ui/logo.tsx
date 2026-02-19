"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface LogoProps {
  showGodMode?: boolean;
  size?: "sm" | "md" | "lg";
  showCompanyName?: boolean;
  className?: string;
  isInteractive?: boolean;
  iconText?: string;
  companyName?: string;
}

export function Logo({
  showGodMode = false,
  size = "md",
  showCompanyName = true,
  className,
  isInteractive = true,
  iconText = "P",
  companyName = "Pammi Greenland"
}: LogoProps) {
  const sizeClasses = {
    sm: { container: "gap-2", icon: "h-8 w-8", text: "text-lg" },
    md: { container: "gap-3", icon: "h-10 w-10", text: "text-xl" },
    lg: { container: "gap-4", icon: "h-12 w-12", text: "text-2xl" }
  };

  const sizes = sizeClasses[size];

  const LogoIcon = isInteractive ? motion.div : 'div';
  const LogoText = isInteractive ? motion.div : 'div';
  const GodModeBadge = isInteractive ? motion.span : 'span';

  const iconProps = isInteractive ? {
    className: cn("flex items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30", sizes.icon),
    whileHover: { rotate: 360 },
    transition: { duration: 0.6 }
  } : {
    className: cn("flex items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30", sizes.icon)
  };

  const textProps = isInteractive ? {
    className: "flex items-center gap-3",
    whileHover: { scale: 1.02 }
  } : {
    className: "flex items-center gap-3"
  };

  const godModeProps = isInteractive ? {
    className: "text-[10px] text-primary font-bold uppercase tracking-widest leading-none block",
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  } : {
    className: "text-[10px] text-primary font-bold uppercase tracking-widest leading-none block"
  };

  return (
    <div className={cn("flex items-center justify-center", sizes.container, className)}>
      <LogoIcon {...iconProps}>
        <span className="text-primary-foreground font-bold">{iconText}</span>
      </LogoIcon>

      {showCompanyName && (
        <LogoText {...textProps}>
          <h1 className={cn("font-bold text-foreground tracking-tight", sizes.text)}>
            {companyName}
          </h1>
          {/* <AnimatePresence>
            {showGodMode && (
              <GodModeBadge {...godModeProps}>
                God Mode
              </GodModeBadge>
            )}
          </AnimatePresence> */}
        </LogoText>
      )}
    </div>
  );
}
