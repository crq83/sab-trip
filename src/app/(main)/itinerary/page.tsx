'use client';

import { useState } from 'react';
import { itinerary } from '../../../../data/itinerary';
import ItineraryDay from '@/components/itinerary/ItineraryDay';
import { Mountain, Waves } from 'lucide-react';

export default function ItineraryPage() {
  const [active, setActive] = useState<'alaska' | 'hawaii' | 'all'>('all');

  const filtered =
    active === 'all' ? itinerary : itinerary.filter((s) => s.trip === active);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-5xl font-bold text-[#0f172a] mb-2">
          Itinerary
        </h1>
        <p className="text-slate-500 text-sm">April 8 – May 2, 2026</p>
      </div>

      {/* Trip filter */}
      <div className="flex gap-2 justify-center mb-10">
        {(
          [
            { key: 'all', label: 'Full Trip', icon: null },
            { key: 'alaska', label: 'Alaska', icon: Mountain },
            { key: 'hawaii', label: 'Hawaiʻi', icon: Waves },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active === key
                ? key === 'alaska'
                  ? 'bg-[#166534] text-white'
                  : key === 'hawaii'
                  ? 'bg-[#0d9488] text-white'
                  : 'bg-[#0f172a] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div>
        {filtered.map((stop, i) => (
          <ItineraryDay
            key={`${stop.date}-${i}`}
            stop={stop}
            index={i}
            isLast={i === filtered.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
