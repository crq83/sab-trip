'use client';

import { useState } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Media, Post } from '@/types';

interface GalleryItem {
  media: Media;
  post: Post;
}

interface Props {
  items: GalleryItem[];
}

export default function GalleryGrid({ items }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function prev() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + items.length) % items.length);
  }

  function next() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % items.length);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'Escape') setLightboxIndex(null);
  }

  const current = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <>
      {/* Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-2">
        {items.map((item, i) => (
          <div
            key={item.media.id}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg bg-stone-100"
            onClick={() => setLightboxIndex(i)}
          >
            {item.media.media_type === 'image' ? (
              <img
                src={item.media.r2_url}
                alt={item.post.title}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="relative aspect-video bg-stone-900">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {current && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev / Next */}
          {items.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/30 rounded-full"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-black/30 rounded-full"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Media */}
          <div
            className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {current.media.media_type === 'image' ? (
              <img
                src={current.media.r2_url}
                alt={current.post.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={current.media.r2_url}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-lg"
              />
            )}
          </div>

          {/* Caption */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white/70 text-sm px-4">
            <div className="font-medium text-white">{current.post.title}</div>
            {current.post.location_name && (
              <div className="text-xs mt-1">{current.post.location_name}</div>
            )}
            <div className="text-xs mt-1 text-white/40">
              {lightboxIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
