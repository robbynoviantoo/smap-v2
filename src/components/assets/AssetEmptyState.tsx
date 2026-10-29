"use client";

import { PackageSearch } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function AssetEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="py-16 text-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
      <PackageSearch className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
      <p className="text-xs">{t("assets.view.empty")}</p>
    </div>
  );
}
