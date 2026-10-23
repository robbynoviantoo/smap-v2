"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/hooks/api/useAuth";
import { useTranslation } from "@/context/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
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

type SubMenuItem = {
  name: string;
  path: string;
  roles?: string[];
  ping?: boolean;
  count?: number;
};

type MenuItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  ping?: boolean;
  count?: number;
  subItems?: SubMenuItem[];
};

type MenuGroup = {
  title: string;
  roles?: string[];
  items: MenuItem[];
};

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Query live pending badge count
  const { data: pendingData } = useQuery({
    queryKey: ["pwa", "pending-count"],
    queryFn: async () => {
      const res = await apiClient.get("/pwa/pending-count");
      return res.data?.data;
    },
    refetchInterval: 30000, // refresh setiap 30 detik
    enabled: typeof window !== "undefined" && !!user,
  });

  const pendingAssetCount = pendingData?.assets || 0;
  const pendingPengadaanCount = pendingData?.pengadaan || 0;
  const pendingMaintenanceCount = pendingData?.maintenance || 0;
  const pendingBorrowCount = pendingData?.borrow || 0;
  const totalPending = pendingData?.total || 0;

  // Struktur Menu Sama Persis seperti App\Helpers\MenuHelper.php dengan dukungan i18n
  const menuGroups: MenuGroup[] = [
    {
      title: "Menu",
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
          name: "User",
          icon: <UserCircleIcon />,
          roles: ["superadmin"],
          subItems: [
            { name: t("nav.user_management"), path: "/superadmin/users", roles: ["superadmin"] },
            { name: t("nav.role_management"), path: "/superadmin/roles", roles: ["superadmin"] },
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
    return allowedRoles.some((role) => userRoleNames.includes(role.toLowerCase()));
  };

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path?: string) => {
      if (!path) return false;
      if (path === "/" && pathname === "/") return true;
      if (path !== "/" && pathname.startsWith(path)) return true;
      return false;
    },
    [pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    menuGroups.forEach((group, groupIdx) => {
      group.items.forEach((item, itemIdx) => {
        if (item.subItems) {
          item.subItems.forEach((sub) => {
            if (isActive(sub.path)) {
              setOpenSubmenu(`${groupIdx}-${itemIdx}`);
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = openSubmenu;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (key: string) => {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Header */}
      <div
        className={`py-6 flex items-center ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/pertamina-light.svg"
                alt="PERTAMINA SMAP"
                width={160}
                height={42}
                priority
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/pertamina-dark.svg"
                alt="PERTAMINA SMAP"
                width={160}
                height={42}
                priority
              />
            </>
          ) : (
            <Image
              src="/favicon.svg"
              alt="Logo"
              width={34}
              height={34}
            />
          )}
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar pb-6">
        <nav className="space-y-6">
          {menuGroups.map((group, groupIdx) => {
            if (group.roles && !hasRole(group.roles)) return null;

            const visibleItems = group.items.filter((item) => hasRole(item.roles));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                <h2
                  className={`mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex leading-[20px] ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? group.title : <HorizontaLDots />}
                </h2>

                <ul className="flex flex-col gap-1.5">
                  {visibleItems.map((item, itemIdx) => {
                    const key = `${groupIdx}-${itemIdx}`;
                    const hasSub = item.subItems && item.subItems.length > 0;
                    const isOpen = openSubmenu === key;

                    return (
                      <li key={item.name}>
                        {hasSub ? (
                          <button
                            onClick={() => handleSubmenuToggle(key)}
                            className={`menu-item group w-full cursor-pointer ${
                              isOpen ? "menu-item-active" : "menu-item-inactive"
                            } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                          >
                            <span
                              className={`relative ${
                                isOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"
                              }`}
                            >
                              {item.icon}
                              {item.ping && (!isExpanded && !isHovered) && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                              )}
                            </span>

                            {(isExpanded || isHovered || isMobileOpen) && (
                              <>
                                <span className="menu-item-text flex-1 text-left flex items-center gap-2">
                                  {item.name}
                                  {item.ping && item.count && item.count > 0 && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                                      {item.count}
                                    </span>
                                  )}
                                </span>
                                <ChevronDownIcon
                                  className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                                    isOpen ? "rotate-180 text-brand-500" : ""
                                  }`}
                                />
                              </>
                            )}
                          </button>
                        ) : (
                          item.path && (
                            <Link
                              href={item.path}
                              className={`menu-item group ${
                                isActive(item.path) ? "menu-item-active" : "menu-item-inactive"
                              }`}
                            >
                              <span
                                className={`${
                                  isActive(item.path)
                                    ? "menu-item-icon-active"
                                    : "menu-item-icon-inactive"
                                }`}
                              >
                                {item.icon}
                              </span>
                              {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">{item.name}</span>
                              )}
                            </Link>
                          )
                        )}

                        {/* Submenu List */}
                        {hasSub && (isExpanded || isHovered || isMobileOpen) && (
                          <div
                            ref={(el) => {
                              subMenuRefs.current[key] = el;
                            }}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                              height: isOpen ? `${subMenuHeight[key] || 0}px` : "0px",
                            }}
                          >
                            <ul className="mt-1.5 space-y-1 ml-7 pl-2 border-l border-gray-100 dark:border-gray-800">
                              {item.subItems
                                ?.filter((sub) => hasRole(sub.roles))
                                .map((subItem) => (
                                  <li key={subItem.name}>
                                    <Link
                                      href={subItem.path}
                                      className={`menu-dropdown-item flex items-center justify-between ${
                                        isActive(subItem.path)
                                          ? "menu-dropdown-item-active font-semibold text-brand-600 dark:text-brand-400"
                                          : "menu-dropdown-item-inactive"
                                      }`}
                                    >
                                      <span>{subItem.name}</span>
                                      {subItem.ping && subItem.count && subItem.count > 0 && (
                                        <span className="px-1.5 py-0.2 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                          {subItem.count}
                                        </span>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
