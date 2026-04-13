import { Suspense } from 'react';
import { cookies } from 'next/headers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PersistPasswordParam from '@/components/PersistPasswordParam';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin-auth')?.value === 'true';

  return (
    <>
      {/* Suspense is required for useSearchParams in App Router */}
      <Suspense fallback={null}>
        <PersistPasswordParam />
      </Suspense>
      <Navbar isAdmin={isAdmin} />
      <main className="flex-1 pt-14">{children}</main>
      <Footer />
    </>
  );
}
