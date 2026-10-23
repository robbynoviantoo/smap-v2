'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  Send, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

const faqs = [
  {
    q: 'Bagaimana cara menambahkan aset baru ke dalam sistem?',
    a: 'Masuk ke menu Data > Asset, klik tombol "+ Create Asset". Isi formulir dengan lengkap termasuk nama, kategori, merk, dan lokasi penempatan. Jika alur approval diaktifkan, aset akan masuk ke status pending sebelum disetujui oleh Admin.',
  },
  {
    q: 'Bagaimana cara mencatat peminjaman dan pengembalian aset?',
    a: 'Pada tabel aset, klik ikon Pinjam pada aset yang bersangkutan, masukkan nama peminjam serta catatan, lalu konfirmasi. Saat dikembalikan, buka modal pengembalian untuk memperbarui status ketersediaan kembali ke "Tersedia".',
  },
  {
    q: 'Apa fungsi nomor aset AST-XXXXXX dan QR Code?',
    a: 'Setiap aset memiliki kode unik acak untuk pelabelan fisik. QR code dapat dicetak dan ditempel pada fisik barang, lalu dipindai menggunakan menu Scan Asset untuk melihat rincian riwayat langsung di lapangan.',
  },
  {
    q: 'Bagaimana alur kerja pengadaan barang / procurement?',
    a: 'Pengajuan dibuat melalui menu Data > Pengadaan. Setelah disetujui, admin pengadaan memajukan tahapan (Pre Order -> On Process -> Arrived). Saat barang fisik datang, catat kedatangan (delivery) dan unggah foto surat jalan, lalu klik "Konversi ke Aset" agar otomatis terdata di inventaris.',
  },
  {
    q: 'Bagaimana cara melakukan impor data aset secara massal?',
    a: 'Unduh file "Template Import Data Excel" di bawah ini, isi data sesuai kolom yang telah ditentukan, lalu klik tombol "Import" pada halaman manajemen aset.',
  },
];

export default function SupportPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

  const downloadTemplateUrl = `${apiBase}/support/download-template`;
  const downloadManualDocx = `${apiBase}/support/download-manual/docx`;
  const downloadManualPdf = `${apiBase}/support/download-manual/pdf`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-950/30 dark:to-blue-950/20 border border-brand-200 dark:border-brand-900/40 rounded-3xl shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('support.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 max-w-2xl">
          {t('nav.help_support')}
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Email */}
        <div className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Dukungan Email</h4>
          <p className="text-xs text-gray-500">Kirim tiket kendala atau pertanyaan teknis resmi.</p>
          <a
            href="mailto:support@pertamina-hsetc.com"
            className="inline-block text-xs font-semibold text-brand-600 hover:underline pt-1"
          >
            support@pertamina-hsetc.com
          </a>
        </div>

        {/* WhatsApp */}
        <div className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">WhatsApp Helpdesk</h4>
          <p className="text-xs text-gray-500">Respon cepat untuk kendala operasional mendesak.</p>
          <a
            href="https://wa.me/6285727119695"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs font-semibold text-emerald-600 hover:underline pt-1"
          >
            +62 857-2711-9695
          </a>
        </div>

        {/* Telegram Bot */}
        <div className="p-5 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Telegram Notifikasi</h4>
          <p className="text-xs text-gray-500">Bot interaktif untuk approval dan peringatan dini.</p>
          <a
            href="https://t.me/pertaminahsetc_bot"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs font-semibold text-cyan-600 hover:underline pt-1"
          >
            @pertaminahsetc_bot
          </a>
        </div>
      </div>

      {/* Downloads Section */}
      <div className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Berkas Unduhan Resmi
          </h3>
          <p className="text-xs text-gray-500">
            Format template impor data aset dan buku panduan lengkap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Template Excel */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Template Import Data Aset (.xlsx)
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Gunakan template spreadsheet ini untuk input masal ratusan aset sekaligus tanpa mengetik satu per satu.
                </p>
              </div>
            </div>

            <a
              href={downloadTemplateUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl transition-all w-fit"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template Excel</span>
            </a>
          </div>

          {/* Manual Book */}
          <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Buku Manual Book Sistem (Panduan Lengkap)
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Panduan langkah demi langkah tata kelola aset Pertamina HSE Training Center.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={downloadManualPdf}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>

              <a
                href={downloadManualDocx}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Word (.docx)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="p-6 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Pertanyaan Yang Sering Diajukan (FAQ)
          </h3>
          <p className="text-xs text-gray-500">
            Panduan solusi cepat atas pertanyaan umum seputar operasional sistem.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
