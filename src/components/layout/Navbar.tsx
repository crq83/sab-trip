'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, Menu, X, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/itinerary', label: 'Itinerary' },
  { href: '/map', label: 'Map' },
  { href: '/blog', label: 'Journal' },
  { href: '/gallery', label: 'Gallery' },
];

interface Props {
  isAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:text-[#f97316] transition-colors"
        >
          <Compass className="w-5 h-5 text-[#f97316]" strokeWidth={2} />
          <span className="font-display tracking-wide text-sm font-bold uppercase">
            AK · HI 2026
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm tracking-wide transition-colors',
                pathname === link.href
                  ? 'text-[#f97316] bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Admin badge */}
          {isAdmin && (
            <span className="ml-1 flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-400 bg-amber-400/10 rounded-lg border border-amber-400/20">
              <Shield className="w-3 h-3" />
              Admin
            </span>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="ml-1 flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white/70 hover:text-white p-1"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-[#0f172a] border-t border-white/10 px-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={clsx(
                'block py-2.5 text-sm tracking-wide border-b border-white/10 last:border-0',
                pathname === link.href ? 'text-[#f97316]' : 'text-white/70'
              )}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <div className="flex items-center gap-1.5 py-2.5 text-xs text-amber-400 border-b border-white/10">
              <Shield className="w-3 h-3" />
              Admin mode active
            </div>
          )}
          <button
            onClick={() => { setOpen(false); handleLogout(); }}
            className="flex items-center gap-2 py-2.5 text-sm text-white/50 w-full"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
