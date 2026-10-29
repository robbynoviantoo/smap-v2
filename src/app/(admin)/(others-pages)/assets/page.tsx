"use client";

import React, { useState } from "react";
import { useAssets } from "@/hooks/api/useAssets";
import { assetService } from "@/services/assetService";
import { Asset } from "@/types/api";
import { useTranslation } from "@/context/LanguageContext";
import AssetTableView from "@/components/assets/AssetTableView";
import AssetGridView from "@/components/assets/AssetGridView";
import AssetFilters from "@/components/assets/AssetFilters";
import AssetFormModal from "@/components/assets/AssetFormModal";
import AssetDetailModal from "@/components/assets/AssetDetailModal";
import AssetQrModal from "@/components/assets/AssetQrModal";
import AssetBorrowReturnModal from "@/components/assets/AssetBorrowReturnModal";
import AssetBulkReturnModal from "@/components/assets/AssetBulkReturnModal";
import AssetBulkPrintQrModal from "@/components/assets/AssetBulkPrintQrModal";
import AssetImportModal from "@/components/assets/AssetImportModal";
import AssetMaintenanceModal, { MaintenanceMode } from "@/components/assets/AssetMaintenanceModal";
import TablePagination from "@/components/common/TablePagination";
import alert from "@/lib/alert";
import { isAxiosError } from "axios";
import {
  Search,
  SlidersHorizontal,
  Upload,
  Download,
  Printer,
  RotateCcw,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";

export default function AssetsPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [building, setBuilding] = useState("");
  const [merk, setMerk] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<Asset | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedAssetForQr, setSelectedAssetForQr] = useState<Asset | null>(null);

  const [isBorrowReturnOpen, setIsBorrowReturnOpen] = useState(false);
  const [borrowReturnMode, setBorrowReturnMode] = useState<"borrow" | "return">("borrow");
  const [selectedAssetForBorrowReturn, setSelectedAssetForBorrowReturn] = useState<Asset | null>(null);

  // Advanced Bulk Action Modals
  const [isBulkReturnOpen, setIsBulkReturnOpen] = useState(false);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Maintenance Management Modal State
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceMode>("schedule");
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState<Asset | null>(null);

  const handleOpenScheduleMaintenance = (asset: Asset) => {
    setSelectedAssetForMaintenance(asset);
    setMaintenanceMode("schedule");
    setIsMaintenanceOpen(true);
  };

  const handleOpenStartMaintenance = (asset: Asset) => {
    setSelectedAssetForMaintenance(asset);
    setMaintenanceMode("start");
    setIsMaintenanceOpen(true);
  };

  const handleOpenFinishMaintenance = (asset: Asset) => {
    setSelectedAssetForMaintenance(asset);
    setMaintenanceMode("finish");
    setIsMaintenanceOpen(true);
  };

  // TanStack Query: Fetch Assets with active filters and pagination
  const {
    assets,
    meta,
    metadata,
    isLoading,
    isFetching,
    createAsset,
    updateAsset,
    deleteAsset,
    refetch,
    isCreating,
    isUpdating,
  } = useAssets({
    q: search || undefined,
    category: category || undefined,
    status: status || undefined,
    location: location || undefined,
    building: building || undefined,
    merk: merk || undefined,
    page,
    per_page: perPage,
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handleLocationChange = (val: string) => {
    setLocation(val);
    setPage(1);
  };

  const handleBuildingChange = (val: string) => {
    setBuilding(val);
    setPage(1);
  };

  const handleMerkChange = (val: string) => {
    setMerk(val);
    setPage(1);
  };

  const handlePerPageChange = (val: number) => {
    setPerPage(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setCategory("");
    setStatus("");
    setLocation("");
    setBuilding("");
    setMerk("");
    setSearch("");
    setPage(1);
  };

  const handleOpenCreate = () => {
    setSelectedAssetForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setSelectedAssetForEdit(asset);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (asset: Asset) => {
    setSelectedAssetForDetail(asset);
    setIsDetailOpen(true);
  };

  const handleOpenQr = (asset: Asset) => {
    setSelectedAssetForQr(asset);
    setIsQrOpen(true);
  };

  const handleOpenBorrow = (asset: Asset) => {
    setSelectedAssetForBorrowReturn(asset);
    setBorrowReturnMode("borrow");
    setIsDetailOpen(false);
    setIsBorrowReturnOpen(true);
  };

  const handleOpenReturn = (asset: Asset) => {
    setSelectedAssetForBorrowReturn(asset);
    setBorrowReturnMode("return");
    setIsDetailOpen(false);
    setIsBorrowReturnOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await alert.confirmDelete(
      t("assets.feedback.delete_title"),
      t("assets.feedback.delete_description")
    );

    if (isConfirmed) {
      try {
        await deleteAsset(id);
        setIsDetailOpen(false);
        alert.toast(t("assets.feedback.deleted"), "success");
      } catch (err: unknown) {
        alert.error(t("assets.feedback.delete_failed"), (isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || t("assets.feedback.server_error"));
      }
    }
  };

  const handleFormSubmit = async (data: Partial<Asset>, imageFile?: File) => {
    try {
      if (selectedAssetForEdit) {
        await updateAsset({ id: selectedAssetForEdit.id, data, imageFile });
        alert.toast(t("assets.feedback.updated"), "success");
      } else {
        await createAsset({ ...data, imageFile });
        alert.toast(t("assets.feedback.created"), "success");
      }
    } catch (err: unknown) {
      alert.error(t("assets.feedback.save_failed"), (isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || t("assets.feedback.check_form"));
      throw err;
    }
  };

  const handleBorrowReturnSubmit = async (id: number | string, remark: string) => {
    try {
      if (borrowReturnMode === "borrow") {
        await assetService.borrowAsset(id, remark);
        alert.toast(t("assets.feedback.borrowed"), "success");
      } else {
        await assetService.returnAsset(id, remark);
        alert.toast(t("assets.feedback.returned"), "success");
      }
      refetch();
    } catch (err: unknown) {
      alert.error(t("assets.feedback.transaction_failed"), (isAxiosError<{ message?: string }>(err) && err.response?.data?.message) || t("assets.feedback.server_error"));
      throw err;
    }
  };

  const handleExport = async () => {
    try {
      alert.toast(t("assets.feedback.export_preparing"), "info");
      const blob = await assetService.exportAssets({
        q: search || undefined,
        category: category || undefined,
        status: status || undefined,
        location: location || undefined,
        building: building || undefined,
        merk: merk || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `assets_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert.toast(t("assets.feedback.exported"), "success");
    } catch {
      alert.error(t("assets.feedback.export_failed"), t("assets.feedback.export_error"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t("assets.page_title")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("assets.page_subtitle")}
          </p>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
        {/* Full Action Toolbar */}
        <div className="flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center justify-between gap-3 mb-4">
          {/* Left: Search Box & Filter Button */}
          <div className="flex items-center gap-2 w-full min-w-0 flex-1 max-w-lg">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t("assets.search_placeholder")}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-9 pr-4 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/60 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3.5" />
            </div>

            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 px-3 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                showFilters || category || status || location || building || merk
                  ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/30 dark:border-brand-800 dark:text-brand-300"
                  : "bg-white border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t("common.filter")}</span>
              {(category || status || location || building || merk) && (
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              )}
            </button>
          </div>

          {/* Right: Action Buttons (Import, Export, Print QR, Bulk Return, View Switcher, Create) */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Import Button */}
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="h-10 px-3 text-xs font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              <span className="hidden sm:inline">{t("common.import")}</span>
            </button>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleExport}
              className="h-10 px-3 text-xs font-semibold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              <span className="hidden sm:inline">{t("common.export")}</span>
            </button>

            {/* Print QR Button */}
            <button
              type="button"
              onClick={() => setIsBulkPrintOpen(true)}
              className="h-10 px-3 text-xs font-semibold rounded-xl border border-purple-200 bg-purple-50/80 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-300 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden md:inline">{t("assets.bulk_print_qr")}</span>
            </button>

            {/* Bulk Return Button */}
            <button
              type="button"
              onClick={() => setIsBulkReturnOpen(true)}
              className="h-10 px-3 text-xs font-semibold rounded-xl border border-orange-200 bg-orange-50/80 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-300 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span className="hidden md:inline">{t("assets.bulk_return")}</span>
            </button>

            {/* View Mode Toggle (Grid vs Table) */}
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                }`}
                title={t("assets.view_grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
                }`}
                title={t("assets.view_table")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Create Asset Primary Button */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-10 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md transition shadow-brand-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t("assets.add_asset")}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        <AssetFilters
          showFilters={showFilters}
          category={category}
          setCategory={handleCategoryChange}
          status={status}
          setStatus={handleStatusChange}
          location={location}
          setLocation={handleLocationChange}
          building={building}
          setBuilding={handleBuildingChange}
          merk={merk}
          setMerk={handleMerkChange}
          onReset={handleResetFilters}
          categories={metadata?.categories || []}
          locations={metadata?.locations || []}
          buildings={metadata?.buildings || []}
          merks={metadata?.merks || []}
        />

        {/* Content Views */}
        {viewMode === "table" ? (
          <AssetTableView
            assets={assets}
            isLoading={isLoading || isFetching}
            onOpenDetail={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onOpenQr={handleOpenQr}
            onBorrow={handleOpenBorrow}
            onReturn={handleOpenReturn}
          />
        ) : (
          <AssetGridView
            assets={assets}
            isLoading={isLoading || isFetching}
            onOpenDetail={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onOpenQr={handleOpenQr}
            onBorrow={handleOpenBorrow}
            onReturn={handleOpenReturn}
          />
        )}

        {/* Pagination Controls */}
        {meta && meta.total && meta.total > 0 ? (
          <TablePagination
            currentPage={meta.current_page || page}
            lastPage={meta.last_page || 1}
            total={meta.total}
            perPage={meta.per_page || perPage}
            from={meta.from}
            to={meta.to}
            onPageChange={(newPage) => setPage(newPage)}
            onPerPageChange={handlePerPageChange}
            isLoading={isLoading || isFetching}
          />
        ) : null}
      </div>

      {/* Dynamic Modals */}
      <AssetFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedAssetForEdit}
        isLoading={isCreating || isUpdating}
        categories={metadata?.categories || []}
        locations={metadata?.locations || []}
        buildings={metadata?.buildings || []}
        merks={metadata?.merks || []}
        subCategories={metadata?.sub_categories || []}
        existingNames={Array.from(new Set(assets.map((a) => a.name)))}
      />

      <AssetDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        asset={selectedAssetForDetail}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onOpenQr={handleOpenQr}
        onBorrow={handleOpenBorrow}
        onReturn={handleOpenReturn}
        onScheduleMaintenance={handleOpenScheduleMaintenance}
        onStartMaintenance={handleOpenStartMaintenance}
        onFinishMaintenance={handleOpenFinishMaintenance}
      />

      <AssetMaintenanceModal
        isOpen={isMaintenanceOpen}
        mode={maintenanceMode}
        asset={selectedAssetForMaintenance}
        onClose={() => setIsMaintenanceOpen(false)}
        onSuccess={() => {
          refetch();
          if (
            selectedAssetForDetail &&
            selectedAssetForMaintenance &&
            selectedAssetForDetail.id === selectedAssetForMaintenance.id
          ) {
            assetService.getAssetById(selectedAssetForDetail.id).then((res) => {
              if (res.data) setSelectedAssetForDetail(res.data);
            });
          }
        }}
      />

      <AssetQrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        asset={selectedAssetForQr}
      />

      <AssetBorrowReturnModal
        isOpen={isBorrowReturnOpen}
        onClose={() => setIsBorrowReturnOpen(false)}
        asset={selectedAssetForBorrowReturn}
        mode={borrowReturnMode}
        onSubmit={handleBorrowReturnSubmit}
      />

      {/* Bulk Action Modals */}
      <AssetBulkReturnModal
        isOpen={isBulkReturnOpen}
        onClose={() => setIsBulkReturnOpen(false)}
        onSuccess={() => refetch()}
      />

      <AssetBulkPrintQrModal
        isOpen={isBulkPrintOpen}
        onClose={() => setIsBulkPrintOpen(false)}
        assets={assets}
      />

      <AssetImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}