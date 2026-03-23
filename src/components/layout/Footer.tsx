import { Compass, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1e293b] text-white/50 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400/70" />
          <span className="text-sm tracking-widest uppercase font-display">
            Alaska · Hawaii 2026
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <MapPin className="w-3 h-3" />
          <span>Apr 8 – May 2, 2026</span>
        </div>
      </div>
    </footer>
  );
}
