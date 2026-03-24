import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600', '700', '900'],
});

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '700', '900'],
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
    <html lang="en" className={`${playfair.variable} ${lato.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
