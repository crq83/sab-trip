'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, X, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Media, Post } from '@/types';
import EditMediaModal from '@/components/admin/EditMediaModal';

interface GalleryItem {
  media: Media;
  post: Post;
}

interface Props {
  items: GalleryItem[];
  isAdmin?: boolean;
}

export default function GalleryGrid({ items, isAdmin = false }: Props) {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function prev() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + items.length) % items.length);
  }

  function next() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % items.length);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (editingMedia) return; // let modal handle Escape
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'Escape') setLightboxIndex(null);
  }

  async function handleDelete(mediaId: string) {
    setDeleteLoading(true);
    try {
      await fetch(`/api/media/${mediaId}`, { method: 'DELETE' });
      setDeletingId(null);
      setLightboxIndex(null);
      router.refresh();
    } catch {
      // silently ignore
    } finally {
      setDeleteLoading(false);
    }
  }

  const current = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <>
      {/* Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-2 space-y-2">
        {items.map((item, i) => (
          <div
            key={item.media.id}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl bg-slate-100"
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
          onClick={() => { if (!editingMedia && !deletingId) setLightboxIndex(null); }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Top-right controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {isAdmin && (
              <>
                {deletingId === current.media.id ? (
                  <div className="flex items-center gap-2 bg-black/60 rounded-lg px-3 py-1.5">
                    <span className="text-white/80 text-xs">Delete this?</span>
                    <button
                      onClick={() => handleDelete(current.media.id)}
                      disabled={deleteLoading}
                      className="text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      {deleteLoading ? 'Deleting…' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-xs text-white/50 hover:text-white/80"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingMedia(current.media)}
                      className="p-2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(current.media.id)}
                      className="p-2 text-white/70 hover:text-red-400 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            )}
            <button
              className="p-2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
            {current.media.exif_taken_at && (
              <div className="text-xs mt-1 text-white/50">
                {new Date(current.media.exif_taken_at).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })}
              </div>
            )}
            <div className="text-xs mt-1 text-white/40">
              {lightboxIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      )}

      {/* Edit media modal */}
      {editingMedia && (
        <EditMediaModal
          media={editingMedia}
          onClose={() => setEditingMedia(null)}
        />
      )}
    </>
  );
}
