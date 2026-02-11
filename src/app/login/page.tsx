"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2, User, Lock, ArrowRight, Cloud, Smartphone, Fingerprint, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", {
        name: username,
        password,
      });

      const { token, user } = response.data;
      login(token, user);
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-4xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[500px]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">HROne</h1>
            <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-gray-800">
              Welcome Back
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-foreground placeholder:text-gray-500 focus:ring-2 focus:ring-purple-600 focus:border-purple-600 sm:text-sm transition-all duration-200"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 text-foreground placeholder:text-gray-500 focus:ring-2 focus:ring-purple-600 focus:border-purple-600 sm:text-sm transition-all duration-200"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-purple-700 hover:to-pink-700 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Powered by HROne Enterprise CRM
          </p>
        </div>
        <div className="flex items-center justify-center">
          <img src="/loginpage.jpg" alt="Login illustration" className="w-full h-full object-cover rounded-2xl" />
        </div>
      </motion.div>
    </div>
  );
}
