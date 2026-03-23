'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/itinerary', label: 'Itinerary' },
  { href: '/map', label: 'Map' },
  { href: '/blog', label: 'Journal' },
  { href: '/gallery', label: 'Gallery' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors"
        >
          <Compass className="w-5 h-5 text-amber-400" strokeWidth={2} />
          <span className="font-display tracking-widest text-sm font-bold uppercase">
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
                'px-3 py-1.5 rounded text-sm tracking-wide transition-colors',
                pathname === link.href
                  ? 'text-amber-400 bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {link.label}
            </Link>
          ))}
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
        <div className="md:hidden bg-[#1e293b] border-t border-white/10 px-4 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={clsx(
                'block py-2.5 text-sm tracking-wide border-b border-white/10 last:border-0',
                pathname === link.href ? 'text-amber-400' : 'text-white/70'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
