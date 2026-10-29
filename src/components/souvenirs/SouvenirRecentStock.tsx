"use client";
import { useQuery } from "@tanstack/react-query";
import { souvenirService } from "@/services/souvenirService";
import { useTranslation } from "@/context/LanguageContext";
import type { Souvenir } from "@/types/souvenir";

export default function SouvenirRecentStock({
  onDetail,
}: {
  onDetail: (item: Souvenir) => void;
}) {
  const { t, locale } = useTranslation();
  const query = useQuery({
    queryKey: ["souvenirs", "additions", "recent"],
    queryFn: () => souvenirService.getStockAdditions({ per_page: 8 }),
  });
  return (
    <aside className="self-start rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="font-semibold text-gray-900 dark:text-white">
        {t("souvenirFlow.recentStock")}
      </h2>
      <p className="mt-1 text-xs text-gray-500">
        {t("souvenirFlow.recentHint")}
      </p>
      <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
        {query.isLoading ? (
          <p className="py-4 text-sm text-gray-500">{t("common.processing")}</p>
        ) : query.isError ? (
          <p className="py-4 text-sm text-red-500">
            {t("souvenirOps.loadFailed")}
          </p>
        ) : !query.data?.data.length ? (
          <p className="py-4 text-sm text-gray-500">
            {t("souvenirOps.noHistory")}
          </p>
        ) : (
          query.data.data.map((entry) => (
            <div key={entry.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <button
                  disabled={!entry.souvenir}
                  onClick={() => entry.souvenir && onDetail(entry.souvenir)}
                  className="min-h-11 text-left text-sm font-medium text-gray-900 hover:text-brand-600 dark:text-white"
                >
                  {entry.souvenir?.souvenir_name?.name ||
                    entry.souvenir?.souvenirName?.name ||
                    "—"}
                </button>
                <span className="shrink-0 pt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  +{entry.qty}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(entry.date).toLocaleDateString(
                  locale === "id" ? "id-ID" : "en-GB",
                )}{" "}
                · {entry.creator?.name || entry.creator?.first_name || "—"}
              </p>
              {entry.notes && (
                <p className="mt-1 text-xs text-gray-500">{entry.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
