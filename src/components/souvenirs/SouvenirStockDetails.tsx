"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import TablePagination from "@/components/common/TablePagination";
import { souvenirService } from "@/services/souvenirService";
import { useSouvenirAccess } from "@/hooks/useSouvenirAccess";
import { useTranslation } from "@/context/LanguageContext";
import type { Souvenir } from "@/types/souvenir";
import alert from "@/lib/alert";

export default function SouvenirStockDetails({
  item,
  onClose,
  onDelete,
}: {
  item: Souvenir;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const { t, locale } = useTranslation();
  const { canManage, canDelete } = useSouvenirAccess();
  const cache = useQueryClient();
  const [tab, setTab] = useState("details");
  const [page, setPage] = useState(1);
  const [description, setDescription] = useState(item.description || "");
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const additions = useQuery({
    queryKey: ["souvenirs", "additions", item.id, page],
    queryFn: () =>
      souvenirService.getStockAdditions({ souvenir_id: item.id, page }),
    enabled: tab === "history",
  });
  const distributions = useQuery({
    queryKey: ["souvenirs", "transactions", "stock", item.id, page],
    queryFn: () =>
      souvenirService.getTransactions({ souvenir_id: item.id, page }),
    enabled: tab === "distribution",
  });
  const result = tab === "history" ? additions : distributions;
  const meta = result.data?.meta;
  const name =
    item.souvenir_name?.name || item.souvenirName?.name || t("nav.souvenir");
  const field =
    "mt-1 min-h-11 w-full rounded-lg border border-gray-200 bg-transparent px-3 text-sm text-gray-900 dark:border-gray-700 dark:text-white";
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const data = new FormData();
      data.set("description", description);
      if (image) data.set("image", image);
      if (removeImage) data.set("remove_image", "1");
      await souvenirService.updateSouvenir(item.id, data);
      await cache.invalidateQueries({ queryKey: ["souvenirs"] });
      onClose();
    } catch {
      alert.error(t("souvenirOps.saveFailed"));
    } finally {
      setBusy(false);
    }
  };
  const cancelAddition = async (id: number) => {
    if (
      !(await alert.confirm(
        t("souvenirOps.cancelAddition"),
        t("souvenirOps.cancelAdditionHint"),
      ))
    )
      return;
    setBusy(true);
    try {
      await souvenirService.deleteStockAddition(id);
      await cache.invalidateQueries({ queryKey: ["souvenirs"] });
    } catch {
      alert.error(t("souvenirOps.cancelAdditionFailed"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal isOpen onClose={onClose} className="max-w-3xl p-5 sm:p-7">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={name}
        className="space-y-5 pt-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("souvenirOps.availableQty", { qty: item.qty })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["details", "history", "distribution"].map((value) => (
            <button
              key={value}
              aria-pressed={tab === value}
              onClick={() => {
                setTab(value);
                setPage(1);
              }}
              className={`min-h-11 rounded-lg px-3 text-sm ${tab === value ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-white" : "text-gray-500"}`}
            >
              {t(`souvenirOps.${value}`)}
            </button>
          ))}
        </div>
        {canManage && (
          <Link
            onClick={onClose}
            href={`/souvenirs/transactions?souvenir=${item.id}`}
            aria-label={`${t("souvenirWorkspace.distribute")} ${name}`}
            className="inline-flex min-h-11 items-center text-sm font-medium text-brand-600"
          >
            {t("souvenirWorkspace.distribute")} {name}
          </Link>
        )}
        {tab === "details" ? (
          <form onSubmit={save} className="space-y-4">
            {item.image_url && !removeImage && (
              <Image
                unoptimized
                src={item.image_url}
                alt={name}
                width={500}
                height={300}
                className="max-h-60 w-full rounded-lg bg-gray-50 object-contain dark:bg-gray-800"
              />
            )}
            <label className="block text-sm text-gray-600 dark:text-gray-300">
              {t("souvenirUi.storageNotes")}
              <textarea
                disabled={!canManage || busy}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={field}
              />
            </label>
            {canManage && (
              <>
                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  {t("souvenirOps.photo")}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={busy}
                    onChange={(e) => {
                      setImage(e.target.files?.[0] || null);
                      setRemoveImage(false);
                    }}
                    className="mt-2 block w-full text-sm"
                  />
                </label>
                {item.image_url && (
                  <label className="flex min-h-11 items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={removeImage}
                      onChange={(e) => {
                        setRemoveImage(e.target.checked);
                        setImage(null);
                      }}
                    />
                    {t("souvenirOps.removePhoto")}
                  </label>
                )}
                <button
                  disabled={busy}
                  className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white disabled:opacity-50"
                >
                  {t(busy ? "common.processing" : "souvenirUi.saveChanges")}
                </button>
              </>
            )}
            {canDelete && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="min-h-11 px-3 text-sm text-red-600"
              >
                {t("souvenirUi.delete")}
              </button>
            )}
          </form>
        ) : (
          <div className="space-y-3">
            {result.isLoading ? (
              <p className="text-sm text-gray-500">{t("common.processing")}</p>
            ) : result.isError ? (
              <p role="alert" className="text-sm text-red-500">
                {t("souvenirOps.loadFailed")}
              </p>
            ) : (result.data?.data.length || 0) === 0 ? (
              <p className="py-5 text-sm text-gray-500">
                {t("souvenirOps.noHistory")}
              </p>
            ) : tab === "history" ? (
              additions.data?.data.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 py-3 text-sm dark:border-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      +{entry.qty} pcs ·{" "}
                      {new Date(entry.date).toLocaleDateString(
                        locale === "id" ? "id-ID" : "en-GB",
                      )}
                    </p>
                    <p className="mt-1 text-gray-500">{entry.notes || "—"}</p>
                    <p className="text-xs text-gray-400">
                      {entry.creator?.name || entry.creator?.first_name || "—"}
                    </p>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => void cancelAddition(entry.id)}
                      disabled={busy}
                      className="min-h-11 px-3 text-red-600 disabled:opacity-50"
                    >
                      {t("souvenirOps.cancelAddition")}
                    </button>
                  )}
                </div>
              ))
            ) : (
              distributions.data?.data.map((entry) => (
                <div
                  key={entry.id}
                  className="border-b border-gray-100 py-3 text-sm dark:border-gray-800"
                >
                  <Link
                    onClick={onClose}
                    href={`/souvenirs/transactions?detail=${entry.id}`}
                    className="inline-flex min-h-11 items-center font-medium text-brand-600"
                  >
                    {entry.training_name}
                  </Link>
                  <p className="text-gray-500">
                    {entry.pic} · {entry.qty_out} pcs ·{" "}
                    {t(
                      entry.status === "open"
                        ? "souvenirUi.open"
                        : "souvenirUi.closed",
                    )}
                  </p>
                </div>
              ))
            )}
            {meta && (
              <TablePagination
                currentPage={meta.current_page || page}
                lastPage={meta.last_page || 1}
                total={meta.total || 0}
                perPage={meta.per_page || 15}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
