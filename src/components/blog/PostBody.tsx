import { Media } from '@/types';

interface Props {
  body: string | null;
  media: Media[];
}

export default function PostBody({ body, media }: Props) {
  const images = media.filter((m) => m.media_type === 'image');
  const videos = media.filter((m) => m.media_type === 'video');

  return (
    <div>
      {body && (
        <div className="prose prose-slate max-w-none mb-8">
          {body.split('\n').map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i} className="mb-4 text-slate-700 leading-relaxed">
                {paragraph}
              </p>
            ) : null
          )}
        </div>
      )}

      {/* Images grid */}
      {images.length > 0 && (
        <div
          className={
            images.length === 1
              ? 'mb-6'
              : images.length === 2
              ? 'grid grid-cols-2 gap-2 mb-6'
              : 'grid grid-cols-2 md:grid-cols-3 gap-2 mb-6'
          }
        >
          {images.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-xl bg-slate-100">
              <img
                src={img.r2_url}
                alt={img.file_name || 'Travel photo'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Videos */}
      {videos.map((video) => (
        <div key={video.id} className="mb-6 rounded-xl overflow-hidden bg-black">
          <video
            src={video.r2_url}
            controls
            preload="metadata"
            className="w-full max-h-[500px]"
          />
        </div>
      ))}
    </div>
  );
}
