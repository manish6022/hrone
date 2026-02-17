"use client";

import React from 'react';

import { AuthProvider } from "@/context/AuthContext";
// import { ThemeProvider } from "@/context/ThemeContext";
// import { ThemeProvider } from "next-themes";
import { Providers } from "@/components/Providers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { QuickActionsFloat } from "@/components/QuickActionsFloat";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { usePerformanceMonitor, useBFCacheOptimization, monitorLongTasks } from "@/utils/performance";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Prevents flash of unstyled text
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Prevents flash of unstyled text
  preload: false, // Only preload the main font
});

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Performance monitoring
  usePerformanceMonitor();
  useBFCacheOptimization();
  React.useEffect(() => monitorLongTasks(), []);

  if (isLoginPage) {
    return (
      <main className="min-h-screen bg-background overflow-hidden">
        {children}
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 md:pl-80 flex flex-col transition-all duration-300 ease-in-out">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      <QuickActionsFloat />
      <Toaster />
    </div>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <Providers>
        <AuthProvider>
          <ErrorBoundary>
            <AppLayout>{children}</AppLayout>
          </ErrorBoundary>
        </AuthProvider>
      </Providers>
    </body>
  );
}
