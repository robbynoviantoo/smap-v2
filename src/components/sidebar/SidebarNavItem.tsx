"use client";

import type { ReactNode, MouseEvent } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export interface SidebarChild {
  name: string;
  path: string;
  roles?: string[];
  ping?: boolean;
  count?: number;
}

export interface SidebarItem {
  name: string;
  icon: ReactNode;
  path?: string;
  roles?: string[];
  ping?: boolean;
  count?: number;
  subItems?: SidebarChild[];
}

function CountBadge({ count }: { count?: number }) {
  if (!count || count < 1) return null;
  return (
    <span className="ml-auto min-w-5 rounded-md bg-orange-100 px-1.5 py-0.5 text-center text-[10px] font-bold tabular-nums text-orange-700 dark:bg-orange-400/15 dark:text-orange-300">
      {count > 99 ? "99+" : count}
    </span>
  );
}

interface SidebarNavItemProps {
  item: SidebarItem;
  expanded: boolean;
  open: boolean;
  activePath?: string;
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
  onNavigate: () => void;
  submenuId: string;
}

export default function SidebarNavItem({
  item,
  expanded,
  open,
  activePath,
  onToggle,
  onNavigate,
  submenuId,
}: SidebarNavItemProps) {
  const hasChildren = !!item.subItems?.length;
  const active =
    !!activePath &&
    (item.path === activePath ||
      !!item.subItems?.some((sub) => sub.path === activePath));
  const rowClass = `group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${expanded ? "" : "justify-center"} ${active ? "bg-gray-900 text-white shadow-sm dark:bg-white/10 dark:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"}`;
  const content = (
    <>
      <span
        className={`relative flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-[19px] [&>svg]:w-[19px] ${active ? "text-white/90" : "text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200"}`}
      >
        {item.icon}
        {!expanded && !!item.count && item.count > 0 && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-400 ring-2 ring-white dark:ring-gray-900" />
        )}
      </span>
      {expanded && (
        <>
          <span className="min-w-0 flex-1 text-left leading-5">
            {item.name}
          </span>
          <CountBadge count={item.count} />
          {hasChildren && (
            <ChevronDown
              aria-hidden="true"
              className={`h-3.5 w-3.5 shrink-0 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
          {active && !hasChildren && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          )}
        </>
      )}
    </>
  );

  return (
    <li>
      {hasChildren ? (
        <button
          type="button"
          className={rowClass}
          onClick={onToggle}
          aria-label={item.name}
          title={!expanded ? item.name : undefined}
          data-sidebar-trigger
          aria-expanded={open}
          aria-controls={open ? submenuId : undefined}
        >
          {content}
        </button>
      ) : (
        <Link
          href={item.path || "/"}
          onClick={onNavigate}
          className={rowClass}
          aria-label={item.name}
          title={!expanded ? item.name : undefined}
          aria-current={active ? "page" : undefined}
        >
          {content}
        </Link>
      )}
      {hasChildren && expanded && open && (
        <ul
          id={submenuId}
          className="ml-[21px] mt-2 space-y-1 border-l border-gray-200 py-0.5 pl-4 dark:border-gray-800"
        >
          <SidebarChildLinks
            items={item.subItems || []}
            activePath={activePath}
            onNavigate={onNavigate}
          />
        </ul>
      )}
    </li>
  );
}

export function SidebarChildLinks({
  items,
  activePath,
  onNavigate,
}: {
  items: SidebarChild[];
  activePath?: string;
  onNavigate: () => void;
}) {
  return (
    <>
      {items.map((sub) => (
        <li key={sub.path}>
          <Link
            href={sub.path}
            onClick={onNavigate}
            aria-current={activePath === sub.path ? "page" : undefined}
            className={`flex min-h-11 lg:min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-xs leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${activePath === sub.path ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"}`}
          >
            <span
              className={`h-1 w-1 shrink-0 rounded-full ${activePath === sub.path ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"}`}
            />
            <span className="flex-1">{sub.name}</span>
            <CountBadge count={sub.count} />
          </Link>
        </li>
      ))}
    </>
  );
}
