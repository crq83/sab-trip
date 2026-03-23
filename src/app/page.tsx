import Link from 'next/link';
import { MapPin, BookOpen, Map, Image, Calendar, ArrowRight } from 'lucide-react';
import { createAnonClient } from '@/lib/supabase/server';
import PostCard from '@/components/blog/PostCard';
import { Post, Media } from '@/types';

export const revalidate = 60;

async function getRecentPosts(): Promise<Post[]> {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from('posts')
      .select('*, media(*)')
      .eq('status', 'published')
      .order('post_date', { ascending: false })
      .limit(3);
    return (data as (Post & { media: Media[] })[]) || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const recentPosts = await getRecentPosts();

  const navCards = [
    {
      href: '/itinerary',
      icon: Calendar,
      label: 'Itinerary',
      description: 'Full trip plan: Alaska & Hawaii stops',
      color: 'from-[#2d5016] to-[#3d6b1e]',
    },
    {
      href: '/map',
      icon: Map,
      label: 'Map',
      description: 'Every post & photo on the map',
      color: 'from-[#0369a1] to-[#0ea5e9]',
    },
    {
      href: '/blog',
      icon: BookOpen,
      label: 'Journal',
      description: 'Field notes from the road',
      color: 'from-[#92400e] to-[#d97706]',
    },
    {
      href: '/gallery',
      icon: Image,
      label: 'Gallery',
      description: 'Photos & videos from the trip',
      color: 'from-[#581c87] to-[#9333ea]',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[#1e293b] topo-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b]/60 via-transparent to-[#1e293b]/80" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            <MapPin className="w-3 h-3" />
            Apr 8 – May 2, 2026
          </div>

          <h1 className="font-display text-6xl md:text-8xl text-white tracking-widest mb-4 uppercase">
            Alaska
            <span className="text-amber-400"> · </span>
            Hawaii
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-8">
            A month of glaciers, powder days, sea kayaks, and Pacific sunsets.
            Follow along in real time.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#1e293b] font-semibold px-6 py-3 rounded-lg transition-colors text-sm tracking-wide"
            >
              <Map className="w-4 h-4" />
              View the Map
            </Link>
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg transition-colors text-sm tracking-wide"
            >
              <Calendar className="w-4 h-4" />
              See the Itinerary
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z"
              fill="#faf7f2"
            />
          </svg>
        </div>
      </section>

      {/* Quick nav cards */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {navCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-xl p-5 text-white"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <card.icon className="w-6 h-6 mb-3 opacity-80" />
                <div className="font-display text-xl tracking-wide uppercase">{card.label}</div>
                <p className="text-xs text-white/70 mt-1 leading-snug">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-3xl text-[#1e293b] tracking-wide uppercase">
              Latest from the Field
            </h2>
            <Link
              href="/blog"
              className="flex items-center gap-1 text-sm text-[#2d5016] hover:text-[#3d6b1e] font-medium"
            >
              All posts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state — shown before trip begins */}
      {recentPosts.length === 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-16 text-center">
          <div className="bg-white rounded-2xl border border-stone-200 p-12">
            <Calendar className="w-12 h-12 text-[#2d5016]/30 mx-auto mb-4" />
            <h2 className="font-display text-2xl text-[#1e293b] mb-2 uppercase">
              Trip Starts Apr 8
            </h2>
            <p className="text-stone-500 text-sm">
              Posts will appear here once the adventure begins. Check the itinerary to see
              what&apos;s planned.
            </p>
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-2 mt-6 bg-[#2d5016] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d6b1e] transition-colors"
            >
              View Itinerary <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
