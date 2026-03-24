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
      color: 'from-[#166534] to-[#15803d]',
    },
    {
      href: '/map',
      icon: Map,
      label: 'Map',
      description: 'Every post & photo on the map',
      color: 'from-[#0d9488] to-[#0f766e]',
    },
    {
      href: '/blog',
      icon: BookOpen,
      label: 'Journal',
      description: 'Field notes from the road',
      color: 'from-[#ea580c] to-[#f97316]',
    },
    {
      href: '/gallery',
      icon: Image,
      label: 'Gallery',
      description: 'Photos & videos from the trip',
      color: 'from-[#7c3aed] to-[#a855f7]',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-[#0f172a] topo-bg wave-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/70 via-transparent to-[#0f172a]/85" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#f97316]/20 border border-[#f97316]/30 text-[#f97316] text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            <MapPin className="w-3 h-3" />
            Apr 8 – May 2, 2026
          </div>

          <h1 className="font-display text-7xl md:text-9xl font-bold text-white mb-4">
            Alaska
            <span className="text-[#f97316]"> · </span>
            Hawaii
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-8">
            A month of glaciers, powder days, sea kayaks, and Pacific sunsets.
            Follow along in real time.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm tracking-wide shadow-lg shadow-[#f97316]/20"
            >
              <Map className="w-4 h-4" />
              View the Map
            </Link>
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl transition-colors text-sm tracking-wide"
            >
              <Calendar className="w-4 h-4" />
              See the Itinerary
            </Link>
          </div>
        </div>

        {/* Layered mountain silhouette */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            {/* Far ridge */}
            <path
              d="M0 200L0 130 L120 70 L240 110 L360 40 L480 100 L600 30 L720 90 L840 20 L960 80 L1080 45 L1200 95 L1320 55 L1440 100 L1440 200Z"
              fill="#0f172a"
              fillOpacity="0.45"
            />
            {/* Mid ridge — alpine green */}
            <path
              d="M0 200L0 160 L100 110 L200 145 L320 95 L440 135 L560 85 L680 125 L800 80 L920 120 L1040 100 L1160 135 L1280 110 L1440 145 L1440 200Z"
              fill="#166534"
              fillOpacity="0.3"
            />
            {/* Near ridge — fills to page background */}
            <path
              d="M0 200L0 175 L80 158 L200 172 L320 150 L440 170 L560 145 L680 168 L800 148 L920 170 L1040 152 L1160 172 L1280 158 L1440 172 L1440 200Z"
              fill="#f8fafc"
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
              className="group relative overflow-hidden rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-shadow"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <card.icon className="w-6 h-6 mb-3 opacity-80" />
                <div className="font-display text-xl font-bold">{card.label}</div>
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
            <h2 className="font-display text-3xl font-bold text-[#0f172a]">
              Latest from the Field
            </h2>
            <Link
              href="/blog"
              className="flex items-center gap-1 text-sm text-[#166534] hover:text-[#15803d] font-medium"
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
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12">
            <Calendar className="w-12 h-12 text-[#166534]/30 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-[#0f172a] mb-2">
              Trip Starts Apr 8
            </h2>
            <p className="text-slate-500 text-sm">
              Posts will appear here once the adventure begins. Check the itinerary to see
              what&apos;s planned.
            </p>
            <Link
              href="/itinerary"
              className="inline-flex items-center gap-2 mt-6 bg-[#166534] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#15803d] transition-colors"
            >
              View Itinerary <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
