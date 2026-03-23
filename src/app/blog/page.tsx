import { createAnonClient } from '@/lib/supabase/server';
import PostCard from '@/components/blog/PostCard';
import { Post, Media } from '@/types';
import { BookOpen } from 'lucide-react';

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

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-5xl text-[#1e293b] tracking-widest uppercase mb-1">
          Journal
        </h1>
        <p className="text-stone-500 text-sm">
          {posts.length > 0
            ? `${posts.length} post${posts.length !== 1 ? 's' : ''} from the field`
            : 'Posts will appear here once the trip begins'}
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-400 text-sm">No posts yet — check back once the trip starts!</p>
        </div>
      )}
    </div>
  );
}
