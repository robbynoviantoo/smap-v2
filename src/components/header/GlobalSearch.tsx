'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { assetService } from '@/services/assetService';
import { Asset } from '@/types/api';
import { 
  Search, 
  Boxes, 
  ShoppingBag, 
  CheckCircle, 
  Calendar, 
  Gift, 
  MessageSquare, 
  Users, 
  Shield, 
  Database, 
  FileText, 
  Settings, 
  HelpCircle, 
  QrCode, 
  ArrowRight, 
  Loader2, 
  X 
} from 'lucide-react';

interface NavOption {
  title: string;
  category: string;
  href: string;
  icon: any;
  keywords: string[];
}

const navOptions: NavOption[] = [
  { title: 'Dashboard Utama', category: 'Menu', href: '/', icon: Boxes, keywords: ['dashboard', 'ringkasan', 'summary', 'beranda', 'home'] },
  { title: 'Manajemen Data Aset', category: 'Menu', href: '/assets', icon: Boxes, keywords: ['aset', 'assets', 'barang', 'inventaris', 'alat'] },
  { title: 'Scan Barcode QR Aset', category: 'Menu', href: '/assets/scanner', icon: QrCode, keywords: ['scan', 'scanner', 'barcode', 'qr', 'pindai'] },
  { title: 'Pengadaan Aset', category: 'Menu', href: '/pengadaan-assets', icon: ShoppingBag, keywords: ['pengadaan', 'procurement', 'beli', 'order', 'request'] },
  { title: 'Approval Input Aset', category: 'Approval', href: '/approvals/asset-pendings', icon: CheckCircle, keywords: ['approval', 'aset', 'persetujuan', 'pending'] },
  { title: 'Approval Pengadaan', category: 'Approval', href: '/approvals/pengadaan-pendings', icon: CheckCircle, keywords: ['approval', 'pengadaan', 'request'] },
  { title: 'Approval Peminjaman', category: 'Approval', href: '/approvals/borrow-pendings', icon: CheckCircle, keywords: ['approval', 'pinjam', 'borrow'] },
  { title: 'Approval Maintenance', category: 'Approval', href: '/approvals/maintenance-pendings', icon: CheckCircle, keywords: ['approval', 'perawatan', 'servis'] },
  { title: 'Stok Souvenir & Merchandise', category: 'Souvenir', href: '/souvenirs', icon: Gift, keywords: ['souvenir', 'stok', 'merchandise', 'gudang'] },
  { title: 'Transaksi Distribusi Souvenir', category: 'Souvenir', href: '/souvenirs/transactions', icon: Gift, keywords: ['transaksi', 'distribusi', 'keluar'] },
  { title: 'Master Nama Souvenir', category: 'Souvenir', href: '/souvenirs/names', icon: Gift, keywords: ['master', 'nama', 'souvenir'] },
  { title: 'Kalender & Agenda Kegiatan', category: 'Menu', href: '/calendar', icon: Calendar, keywords: ['kalender', 'calendar', 'agenda', 'jadwal', 'libur'] },
  { title: 'Pesan Internal (Chat)', category: 'Menu', href: '/chat', icon: MessageSquare, keywords: ['chat', 'pesan', 'messages', 'obrolan'] },
  { title: 'Manajemen Pengguna (Users)', category: 'Superadmin', href: '/superadmin/users', icon: Users, keywords: ['user', 'pengguna', 'staff', 'karyawan', 'akun'] },
  { title: 'Role & Hak Akses', category: 'Superadmin', href: '/superadmin/roles', icon: Shield, keywords: ['role', 'hak akses', 'wewenang', 'permission'] },
  { title: 'Pencadangan Basis Data (Backups)', category: 'Superadmin', href: '/backups', icon: Database, keywords: ['backup', 'cadangan', 'database', 'sql'] },
  { title: 'Log Aktivitas (Audit Trail)', category: 'Superadmin', href: '/activity-logs', icon: FileText, keywords: ['log', 'aktivitas', 'audit', 'riwayat'] },
  { title: 'Integrasi Telegram Bot', category: 'Superadmin', href: '/superadmin/telegram', icon: Settings, keywords: ['telegram', 'bot', 'notifikasi', 'webhook'] },
  { title: 'API Tokens (Sanctum)', category: 'Superadmin', href: '/superadmin/api-tokens', icon: Settings, keywords: ['api', 'token', 'sanctum', 'bearer'] },
  { title: 'Kontrol Sistem & Approval', category: 'Superadmin', href: '/settings', icon: Settings, keywords: ['setting', 'pengaturan', 'kontrol'] },
  { title: 'Siaran Notifikasi (Broadcast)', category: 'Superadmin', href: '/broadcast-notification', icon: Settings, keywords: ['broadcast', 'siaran', 'notifikasi'] },
  { title: 'Pengaturan Trigger Notifikasi', category: 'Superadmin', href: '/notification-settings', icon: Settings, keywords: ['notifikasi', 'setting', 'trigger'] },
  { title: 'Riwayat Transaksi Aset', category: 'Arsip', href: '/assets/transactions', icon: FileText, keywords: ['transaksi', 'pinjam', 'kembali'] },
  { title: 'Tempat Sampah Aset (Trash)', category: 'Arsip', href: '/assets/deleted', icon: FileText, keywords: ['deleted', 'trash', 'sampah', 'terhapus'] },
  { title: 'Pusat Bantuan & Manual Book', category: 'Bantuan', href: '/support', icon: HelpCircle, keywords: ['support', 'bantuan', 'manual', 'panduan', 'excel', 'template'] },
  { title: 'Profil Saya', category: 'Akun', href: '/profile', icon: Users, keywords: ['profile', 'profil', 'password', 'biodata'] },
];

