import { createAnonClient } from '@/lib/supabase/server';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { Post, Media } from '@/types';
import { Image as ImageIcon } from 'lucide-react';

export const revalidate = 60;

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
  const items = await getAllMedia();
  const imageCount = items.filter((i) => i.media.media_type === 'image').length;
  const videoCount = items.filter((i) => i.media.media_type === 'video').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-5xl text-[#1e293b] tracking-widest uppercase mb-1">
          Gallery
        </h1>
        {items.length > 0 ? (
          <p className="text-stone-500 text-sm">
            {imageCount} photo{imageCount !== 1 ? 's' : ''} · {videoCount} video{videoCount !== 1 ? 's' : ''}
          </p>
        ) : (
          <p className="text-stone-500 text-sm">Media will appear here once the trip begins</p>
        )}
      </div>

      {items.length > 0 ? (
        <GalleryGrid items={items} />
      ) : (
        <div className="text-center py-20">
          <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-400 text-sm">No photos yet — check back once the adventure starts!</p>
        </div>
      )}
    </div>
  );
}
