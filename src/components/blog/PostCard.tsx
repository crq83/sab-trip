import Link from 'next/link';
import { MapPin, Camera, Video, FileText, User } from 'lucide-react';
import { Post } from '@/types';
import { resolveSenderName } from '@/lib/sender-names';

interface Props {
  post: Post;
}

export default function PostCard({ post }: Props) {
  const authorName = resolveSenderName(post.email_from);
  const coverMedia = post.media?.find((m) => m.media_type === 'image');
  const hasVideo = post.media?.some((m) => m.media_type === 'video');
  const mediaCount = post.media?.length ?? 0;

  const date = new Date(post.post_date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
        {/* Cover image */}
        {coverMedia ? (
          <div className="aspect-video overflow-hidden bg-slate-100">
            <img
              src={coverMedia.r2_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-[#166534]/20 to-[#0d9488]/20 flex items-center justify-center">
            <FileText className="w-8 h-8 text-[#166534]/40" />
          </div>
        )}

        <div className="p-4">
          {/* Meta row */}
          <div className="flex items-center justify-between mb-2">
            <time className="text-xs text-slate-400 font-medium">{date}</time>
            <div className="flex items-center gap-2">
              {mediaCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  {hasVideo ? (
                    <Video className="w-3 h-3" />
                  ) : (
                    <Camera className="w-3 h-3" />
                  )}
                  {mediaCount}
                </span>
              )}
            </div>
          </div>

          <h2 className="font-display text-lg font-semibold leading-tight text-[#0f172a] group-hover:text-[#166534] transition-colors mb-1">
            {post.title}
          </h2>

          {post.location_name && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-[#f97316] shrink-0" />
              <span className="text-xs text-slate-500 truncate">{post.location_name}</span>
            </div>
          )}

          {authorName && (
            <div className="flex items-center gap-1 mt-1">
              <User className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-400">{authorName}</span>
            </div>
          )}

          {post.body && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{post.body}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
