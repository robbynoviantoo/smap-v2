import { Inter } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import QueryProvider from '@/providers/QueryProvider';
import PwaProvider from '@/providers/PwaProvider';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: "SMAP — PERTAMINA HSE Training Center",
  description: "Sistem Manajemen Aset & Penunjang PERTAMINA",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/logo-pwa.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SMAP",
  },
};

export const viewport: Viewport = {
  themeColor: "#6777ef",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} dark:bg-gray-900 font-sans antialiased text-gray-800 dark:text-gray-200`}>
        <QueryProvider>
          <LanguageProvider>
            <PwaProvider>
              <ThemeProvider>
                <SidebarProvider>{children}</SidebarProvider>
              </ThemeProvider>
            </PwaProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
