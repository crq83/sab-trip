import { createAnonClient } from '@/lib/supabase/server';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { getAuthState } from '@/lib/auth';
import { Post, Media } from '@/types';
import { Image as ImageIcon } from 'lucide-react';

async function getAllMedia() {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('posts')
      .select('*, media(*)')
      .eq('status', 'published')
      .order('post_date', { ascending: false });

    const posts = (data as (Post & { media: Media[] })[]) || [];
    const items: { media: Media; post: Post }[] = [];

    for (const post of posts) {
      for (const media of post.media ?? []) {
        items.push({ media, post });
      }
    }

    return items;
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const [items, { isAdmin }] = await Promise.all([getAllMedia(), getAuthState()]);
  const imageCount = items.filter((i) => i.media.media_type === 'image').length;
  const videoCount = items.filter((i) => i.media.media_type === 'video').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-5xl font-bold text-[#0f172a] mb-1">
          Gallery
        </h1>
        {items.length > 0 ? (
          <p className="text-slate-500 text-sm">
            {imageCount} photo{imageCount !== 1 ? 's' : ''} · {videoCount} video{videoCount !== 1 ? 's' : ''}
          </p>
        ) : (
          <p className="text-slate-500 text-sm">Media will appear here once the trip begins</p>
        )}
      </div>

      {items.length > 0 ? (
        <GalleryGrid items={items} isAdmin={isAdmin} />
      ) : (
        <div className="text-center py-20">
          <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">No photos yet — check back once the adventure starts!</p>
        </div>
      )}
    </div>
  );
}
