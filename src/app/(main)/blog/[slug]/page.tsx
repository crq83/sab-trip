import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { createAnonClient } from '@/lib/supabase/server';
import PostBody from '@/components/blog/PostBody';
import AdminControls from '@/components/admin/AdminControls';
import { getAuthState } from '@/lib/auth';
import { Post, Media } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('posts')
      .select('*, media(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    return data as (Post & { media: Media[] }) | null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Not Found' };

  const coverMedia = post.media?.find((m) => m.media_type === 'image');
  return {
    title: `${post.title} — AK · HI 2026`,
    description: post.body?.slice(0, 160) || undefined,
    openGraph: {
      images: coverMedia ? [coverMedia.r2_url] : ['/og-default.jpg'],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, { isAdmin }] = await Promise.all([getPost(slug), getAuthState()]);
  if (!post) notFound();

  const date = new Date(post.post_date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const coverImage = post.media?.find((m) => m.media_type === 'image');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#166534] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All posts
      </Link>

      {/* Hero image */}
      {coverImage && (
        <div className="rounded-3xl overflow-hidden mb-8 aspect-video bg-slate-100">
          <img
            src={coverImage.r2_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && <AdminControls post={post} />}

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#0f172a] leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <time>{date}</time>
          </div>
          {post.location_name && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#f97316]" />
              <span>{post.location_name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <PostBody body={post.body} media={post.media || []} />
    </div>
  );
}
