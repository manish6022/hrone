import { Cake, User } from "lucide-react";
import { motion } from "framer-motion";

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
}

export function EmployeeProfile({
  name,
  role,
  imageUrl,
  birthday,
  tags,
  daysUntil,
  avatar,
  variant = "default",
  isActive = true,
  onNext,
  onPrev,
  currentIndex,
  totalCount,
}: EmployeeProfileProps) {
  // Birthday variant for dashboard carousel
  if (variant === "birthday") {
    return (
      <div className="relative h-full bg-linear-to-br from-[#E8E2D5] to-[#D4CEC1] rounded-2xl overflow-hidden min-h-[420px]">
        {/* Navigation Buttons at Top - Desktop */}
        {(onNext || onPrev) && (
          <div className="absolute top-6 left-6 right-6 z-20 hidden md:flex items-center justify-between">
            <div className="flex gap-2">
              {onPrev && (
                <motion.button
                  onClick={onPrev}
                  className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white transition-colors shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    className="w-4 h-4 text-[#2D2D2D]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="text-sm font-medium text-[#2D2D2D]">
                    Previous
                  </span>
                </motion.button>
              )}
              {onNext && (
                <motion.button
                  onClick={onNext}
                  className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-white transition-colors shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-sm font-medium text-[#2D2D2D]">
                    Next
                  </span>
                  <svg
                    className="w-4 h-4 text-[#2D2D2D]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.button>
              )}
            </div>
            {currentIndex !== undefined && totalCount !== undefined && (
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                <span className="text-sm font-medium text-[#2D2D2D]">
                  {currentIndex + 1} / {totalCount}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons - Mobile (Bottom) */}
        {(onNext || onPrev) && (
          <div className="absolute bottom-6 left-6 right-6 z-20 flex md:hidden items-center justify-between gap-3">
            {onPrev && (
              <motion.button
                onClick={onPrev}
                className="flex-1 flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-3 hover:bg-white transition-colors shadow-lg"
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5 text-[#2D2D2D]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm font-medium text-[#2D2D2D]">
                  Previous
                </span>
              </motion.button>
            )}
            {currentIndex !== undefined && totalCount !== undefined && (
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg">
                <span className="text-sm font-medium text-[#2D2D2D]">
                  {currentIndex + 1}/{totalCount}
                </span>
              </div>
            )}
            {onNext && (
              <motion.button
                onClick={onNext}
                className="flex-1 flex items-center justify-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-3 hover:bg-white transition-colors shadow-lg"
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm font-medium text-[#2D2D2D]">Next</span>
                <svg
                  className="w-5 h-5 text-[#2D2D2D]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            )}
          </div>
        )}

        {/* Employee Image or Avatar */}
        <div className="relative h-95 overflow-hidden">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ 
              scale: isActive ? 1.1 : 1,
              filter: isActive ? "brightness(1.1)" : "brightness(1)"
            }}
            transition={{ 
              duration: 0.6, 
              ease: "easeInOut",
              scale: { type: "spring", stiffness: 300, damping: 30 },
              filter: { duration: 0.4 }
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <img
                src={`https://images.unsplash.com/photo-${
                  avatar === "SC"
                    ? "1494790108377-be9c29b29330"
                    : avatar === "JD"
                    ? "1507003211169-0a1dd7228f2d"
                    : avatar === "MR"
                    ? "1500648767791-00dcc994a43e"
                    : avatar === "RZ"
                    ? "1438761681033-6461ffad8d80"
                    : "1472099645785-5658abf4ff4e"
                }?w=400&h=400&fit=crop&crop=faces`}
                alt={name}
                className="w-full h-full object-cover object-top"
              />
            )}
          </motion.div>
        </div>

        {/* Employee Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pb-24 md:pb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isActive ? 1 : 0.5, 
              y: isActive ? 0 : 10,
              scale: isActive ? 1 : 0.95
            }}
            transition={{ 
              delay: 0.2, 
              duration: 0.4,
              scale: { type: "spring", stiffness: 300, damping: 30 }
            }}
            className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
          >
            {name}
          </motion.h1>
          {role && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isActive ? 1 : 0.5, 
                y: isActive ? 0 : 10
              }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-white/90 text-base md:text-lg"
              style={{ textShadow: "0 1px 5px rgba(0,0,0,0.3)" }}
            >
              {role}
            </motion.p>
          )}
        </div>

        {/* Birthday Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ 
            opacity: isActive ? 1 : 0.5, 
            scale: isActive ? 1 : 0.8,
            rotate: isActive ? 0 : -10
          }}
          transition={{ 
            delay: 0.4, 
            duration: 0.5,
            scale: { type: "spring", stiffness: 300, damping: 30 },
            rotate: { type: "spring", stiffness: 200, damping: 20 }
          }}
          className="absolute top-6 right-6 md:bottom-8 md:top-auto md:right-8 bg-linear-to-br from-yellow-500 to-yellow-600 rounded-2xl p-3 md:p-4 shadow-lg min-w-[120px] md:min-w-[140px]"
        >
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <motion.div
              animate={{ 
                rotate: isActive ? [0, 10, -10, 0] : 0,
                scale: isActive ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                duration: isActive ? 2 : 0,
                repeat: isActive ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <Cake className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </motion.div>
            <span className="text-xs md:text-sm text-white font-medium">
              Birthday
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {birthday}
          </div>
          {daysUntil !== undefined && (
            <div className="text-xs md:text-sm text-white/90 mt-1">
              in {daysUntil} {daysUntil === 1 ? "day" : "days"}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Default variant for employee showcase
  return (
    <div className="relative bg-linear-to-br from-[#E8E2D5] to-[#D4CEC1] rounded-3xl p-8 overflow-hidden h-full min-h-[420px]">
      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex gap-2 mb-6">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm">{tag}</span>
            </div>
          ))}
        </div>
      )}

      {/* Employee Image */}
      <div className="relative mb-6">
        <img
          src={
            imageUrl ||
            `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=400&fit=crop&crop=faces`
          }
          alt={name}
          className="w-full h-64 object-cover object-top rounded-2xl"
        />
      </div>

      {/* Employee Info */}
      <div className="relative z-10">
        <h1 className="text-5xl font-bold text-white mb-2 leading-tight">
          {name}
        </h1>
        {role && <p className="text-white/90 text-lg mb-4">{role}</p>}
      </div>

      {/* Birthday Badge */}
      <div className="absolute bottom-8 right-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 shadow-lg min-w-[140px]">
        <div className="flex items-center gap-2 mb-2">
          <Cake className="w-5 h-5 text-white" />
          <span className="text-sm text-white">Birthday</span>
        </div>
        <div className="text-3xl font-bold text-white">{birthday}</div>
        <div className="text-sm text-white/90 mt-1">1998</div>
      </div>
    </div>
  );
}
