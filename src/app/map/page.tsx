import { createAnonClient } from '@/lib/supabase/server';
import { Post, Media } from '@/types';
import { Camera, Video, FileText, Mountain } from 'lucide-react';
import MapClient from '@/components/map/MapClient';

export const revalidate = 60;

async function getPosts(): Promise<Post[]> {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('posts')
      .select('*, media(*)')
      .eq('status', 'published')
      .order('post_date', { ascending: false });
    return (data as (Post & { media: Media[] })[]) || [];
  } catch {
    return [];
  }
}

export default async function MapPage() {
  const posts = await getPosts();
  const geolocated = posts.filter((p) => p.lat && p.lng);
  const photos = posts.reduce(
    (sum, p) => sum + (p.media?.filter((m) => m.media_type === 'image').length ?? 0),
    0
  );
  const videos = posts.reduce(
    (sum, p) => sum + (p.media?.filter((m) => m.media_type === 'video').length ?? 0),
    0
  );

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* Stats bar */}
      <div className="bg-[#0f172a] text-white/70 px-4 py-2 flex items-center gap-6 text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <Mountain className="w-3.5 h-3.5 text-[#f97316]" />
          <span>{geolocated.length} mapped posts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" />
          <span>{photos} photos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5" />
          <span>{videos} videos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span>{posts.length - geolocated.length} text-only</span>
        </div>
      </div>

      {/* Map — fills remaining height */}
      <div className="flex-1 relative">
        <MapClient posts={posts} />

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow text-xs space-y-1.5">
          <div className="font-semibold text-slate-700 mb-2">Legend</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f97316] border border-white shadow-sm" />
            <span className="text-slate-600">Journal post</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#166534]" />
            <span className="text-slate-600">Alaska stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0d9488]" />
            <span className="text-slate-600">Hawaiʻi stop</span>
          </div>
        </div>
      </div>
    </div>
  );
}
