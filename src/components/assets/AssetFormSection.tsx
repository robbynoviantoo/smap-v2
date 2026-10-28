import type { ReactNode } from "react";

interface AssetFormSectionProps {
  title: string;
  children: ReactNode;
}

export default function AssetFormSection({ title, children }: AssetFormSectionProps) {
  return (
    <div className="space-y-3.5 bg-gray-50/60 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
      <h4 className="font-bold text-xs text-brand-600 dark:text-brand-400 uppercase tracking-wider">
        {title}
      </h4>
      {children}
    </div>
  );
}
