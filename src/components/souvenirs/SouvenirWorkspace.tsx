'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSouvenirAccess } from '@/hooks/useSouvenirAccess';
import { useTranslation } from '@/context/LanguageContext';
import { Package, ArrowLeftRight, Tag } from 'lucide-react';
import type { ReactNode } from 'react';

export default function SouvenirWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { canManage } = useSouvenirAccess();
  const { t } = useTranslation();

  const tabs = [
    {
      href: '/souvenirs',
      label: t('nav.souvenir_stock'),
      icon: Package,
      active: pathname === '/souvenirs',
    },
    {
      href: '/souvenirs/transactions',
      label: t('nav.souvenir_transactions'),
      icon: ArrowLeftRight,
      active: pathname.startsWith('/souvenirs/transactions'),
    },
    ...(canManage
      ? [
          {
            href: '/souvenirs/names',
            label: t('nav.souvenir_names'),
            icon: Tag,
            active: pathname.startsWith('/souvenirs/names'),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Tabs matching SMAP Design System */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                tab.active
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
