import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: 'Export Tracker - Export Business Management System',
  description: 'Complete export tracking system for managing orders, payments, shipments, and customers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geistSans.className}>
        <div className="min-h-screen bg-slate-50">
          <Sidebar />
          <div className="lg:pl-64">
            <Header />
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
