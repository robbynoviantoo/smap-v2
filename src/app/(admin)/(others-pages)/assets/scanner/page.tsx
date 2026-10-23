'use client';

import React, { useState, useEffect, useRef } from 'react';
import { assetService } from '@/services/assetService';
import { Asset } from '@/types/api';
import { useTranslation } from '@/context/LanguageContext';
import alert from '@/lib/alert';
import Link from 'next/link';
import { 
  QrCode, 
  Search, 
  MapPin, 
  Boxes, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  Camera, 
  CameraOff, 
  Loader2, 
  SwitchCamera, 
  Sparkles 
} from 'lucide-react';

export default function AssetScannerPage() {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);

  // Camera Scanner States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerInstanceRef = useRef<any>(null);

  // Parse extracted raw QR string: handles direct code or full URLs
  const parseScannedText = (raw: string): string => {
    const trimmed = raw.trim();
    // Check if URL ends with ID (e.g. https://.../assets/45)
    const urlMatch = trimmed.match(/\/assets\/(\d+|AST-[A-Z0-9]+)\/?$/i);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
    return trimmed;
  };

  const executeLookup = async (lookupCode: string) => {
    try {
      setIsSearching(true);
      const parsed = parseScannedText(lookupCode);
      const res = await assetService.scanAsset(parsed);
      if (res.data) {
        setScannedAsset(res.data);
        setCode(parsed);
      } else {
        alert.error('Aset tidak ditemukan dalam sistem.');
        setScannedAsset(null);
      }
    } catch (err: any) {
      alert.error(err.response?.data?.message || 'Nomor aset tidak ditemukan.');
      setScannedAsset(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      alert.error('Masukkan nomor atau barcode QR aset!');
      return;
    }
    executeLookup(code.trim());
  };

  // Start HTML5 QR Code live camera feed
  const startCamera = async () => {
    try {
      setIsCameraStarting(true);
      setCameraError(null);
      setIsCameraActive(true);

      const { Html5Qrcode } = await import('html5-qrcode');

      // Wait a tick for the #reader container DOM to be mounted
      setTimeout(async () => {
        try {
          const html5QrCode = new Html5Qrcode('qr-camera-reader');
          scannerInstanceRef.current = html5QrCode;

          await html5QrCode.start(
            { facingMode: 'environment' }, // Default to rear camera on mobile
            {
              fps: 12,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            async (decodedText) => {
              // On Successful Scan:
              // Stop camera immediately to prevent repeated triggers
              await stopCamera();
              // Perform asset lookup
              await executeLookup(decodedText);
            },
            () => {
              // Silent per-frame non-detection
            }
          );
        } catch (err: any) {
          console.error('Camera start error:', err);
          setCameraError(
            'Gagal mengakses kamera. Pastikan izin kamera telah diberikan di browser Anda.'
          );
          setIsCameraActive(false);
        } finally {
          setIsCameraStarting(false);
        }
      }, 100);
    } catch (err: any) {
      setCameraError('Gagal memuat modul kamera.');
      setIsCameraStarting(false);
      setIsCameraActive(false);
    }
  };

  // Stop camera feed and cleanup
  const stopCamera = async () => {
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          await scannerInstanceRef.current.stop();
        }
        scannerInstanceRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
      scannerInstanceRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraStarting(false);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current?.isScanning) {
        scannerInstanceRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleReset = () => {
    setCode('');
    setScannedAsset(null);
    stopCamera();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('scanner.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('scanner.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-2xl shadow-sm transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>{t('scanner.camera_scan')}</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 rounded-2xl transition-all"
            >
              <CameraOff className="w-4 h-4" />
              <span>{t('common.close')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Camera Viewport (When Active) */}
      {isCameraActive && (
        <div className="p-6 bg-white dark:bg-white/[0.03] border-2 border-brand-500/40 rounded-3xl shadow-xl space-y-4 animate-in fade-in zoom-in-98 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Kamera Scanner Aktif
              </h3>
            </div>

            <button
              onClick={stopCamera}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Matikan
            </button>
          </div>

          {/* Viewport Box */}
          <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-black border border-gray-200 dark:border-gray-700 shadow-inner flex items-center justify-center">
            {isCameraStarting && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/80 text-white text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                <span>Menghubungkan ke kamera perangkat...</span>
              </div>
            )}

            <div id="qr-camera-reader" className="w-full h-full" />
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Arahkan kotak bidik kamera tepat ke kode QR barcode label aset hingga terdeteksi otomatis.
          </p>

          {cameraError && (
            <div className="p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/30 rounded-xl text-center border border-red-200 dark:border-red-900">
              {cameraError}
            </div>
          )}
        </div>
      )}

      {/* Manual Input / Barcode Scanner Card */}
      <div className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
        <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('scanner.manual_placeholder')}
              className="w-full pl-11 pr-4 py-3 text-sm font-mono rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSearching}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-2xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('common.processing')}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{t('scanner.btn_verify')}</span>
                </>
              )}
            </button>

            {scannedAsset && (
              <button
                type="button"
                onClick={handleReset}
                className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-2xl transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 pt-1">
          <span>
            💡 Mendukung barcode scanner gun USB/Bluetooth, kamera live, atau input manual nomor aset.
          </span>
          {!isCameraActive && (
            <button
              type="button"
              onClick={startCamera}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Buka Kamera Sekarang</span>
            </button>
          )}
        </div>
      </div>

      {/* Scanned Asset Result Card */}
      {scannedAsset && (
        <div className="p-6 bg-white dark:bg-white/[0.03] border-2 border-emerald-500/40 rounded-3xl shadow-lg space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Aset Terverifikasi
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {scannedAsset.name}
                </h3>
                <span className="font-mono text-xs text-gray-500">
                  {scannedAsset.no_asset}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  scannedAsset.available_status === 'available'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                }`}
              >
                {scannedAsset.available_status === 'available' ? 'Siap Digunakan (Tersedia)' : 'Sedang Dipinjam'}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  scannedAsset.status === 'good'
                    ? 'bg-green-100 text-green-800'
                    : scannedAsset.status === 'maintenance'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                Kondisi: {scannedAsset.status?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Kategori / Merk</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {scannedAsset.category || '-'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Merk: {scannedAsset.merk || '-'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Lokasi Penempatan</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {scannedAsset.location || '-'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Gedung: {scannedAsset.building || '-'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Satuan / Unit</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                1 {scannedAsset.unit || 'Unit'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">ID Ref: #{scannedAsset.id}</p>
            </div>
          </div>

          {scannedAsset.remarks && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-400 font-medium">Catatan / Riwayat</span>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                {scannedAsset.remarks}
              </p>
            </div>
          )}

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href={`/assets?q=${scannedAsset.no_asset}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <span>Buka di Katalog Aset Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Scan Aset Lain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
