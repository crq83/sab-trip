'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'auth-p';

// Keeps ?p= in the URL across client-side navigation.
// On first load it saves the value to sessionStorage; on each subsequent
// navigation it re-injects it if the new URL doesn't already have it.
export default function PersistPasswordParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Save ?p= to sessionStorage whenever we see it
  useEffect(() => {
    const p = searchParams.get('p');
    if (p) {
      sessionStorage.setItem(STORAGE_KEY, p);
    }
  }, [searchParams]);

  // After every navigation, re-inject ?p= if it got dropped
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    if (searchParams.get('p')) return; // already present
    const params = new URLSearchParams(searchParams.toString());
    params.set('p', stored);
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, searchParams, router]);

  return null;
}
