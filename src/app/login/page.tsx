"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import api from "@/lib/api";
import { Loader2, User, Lock, ArrowRight, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { validate, sanitize, RateLimiter } from "@/lib/security";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const { login } = useAuth();
  const { theme, resolvedTheme } = useTheme();

  // Rate limiter for login attempts (5 attempts per 15 minutes)
  const rateLimiter = new RateLimiter(5, 15 * 60 * 1000);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Sanitize inputs
      const sanitizedUsername = sanitize.text(username);
      const sanitizedPassword = sanitize.text(password);

      // Validate inputs
      const usernameValidation = validate.username(sanitizedUsername);
      if (!usernameValidation.isValid) {
        setError(usernameValidation.message || "Invalid username");
        setLoading(false);
        return;
      }

      // const passwordValidation = validate.password(sanitizedPassword);
      // if (!passwordValidation.isValid) {
      //   setError(passwordValidation.message || "Invalid password");
      //   setLoading(false);
      //   return;
      // }

      // Check rate limiting
      const clientIP = 'client_' + (typeof window !== 'undefined' ? window.location.hostname : 'unknown');
      if (!rateLimiter.isAllowed(clientIP)) {
        const remaining = rateLimiter.getRemainingAttempts(clientIP);
        setAttemptsLeft(remaining);
        setError(`Too many login attempts. Please wait 15 minutes before trying again. ${remaining} attempts remaining.`);
        setLoading(false);
        return;
      }

      // Update remaining attempts
      setAttemptsLeft(rateLimiter.getRemainingAttempts(clientIP));

      const response = await api.post("/api/auth/login", {
        name: sanitizedUsername,
        password: sanitizedPassword,
      });

      const { token, user } = response.data;
      login(token, user);

      // Reset rate limiter on successful login
      rateLimiter.reset(clientIP);
      setAttemptsLeft(5);

    } catch (err: any) {
      // Don't reset rate limiter on failed login - let it accumulate
      const remaining = rateLimiter.getRemainingAttempts('client_' + (typeof window !== 'undefined' ? window.location.hostname : 'unknown'));
      setAttemptsLeft(remaining);

      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <div className={cn(
      "h-screen flex items-center justify-center p-0 md:p-4 overflow-hidden",
      theme === 'dark'
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
        : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
    )}>
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-20">
        <ThemeToggle size="md" variant="ghost" />
      </div>

      {/* Main Container */}
      <div className="w-full h-full md:h-[calc(100vh-2rem)] md:max-w-6xl md:rounded-2xl overflow-hidden shadow-2xl flex">
        {/* Left Side - Form */}
        <div className={cn(
          "flex-1 flex flex-col justify-center px-6 py-8 md:px-8 md:py-12 lg:px-16 overflow-y-auto md:overflow-hidden m-4 md:m-0 rounded-2xl md:rounded-none shadow-xl md:shadow-none",
          theme === 'dark' ? "bg-slate-900" : "bg-white"
        )}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto w-full space-y-6 md:space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              {/* Logo */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                {resolvedTheme && <Logo size="lg" showGodMode={false} showCompanyName={true} />}
              </motion.div>

              <motion.h1
                className={cn(
                  "text-3xl font-bold tracking-tight mb-2",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Welcome Back
              </motion.h1>

              <motion.p
                className={cn(
                  "text-sm",
                  theme === 'dark' ? "text-slate-400" : "text-gray-600"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Sign in to your Pammi Greenland account
              </motion.p>
            </div>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              {/* Username Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="username" className={cn(
                  "block text-sm font-medium mb-2",
                  theme === 'dark' ? "text-slate-300" : "text-gray-700"
                )}>
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className={cn(
                      "h-5 w-5",
                      theme === 'dark' ? "text-slate-400" : "text-gray-400"
                    )} />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={cn(
                      "block w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-1",
                      theme === 'dark'
                        ? "bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-slate-900"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-white"
                    )}
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="password" className={cn(
                  "block text-sm font-medium mb-2",
                  theme === 'dark' ? "text-slate-300" : "text-gray-700"
                )}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={cn(
                      "h-5 w-5",
                      theme === 'dark' ? "text-slate-400" : "text-gray-400"
                    )} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className={cn(
                      "block w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-1",
                      theme === 'dark'
                        ? "bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-slate-900"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-white"
                    )}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className={cn(
                        "h-5 w-5 transition-colors",
                        theme === 'dark' ? "text-slate-400 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"
                      )} />
                    ) : (
                      <Eye className={cn(
                        "h-5 w-5 transition-colors",
                        theme === 'dark' ? "text-slate-400 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"
                      )} />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "rounded-xl p-4 border",
                    theme === 'dark'
                      ? "bg-red-900/20 border-red-800/50 text-red-300"
                      : "bg-red-50 border-red-200 text-red-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
                  theme === 'dark'
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button Background Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />

                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <p className={cn(
                "text-xs font-medium",
                theme === 'dark' ? "text-slate-400" : "text-gray-500"
              )}>
                Powered by Pammi Greenland Enterprise
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Image (Desktop Only) */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          <Image
            src="/loginpage.jpg"
            alt="Login illustration"
            fill
            className="object-cover"
            priority
            onError={() => {
              console.error('Failed to load login image');
            }}
          />
        </div>
      </div>
    </div>
  );
}
