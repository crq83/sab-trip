import { createAnonClient } from '@/lib/supabase/server';
import PostCard from '@/components/blog/PostCard';
import CreatePostButton from '@/components/admin/CreatePostButton';
import { getAuthState } from '@/lib/auth';
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
  const [posts, { isAdmin }] = await Promise.all([getPosts(), getAuthState()]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-5xl font-bold text-[#0f172a] mb-1">
            Journal
          </h1>
          <p className="text-slate-500 text-sm">
            {posts.length > 0
              ? `${posts.length} post${posts.length !== 1 ? 's' : ''} from the field`
              : 'Posts will appear here once the trip begins'}
          </p>
        </div>
        {isAdmin && <CreatePostButton />}
      </div>

      {posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">No posts yet — check back once the trip starts!</p>
        </div>
      )}
    </div>
  );
}