export default function GlobalSearch() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [assetResults, setAssetResults] = useState<Asset[]>([]);
  const [isSearchingAssets, setIsSearchingAssets] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Listen for Cmd+K or Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Debounce live asset search from backend
  useEffect(() => {
    if (!query.trim()) {
      setAssetResults([]);
      setIsSearchingAssets(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingAssets(true);
        const res = await assetService.getAssets({ q: query.trim(), per_page: 5 });
        setAssetResults(res.data || []);
      } catch {
        setAssetResults([]);
      } finally {
        setIsSearchingAssets(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter navigation links based on query
  const filteredNav = query.trim()
    ? navOptions.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.includes(q))
        );
      }).slice(0, 5)
    : navOptions.slice(0, 4); // show quick recommendations when empty

  const handleSelectNav = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  const handleSelectAsset = (asset: Asset) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/assets?q=${encodeURIComponent(asset.no_asset || asset.name)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (filteredNav.length > 0) {
      handleSelectNav(filteredNav[0].href);
    } else {
      setIsOpen(false);
      router.push(`/assets?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <span className="absolute -translate-y-1/2 left-3.5 top-1/2 pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={locale === 'en' ? "Search menus, assets, AST-XXXXXX..." : "Cari menu, aset, AST-XXXXXX..."}
          className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.03] py-2 pl-10 pr-16 text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-2xs"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setAssetResults([]);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="hidden sm:inline-flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 shadow-2xs"
          >
            <span>⌘</span>
            <span>K</span>
          </button>
        </div>
      </form>

      {/* Dropdown Results Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-12 z-[90] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 animate-in fade-in zoom-in-98 duration-150 max-h-[480px] overflow-y-auto">
          {/* Section: Menu & Halaman */}
          {filteredNav.length > 0 && (
            <div className="p-2">
              <span className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {query.trim() ? 'Menu & Halaman' : 'Akses Cepat'}
              </span>
              <div className="space-y-0.5 mt-1">
                {filteredNav.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectNav(item.href)}
                      className="w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-900/30 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {item.title}
                          </div>
                          <span className="text-[10px] text-gray-400">{item.category}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Hasil Pencarian Aset Riil */}
          {query.trim() && (
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Hasil Aset (Database)
                </span>
                {isSearchingAssets && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Mencari...</span>
                  </div>
                )}
              </div>

              {assetResults.length === 0 && !isSearchingAssets ? (
                <div className="py-3 px-2 text-center text-xs text-gray-400">
                  Tidak ada aset yang cocok dengan &quot;{query}&quot;.
                </div>
              ) : (
                <div className="space-y-0.5 mt-1">
                  {assetResults.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleSelectAsset(asset)}
                      className="w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Boxes className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {asset.name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono truncate">
                            {asset.no_asset} • {asset.category || 'General'}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                          asset.status === 'good'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : asset.status === 'maintenance'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {asset.status?.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Footer hint */}
          <div className="p-2.5 bg-gray-50 dark:bg-gray-800/40 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-mono text-[10px]">Enter</kbd> untuk cari di katalog aset</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-mono text-[10px]">Esc</kbd> tutup</span>
          </div>
        </div>
      )}
    </div>
  );
}
