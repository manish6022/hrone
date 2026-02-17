"use client";

import { Cake, User, MapPin, Sparkles, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmployeeProfileProps {
  name: string;
  role?: string;
  imageUrl?: string;
  birthday: string;
  tags?: string[];
  daysUntil?: number;
  avatar?: string;
  variant?: "default" | "birthday";
  isActive?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
  className?: string; // Added for external sizing
}

export function EmployeeProfile({
  name,
  role,
  imageUrl,
  birthday,
  tags = ["Top Performer", "Creative"],
  daysUntil,
  avatar,
  variant = "default",
  isActive = true,
  onNext,
  onPrev,
  currentIndex,
  totalCount,
  className,
}: EmployeeProfileProps) {

  const displayImage = imageUrl || `https://images.unsplash.com/photo-${
    avatar === "SC" ? "1534528741775-53994a69daeb" : 
    avatar === "JD" ? "1507003211169-0a1dd7228f2d" : 
    "1500648767791-00dcc994a43e"
  }?w=800&q=80`;

  const isBirthday = variant === "birthday";

  return (
    <motion.div
      initial={false}
      animate={{ 
        scale: isActive ? 1 : 0.98, 
        opacity: isActive ? 1 : 0.6,
      }}
      transition={{ duration: 0.5, ease: "circOut" }}
      // UPDATED: Removed max-w-md, added w-full h-full to fit grid
      className={cn(
        "relative w-full h-full min-h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl group select-none",
        "border border-white/10 bg-neutral-900",
        className
      )}
    >
      {/* ----------------- BACKGROUND LAYER ----------------- */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: isActive ? 1.1 : 1 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
          className="w-full h-full"
        >
          <img
            src={displayImage}
            alt={name}
            className="w-full h-full object-cover object-center brightness-[0.85] contrast-[1.1]"
          />
        </motion.div>
        
        {/* Dynamic Gradient Overlays for Readability */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t via-transparent to-black/40",
          isBirthday ? "from-black/90 via-black/40" : "from-neutral-900/90 via-neutral-900/20"
        )} />
        
        {/* Birthday Special: Golden Glow */}
        {isBirthday && (
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 via-transparent to-purple-500/20 mix-blend-overlay" />
        )}
      </div>

      {/* ----------------- TOP NAVIGATION ----------------- */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 max-w-[70%]">
          {tags?.slice(0, 2).map((tag, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5"
            >
              <User className="w-3 h-3 text-white/70" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">{tag}</span>
            </motion.div>
          ))}
        </div>

        {/* Counter */}
        {totalCount && (
          <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
            <span className="text-xs font-mono text-white/80">
              {String(currentIndex! + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* ----------------- SIDE CONTROLS (Hover Only) ----------------- */}
      {(onPrev || onNext) && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {onPrev ? (
            <button onClick={onPrev} className="pointer-events-auto p-3 rounded-full bg-black/20 hover:bg-white/20 backdrop-blur-md text-white transition-all transform hover:-translate-x-1 border border-white/5">
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : <div />}
          {onNext && (
            <button onClick={onNext} className="pointer-events-auto p-3 rounded-full bg-black/20 hover:bg-white/20 backdrop-blur-md text-white transition-all transform hover:translate-x-1 border border-white/5">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* ----------------- MAIN CONTENT ----------------- */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
        
        {/* Floating Badge (Birthday or Role) */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4"
        >
          {isBirthday ? (
             <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-200 to-yellow-500 p-[1px] rounded-2xl shadow-lg shadow-amber-900/20">
               <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-[15px] flex items-center gap-2">
                 <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                 >
                   <Cake className="w-4 h-4 text-yellow-400" />
                 </motion.div>
                 <span className="text-xs font-bold text-yellow-100 uppercase tracking-widest">Birthday</span>
                 <div className="w-[1px] h-3 bg-white/20" />
                 <span className="text-xs font-bold text-white">{birthday}</span>
               </div>
             </div>
          ) : (
             <div className="inline-flex items-center gap-2">
               <div className="h-[2px] w-8 bg-blue-500 rounded-full" />
               <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">{role || "Team Member"}</span>
             </div>
          )}
        </motion.div>

        {/* Name */}
        <motion.h1 
          className="text-5xl lg:text-6xl font-black text-white mb-2 leading-[0.9] tracking-tighter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {name.split(' ').map((part, i) => (
            <span key={i} className="block last:text-transparent last:bg-clip-text last:bg-gradient-to-b last:from-white last:to-white/40">
              {part}
            </span>
          ))}
        </motion.h1>

        {/* Stats / Info Row */}
        <motion.div 
          className="flex items-center justify-between mt-6 pt-6 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-white/70">
            <MapPin className="w-4 h-4 text-white/50" />
            <span className="text-sm font-medium tracking-wide">New York, USA</span>
          </div>

          {isBirthday && (
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all">
              <Send className="w-4 h-4" />
              <span>Wish HBD</span>
            </button>
          )}
        </motion.div>
      </div>

      {/* ----------------- DECORATIVE PARTICLES (Birthday Only) ----------------- */}
      {isBirthday && (
        <>
          <motion.div 
            className="absolute top-10 right-[-20px] bg-gradient-to-br from-yellow-400 to-orange-600 w-32 h-32 blur-[80px] opacity-60 rounded-full pointer-events-none" 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="absolute top-24 right-0 z-40">
             <div className="bg-white/10 backdrop-blur-md border-l border-t border-b border-white/10 rounded-l-2xl p-4 shadow-2xl transform translate-x-2 hover:translate-x-0 transition-transform duration-300">
                <div className="text-center">
                  <span className="block text-[10px] uppercase text-white/50 font-bold tracking-wider">Turning</span>
                  <span className="block text-3xl font-black text-white leading-none my-1">26</span>
                  <span className="block text-[10px] uppercase text-white/50 font-bold tracking-wider">Days left: {daysUntil}</span>
                </div>
             </div>
          </div>
        </>
      )}
    </motion.div>
  );
}