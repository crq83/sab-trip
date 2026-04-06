'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, RotateCw } from 'lucide-react';
import { Media } from '@/types';

interface Props {
  body: string | null;
  media: Media[];
  isAdmin?: boolean;
}

export default function PostBody({ body, media, isAdmin }: Props) {
  const router = useRouter();
  const images = media.filter((m) => m.media_type === 'image');
  const videos = media.filter((m) => m.media_type === 'video');
  const [rotating, setRotating] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function rotateImage(mediaId: string, direction: 'cw' | 'ccw') {
    setRotating(mediaId);
    setError('');
    try {
      const res = await fetch(`/api/media/${mediaId}/rotate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Rotation failed.');
        return;
      }
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setRotating(null);
    }
  }

  return (
    <div>
      {body && (
        <div className="prose prose-slate max-w-none mb-8">
          {body.split('\n').map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i} className="mb-4 text-slate-700 leading-relaxed">
                {paragraph}
              </p>
            ) : null
          )}
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {/* Images grid */}
      {images.length > 0 && (
        <div
          className={
            images.length === 1
              ? 'mb-6'
              : images.length === 2
              ? 'grid grid-cols-2 gap-2 mb-6'
              : 'grid grid-cols-2 md:grid-cols-3 gap-2 mb-6'
          }
        >
          {images.map((img) => (
            <div key={img.id} className="relative overflow-hidden rounded-xl bg-slate-100 group">
              <img
                src={img.r2_url}
                alt={img.file_name || 'Travel photo'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {isAdmin && (
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => rotateImage(img.id, 'ccw')}
                    disabled={rotating === img.id}
                    className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Rotate left (CCW)"
                  >
                    {rotating === img.id ? (
                      <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => rotateImage(img.id, 'cw')}
                    disabled={rotating === img.id}
                    className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Rotate right (CW)"
                  >
                    {rotating === img.id ? (
                      <span className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <RotateCw className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Videos */}
      {videos.map((video) => (
        <div key={video.id} className="mb-6 rounded-xl overflow-hidden bg-black">
          <video
            src={video.r2_url}
            controls
            preload="metadata"
            className="w-full max-h-[500px]"
          />
        </div>
      ))}
    </div>
  );
}
