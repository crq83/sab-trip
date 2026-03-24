import { MapPin } from 'lucide-react';
import { ItineraryStop } from '../../../data/itinerary';

interface Props {
  stop: ItineraryStop;
  index: number;
  isLast: boolean;
}

export default function ItineraryDay({ stop, index, isLast }: Props) {
  const date = new Date(stop.date + 'T12:00:00');
  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex gap-4 md:gap-6">
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border-2 ${
            stop.trip === 'alaska'
              ? 'bg-[#166534] border-[#15803d] text-white'
              : 'bg-[#0d9488] border-[#0f766e] text-white'
          }`}
        >
          {stop.icon || (stop.trip === 'alaska' ? '🏔️' : '🌺')}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-8 mt-1 ${
              stop.trip === 'alaska' ? 'bg-[#166534]/20' : 'bg-[#0d9488]/20'
            }`}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-8 flex-1">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-2">
            <time className="text-xs font-medium text-slate-400 tracking-wide uppercase">
              {formatted}
            </time>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                stop.trip === 'alaska'
                  ? 'bg-[#166534]/10 text-[#166534]'
                  : 'bg-[#0d9488]/10 text-[#0d9488]'
              }`}
            >
              {stop.trip === 'alaska' ? 'Alaska' : 'Hawaiʻi'}
            </span>
          </div>

          <h3 className="font-display text-lg font-semibold text-[#0f172a] mb-1">
            {stop.title}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3 text-[#f97316] shrink-0" />
            <span className="text-xs text-slate-500">{stop.location}</span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{stop.description}</p>
        </div>
      </div>
    </div>
  );
}
