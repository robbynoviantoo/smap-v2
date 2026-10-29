"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { ChatRealtimeProvider } from "@/hooks/api/useChatRealtime";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { isExpanded, isMobileOpen } = useSidebar();

  useEffect(() => {
    const token =
      Cookies.get("token") ||
      (typeof window !== "undefined" ? localStorage.getItem("token") : null);

    if (!token) {
      setIsAuthorized(false);
      router.replace("/signin");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // If not yet verified or not authorized, don't render dashboard content to prevent blink
  if (isAuthorized === false || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-medium tracking-wide">
            Memeriksa autentikasi...
          </span>
        </div>
      </div>
    );
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <ChatRealtimeProvider>
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        inert={isMobileOpen}
        className={`min-w-0 flex-1 transition-[margin] duration-300 ease-out motion-reduce:transition-none ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <main className="min-w-0 p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</main>
      </div>
    </div>
    </ChatRealtimeProvider>
  );
}
