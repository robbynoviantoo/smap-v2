'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/context/LanguageContext';
import apiClient from '@/lib/api-client';
import { Boxes, ShoppingBag, ArrowUpRight, Wrench } from 'lucide-react';

export default function ApprovalTabs() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const { data: pendingData } = useQuery({
    queryKey: ['pwa', 'pending-count'],
    queryFn: async () => {
      const res = await apiClient.get('/pwa/pending-count');
      return res.data?.data;
    },
    refetchInterval: 30000,
  });

  const tabs = [
    {
      label: t('nav.approval_asset'),
      href: '/approvals/asset-pendings',
      count: pendingData?.assets || 0,
      icon: Boxes,
    },
    {
      label: t('nav.approval_pengadaan'),
      href: '/approvals/pengadaan-pendings',
      count: pendingData?.pengadaan || 0,
      icon: ShoppingBag,
    },
    {
      label: t('nav.approval_borrow'),
      href: '/approvals/borrow-pendings',
      count: pendingData?.borrow || 0,
      icon: ArrowUpRight,
    },
    {
      label: t('nav.approval_maintenance'),
      href: '/approvals/maintenance-pendings',
      count: pendingData?.maintenance || 0,
      icon: Wrench,
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200 dark:border-gray-800">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              isActive
                ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
