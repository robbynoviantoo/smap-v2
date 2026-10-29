"use client";
import { useTranslation } from "@/context/LanguageContext";
import { useSouvenirAccess } from "@/hooks/useSouvenirAccess";
import type { SouvenirTransaction } from "@/types/souvenir";

export default function SouvenirDistributionCards({
  items,
  onDetail,
  onComplete,
  onRecall,
  onDelete,
}: {
  items: SouvenirTransaction[];
  onDetail: (item: SouvenirTransaction) => void;
  onComplete: (item: SouvenirTransaction) => void;
  onRecall: (item: SouvenirTransaction) => void;
  onDelete: (item: SouvenirTransaction) => void;
}) {
  const { t, locale } = useTranslation();
  const { canManage, canDelete } = useSouvenirAccess();
  return (
    <div className="space-y-3 md:hidden">
      {items.map((item) => {
        const recorded =
          item.qty_actual !== null && item.qty_actual !== undefined;
        const remaining = recorded
          ? Math.max(0, item.qty_out - item.qty_actual!)
          : null;
        const external =
          item.status === "closed" &&
          ["left_at_venue", "other"].includes(item.return_location || "") &&
          (remaining || 0) > 0;
        return (
          <article
            key={item.id}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3>
                  <button
                    onClick={() => onDetail(item)}
                    className="text-left font-semibold text-gray-900 dark:text-white"
                  >
                    {item.training_name}
                  </button>
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {item.souvenir?.souvenir_name?.name ||
                    item.souvenir?.souvenirName?.name}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${item.status === "open" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}
              >
                {t(
                  item.status === "open"
                    ? "souvenirFlow.ongoing"
                    : "souvenirFlow.closed",
                )}
              </span>
            </header>
            <p className="mt-3 text-xs text-gray-500">
              {item.pic} ·{" "}
              {new Date(item.date_out).toLocaleDateString(
                locale === "id" ? "id-ID" : "en-GB",
              )}
            </p>
            <dl className="my-4 grid grid-cols-3 gap-2 border-y border-gray-100 py-3 dark:border-gray-800">
              {[
                ["brought", item.qty_out],
                ["actual", item.qty_actual],
                ["remaining", remaining],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs text-gray-500">
                    {t(`souvenirFlow.${key}`)}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums text-gray-900 dark:text-white">
                    {value ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
            {external && (
              <p className="mb-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                {t("souvenirFlow.external", { qty: remaining! })}
              </p>
            )}
            {item.status === "open" && !recorded && (
              <p className="mb-3 text-xs text-gray-500">
                {t("souvenirFlow.recordHint")}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {canManage && item.status === "open" && (
                <button
                  onClick={() => onComplete(item)}
                  className="min-h-11 flex-1 rounded-lg bg-brand-600 px-3 text-sm font-medium text-white"
                >
                  {t(
                    recorded
                      ? "souvenirUi.finish"
                      : "souvenirFlow.recordActual",
                  )}
                </button>
              )}
              <button
                onClick={() => onDetail(item)}
                className="min-h-11 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200"
              >
                {t("souvenirOps.details")}
              </button>
              {canManage && external && (
                <button
                  onClick={() => onRecall(item)}
                  className="min-h-11 px-3 text-sm font-medium text-amber-700 dark:text-amber-400"
                >
                  {t("souvenirUi.recall")}
                </button>
              )}
              {canDelete && item.status === "open" && (
                <button
                  onClick={() => onDelete(item)}
                  className="min-h-11 px-2 text-xs text-red-600"
                >
                  {t("souvenirUi.delete")}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
