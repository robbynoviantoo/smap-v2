"use client";

import React, { useEffect, useState, useRef } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/hooks/api/useAuth";
import { useTranslation } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import SidebarNavItem, {
  SidebarChildLinks,
  type SidebarItem,
} from "@/components/sidebar/SidebarNavItem";
import { ArrowUpRight, X } from "lucide-react";
import {
  CalenderIcon,
  GridIcon,
  TableIcon,
  BoxCubeIcon,
  CheckCircleIcon,
  ChatIcon,
  UserCircleIcon,
  InfoIcon,
  DocsIcon,
  PaperPlaneIcon,
  LockIcon,
  PlugInIcon,
  TaskIcon,
} from "../icons/index";

type MenuGroup = {
  title: string;
  roles?: string[];
  items: SidebarItem[];
};

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isMobile, toggleMobileSidebar } =
    useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Query live pending badge count
  const { data: pendingData } = useQuery({
    queryKey: ["pwa", "pending-count"],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: {
          total: number;
          breakdown: {
            asset: number;
            pengadaan: number;
            maintenance: number;
            borrow: number;
          };
        };
      }>("/pwa/pending-count");
      return res.data?.data;
    },
    refetchInterval: 30000, // refresh setiap 30 detik
    enabled: typeof window !== "undefined" && !!user,
  });

  const pendingAssetCount = pendingData?.breakdown.asset || 0;
  const pendingPengadaanCount = pendingData?.breakdown.pengadaan || 0;
  const pendingMaintenanceCount = pendingData?.breakdown.maintenance || 0;
  const pendingBorrowCount = pendingData?.breakdown.borrow || 0;
  const totalPending = pendingData?.total || 0;

  // Struktur Menu Sama Persis seperti App\Helpers\MenuHelper.php dengan dukungan i18n
  const menuGroups: MenuGroup[] = [
    {
      title: t("nav.workspace"),
      items: [
        {
          name: t("nav.dashboard"),
          icon: <GridIcon />,
          subItems: [{ name: t("nav.summary_data"), path: "/" }],
        },
        {
          name: t("nav.calendar"),
          icon: <CalenderIcon />,
          path: "/calendar",
        },
        {
          name: t("nav.data"),
          icon: <TableIcon />,
          subItems: [
            { name: t("nav.assets"), path: "/assets" },
            { name: t("nav.procurement"), path: "/pengadaan-assets" },
          ],
        },
        {
          name: t("nav.souvenir"),
          icon: <BoxCubeIcon />,
          subItems: [
            {
              name: t("nav.souvenir_names"),
              path: "/souvenirs/names",
              roles: ["admin-souvenir", "superadmin"],
            },
            {
              name: t("nav.souvenir_stock"),
              path: "/souvenirs",
              roles: ["admin-souvenir", "superadmin"],
            },
            {
              name: t("nav.souvenir_transactions"),
              path: "/souvenirs/transactions",
            },
          ],
        },
        {
          name: t("nav.approval"),
          icon: <CheckCircleIcon />,
          ping: totalPending > 0,
          count: totalPending,
          roles: ["admin-approve", "superadmin"],
          subItems: [
            {
              name: t("nav.approval_asset"),
              path: "/approvals/asset-pendings",
              ping: pendingAssetCount > 0,
              count: pendingAssetCount,
            },
            {
              name: t("nav.approval_pengadaan"),
              path: "/approvals/pengadaan-pendings",
              ping: pendingPengadaanCount > 0,
              count: pendingPengadaanCount,
            },
            {
              name: t("nav.approval_maintenance"),
              path: "/approvals/maintenance-pendings",
              ping: pendingMaintenanceCount > 0,
              count: pendingMaintenanceCount,
            },
            {
              name: t("nav.approval_borrow"),
              path: "/approvals/borrow-pendings",
              ping: pendingBorrowCount > 0,
              count: pendingBorrowCount,
            },
          ],
        },
        {
          name: t("nav.scan_asset"),
          icon: <TaskIcon />,
          path: "/assets/scanner",
        },
        {
          name: t("nav.messages"),
          icon: <ChatIcon />,
          path: "/chat",
        },
      ],
    },
    {
      title: t("nav.settings"),
      items: [
        {
          name: t("nav.user_profile"),
          icon: <UserCircleIcon />,
          path: "/profile",
        },
        {
          name: t("nav.help_support"),
          icon: <InfoIcon />,
          path: "/support",
        },
      ],
    },
    {
      title: t("nav.superadmin"),
      roles: ["superadmin", "developer"],
      items: [
        {
          name: t("nav.users_group"),
          icon: <UserCircleIcon />,
          roles: ["superadmin"],
          subItems: [
            {
              name: t("nav.user_management"),
              path: "/superadmin/users",
              roles: ["superadmin"],
            },
            {
              name: t("nav.role_management"),
              path: "/superadmin/roles",
              roles: ["superadmin"],
            },
          ],
        },
        {
          name: t("nav.assets"),
          icon: <TableIcon />,
          roles: ["superadmin"],
          subItems: [
            {
              name: t("nav.asset_transactions"),
              path: "/assets/transactions",
              roles: ["superadmin"],
            },
            {
              name: t("nav.asset_deleted"),
              path: "/assets/deleted",
              roles: ["superadmin"],
            },
          ],
        },
        {
          name: t("nav.database_backup"),
          icon: <DocsIcon />,
          roles: ["superadmin"],
          subItems: [
            {
              name: t("nav.database_backup"),
              path: "/backups",
              roles: ["superadmin"],
            },
          ],
        },
        {
          name: t("nav.activity_logs"),
          icon: <DocsIcon />,
          path: "/activity-logs",
          roles: ["superadmin"],
        },
        {
          name: t("nav.telegram_bot"),
          icon: <PaperPlaneIcon />,
          path: "/superadmin/telegram",
          roles: ["developer", "superadmin"],
        },
        {
          name: t("nav.api_tokens"),
          icon: <LockIcon />,
          path: "/superadmin/api-tokens",
          roles: ["developer", "superadmin"],
        },
        {
          name: t("nav.control_settings"),
          icon: <PlugInIcon />,
          path: "/settings",
          roles: ["superadmin"],
        },
        {
          name: t("nav.broadcast_notif"),
          icon: <PaperPlaneIcon />,
          path: "/broadcast-notification",
          roles: ["superadmin", "developer"],
        },
        {
          name: t("nav.notification_settings"),
          icon: <PlugInIcon />,
          path: "/notification-settings",
          roles: ["superadmin", "developer"],
        },
      ],
    },
  ];

  // Helper untuk cek izin role user
  const hasRole = (allowedRoles?: string[]) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!user || !user.roles) return false;
    const userRoleNames = user.roles.map((r) => r.name.toLowerCase());
    if (userRoleNames.includes("superadmin")) return true;
    return allowedRoles.some((role) =>
      userRoleNames.includes(role.toLowerCase()),
    );
  };

  const expanded = isExpanded || isMobile;
  const sidebarRef = useRef<HTMLElement>(null);
  useBodyScrollLock(isMobileOpen);
  const visibleGroups = menuGroups
    .filter((group) => hasRole(group.roles))
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => hasRole(item.roles))
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter((sub) => hasRole(sub.roles)),
        }))
        .filter((item) => !item.subItems || item.subItems.length > 0),
    }))
    .filter((group) => group.items.length > 0);
  const paths = visibleGroups.flatMap((group) =>
    group.items.flatMap(
      (item) =>
        item.subItems?.map((sub) => sub.path) || (item.path ? [item.path] : []),
    ),
  );
  // Prefer the deepest permitted destination, so /assets does not also highlight /assets/deleted.
  const activePath = paths
    .filter((path) =>
      path === "/"
        ? pathname === "/"
        : pathname === path || pathname.startsWith(`${path}/`),
    )
    .sort((a, b) => b.length - a.length)[0];
  const itemKey = (item: SidebarItem) =>
    item.path || item.subItems?.[0]?.path || item.name;
  const activeGroup = visibleGroups
    .flatMap((group) => group.items)
    .find((item) => item.subItems?.some((sub) => sub.path === activePath));
  const [manualOpen, setManualOpen] = useState<{
    pathname: string;
    key: string | null;
  } | null>(null);
  const openKey =
    manualOpen?.pathname === pathname
      ? manualOpen.key
      : activeGroup
        ? itemKey(activeGroup)
        : null;

  const [flyout, setFlyout] = useState<{
    pathname: string;
    key: string;
    top: number;
    trigger: HTMLButtonElement;
  } | null>(null);
  const flyoutItem =
    !expanded && flyout?.pathname === pathname
      ? visibleGroups
          .flatMap((group) => group.items)
          .find((item) => itemKey(item) === flyout.key)
      : undefined;
  const closeFlyout = () => setFlyout(null);

  useEffect(() => {
    if (!flyoutItem || !flyout) return;
    const closeOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest("[data-sidebar-flyout], [data-sidebar-trigger]")
      )
        setFlyout(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFlyout(null);
        flyout.trigger.focus();
      }
    };
    const resize = () => setFlyout(null);
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("resize", resize);
    };
  }, [flyout, flyoutItem]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) || [],
      ).filter((el) => el.getClientRects().length > 0);
    focusables()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") toggleMobileSidebar();
      if (event.key === "Tab") {
        const elements = focusables();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [isMobileOpen, toggleMobileSidebar]);

  const onNavigate = () => {
    closeFlyout();
    if (isMobileOpen) toggleMobileSidebar();
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        id="app-sidebar"
        inert={isMobile && !isMobileOpen}
        aria-hidden={isMobile && !isMobileOpen}
        aria-label={t("nav.main_navigation")}
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh flex-col pb-[env(safe-area-inset-bottom)] border-r border-gray-200/80 bg-[#fafbfc] text-gray-900 transition-[width,translate,transform] duration-300 ease-out motion-reduce:transition-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 w-[min(290px,calc(100vw-32px))] ${isExpanded ? "lg:w-[290px]" : "lg:w-[90px]"} ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div
          className={`flex h-[72px] lg:h-[88px] shrink-0 items-center gap-3 px-4 lg:px-6 ${expanded ? "" : "justify-center"}`}
        >
          <Link
            href="/"
            onClick={onNavigate}
            className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="SMAP"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-gray-200/80 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-900">
              <Image
                src="/favicon.svg"
                alt=""
                width={27}
                height={27}
                priority
              />
            </span>
            {expanded && (
              <span>
                <span className="block text-lg font-extrabold tracking-[-0.6px]">
                  SMAP<span className="text-brand-500">.</span>
                </span>
                <span className="block text-[10px] font-medium tracking-wide text-gray-500 dark:text-gray-400">
                  {t("nav.app_caption")}
                </span>
              </span>
            )}
          </Link>
          {isMobileOpen && (
            <button
              type="button"
              onClick={toggleMobileSidebar}
              aria-label={t("nav.close_navigation")}
              className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-5 [scrollbar-width:thin]">
          <nav aria-label={t("nav.main_navigation")} className="space-y-5 lg:space-y-7">
            {visibleGroups.map((group, groupIndex) => (
              <section key={groupIndex} aria-label={group.title}>
                {expanded ? (
                  <h2 className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                    {group.title}
                  </h2>
                ) : (
                  <div className="mx-auto mb-3 h-px w-5 bg-gray-200 dark:bg-gray-800" />
                )}
                <ul className="space-y-1">
                  {group.items.map((item, itemIndex) => {
                    const key = itemKey(item);
                    return (
                      <SidebarNavItem
                        key={key}
                        item={item}
                        expanded={expanded}
                        activePath={activePath}
                        open={expanded ? openKey === key : flyoutItem === item}
                        submenuId={`sidebar-${groupIndex}-${itemIndex}`}
                        onNavigate={onNavigate}
                        onToggle={(event) => {
                          if (!expanded) {
                            const trigger = event.currentTarget;
                            const top = Math.max(
                              12,
                              Math.min(
                                trigger.getBoundingClientRect().top,
                                window.innerHeight - 300,
                              ),
                            );
                            setFlyout(
                              flyoutItem === item
                                ? null
                                : { pathname, key, top, trigger },
                            );
                            return;
                          }
                          setManualOpen({
                            pathname,
                            key: openKey === key && expanded ? null : key,
                          });
                        }}
                      />
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>
        </div>
        <div className="shrink-0 border-t border-gray-200/70 px-5 py-4 dark:border-gray-800">
          {expanded ? (
            <Link
              href="/support"
              onClick={onNavigate}
              className="group flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white p-3 transition-colors hover:border-brand-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
                <InfoIcon className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-semibold dark:text-gray-200">
                  {t("nav.need_help")}
                </span>
                <span className="mt-0.5 block text-[10px] text-gray-500 dark:text-gray-400">
                  {t("nav.help_caption")}
                </span>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-brand-500" />
            </Link>
          ) : (
            <Link
              href="/support"
              onClick={onNavigate}
              aria-label={t("nav.help_support")}
              title={t("nav.help_support")}
              className="flex justify-center rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <InfoIcon className="h-5 w-5" />
            </Link>
          )}
        </div>
      </aside>
      {flyoutItem &&
        flyout &&
        createPortal(
          <nav
            data-sidebar-flyout
            id={`sidebar-${visibleGroups.findIndex((group) => group.items.includes(flyoutItem))}-${visibleGroups.find((group) => group.items.includes(flyoutItem))?.items.indexOf(flyoutItem)}`}
            aria-label={flyoutItem.name}
            style={{ top: flyout.top }}
            className="fixed left-[100px] z-[60] w-64 max-h-[calc(100dvh-24px)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-dark"
          >
            <div className="mb-2 flex items-center justify-between border-b border-gray-100 px-2 pb-3 pt-1 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {flyoutItem.name}
              </span>
              <button
                type="button"
                autoFocus
                onClick={() => {
                  closeFlyout();
                  flyout.trigger.focus();
                }}
                aria-label={t("nav.close_navigation")}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="space-y-1">
              <SidebarChildLinks
                items={flyoutItem.subItems || []}
                activePath={activePath}
                onNavigate={onNavigate}
              />
            </ul>
          </nav>,
          document.body,
        )}
    </>
  );
}
