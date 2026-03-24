import { Compass, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <>
      {/* Wave divider */}
      <div className="bg-[#f8fafc]">
        <svg viewBox="0 0 1440 60" className="w-full block" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60C240 20 480 0 720 10C960 20 1200 50 1440 60V60H0Z" fill="#0f172a" />
        </svg>
      </div>
      <footer className="bg-[#0f172a] text-white/50">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#f97316]/70" />
            <span className="text-sm font-display">
              Alaska · Hawaii 2026
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="w-3 h-3" />
            <span>Apr 8 – May 2, 2026</span>
          </div>
        </div>
      </footer>
    </>
  );
}
