'use client';

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface RejectReasonModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

export default function RejectReasonModal({
  isOpen,
  title,
  onClose,
  onSubmit,
}: RejectReasonModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSubmit(reason);
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="mobile-dialog-panel w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              {t('approvals.reject')}
            </h4>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {title}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {t('approvals.reject')} <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Alasan penolakan..."
              className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('common.processing')}</span>
                </>
              ) : (
                <span>{t('approvals.reject')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
