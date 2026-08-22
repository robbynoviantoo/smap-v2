import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import QueryProvider from '@/providers/QueryProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "SMAP — PERTAMINA HSE Training Center",
  description: "Sistem Manajemen Aset & Penunjang PERTAMINA",
  icons: {
    icon: "/favicon.svg",
  },
};

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <QueryProvider>
          <ThemeProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
