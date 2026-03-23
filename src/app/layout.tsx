import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AK · HI 2026 — Adventure Travel Blog',
  description:
    'A month-long adventure through Alaska and Hawaii — glaciers, ski resorts, volcanoes, and Pacific coastlines.',
  openGraph: {
    type: 'website',
    title: 'AK · HI 2026 — Adventure Travel Blog',
    description: 'A month-long adventure through Alaska and Hawaii.',
    images: ['/og-default.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#faf7f2] text-[#1e293b]">
        <Navbar />
        <main className="flex-1 pt-14">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
