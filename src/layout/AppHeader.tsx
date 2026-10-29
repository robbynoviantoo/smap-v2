"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import UserDropdown from "@/components/header/UserDropdown";
import GlobalSearch from "@/components/header/GlobalSearch";
import { useSidebar } from "@/context/SidebarContext";
import { useTranslation } from "@/context/LanguageContext";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AppHeader() {
  const {
    isMobile,
    isMobileOpen,
    isExpanded,
    toggleSidebar,
    toggleMobileSidebar,
  } = useSidebar();
  const { t } = useTranslation();
  return (
    <header className="relative top-0 z-40 w-full border-b border-gray-200 bg-white lg:sticky dark:border-gray-800 dark:bg-gray-900">
      <div className="flex min-w-0 flex-wrap items-center gap-2 px-3 py-3 sm:px-5 lg:flex-nowrap lg:gap-4 lg:px-6">
        <button
          type="button"
          onClick={isMobile ? toggleMobileSidebar : toggleSidebar}
          aria-label={t("nav.toggle_navigation")}
          aria-controls="app-sidebar"
          aria-expanded={isMobile ? isMobileOpen : isExpanded}
          className="flex h-11 shrink-0 items-center justify-center gap-1 rounded-lg px-1 text-gray-700 hover:bg-gray-100 active:bg-gray-200 lg:w-11 lg:gap-2 lg:px-2 lg:border lg:border-gray-200 dark:text-gray-200 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:lg:border-gray-800"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="text-xs font-semibold lg:hidden">Menu</span>
        </button>
        <Link href="/" className="flex min-h-11 min-w-8 flex-1 items-center lg:hidden" aria-label="SMAP">
          <Image
            src="/favicon.svg"
            alt="SMAP"
            width={30}
            height={30}
            className="sm:hidden"
          />
          <Image
            src="/images/logo/pertamina-light.svg"
            alt="PERTAMINA SMAP"
            width={130}
            height={34}
            className="hidden sm:block dark:sm:hidden"
          />
          <Image
            src="/images/logo/pertamina-dark.svg"
            alt="PERTAMINA SMAP"
            width={130}
            height={34}
            className="hidden dark:sm:block"
          />
        </Link>
        <div className="order-last w-full min-w-0 lg:order-none lg:w-auto lg:max-w-xl lg:flex-1">
          <GlobalSearch />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggleButton />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
