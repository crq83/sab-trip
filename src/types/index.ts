export interface Post {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  status: string;
  lat: number | null;
  lng: number | null;
  location_name: string | null;
  email_message_id: string | null;
  email_from: string | null;
  post_date: string;
  created_at: string;
  media?: Media[];
}

export interface Media {
  id: string;
  post_id: string;
  r2_key: string;
  r2_url: string;
  media_type: 'image' | 'video';
  mime_type: string;
  file_name: string | null;
  file_size_bytes: number | null;
  exif_lat: number | null;
  exif_lng: number | null;
  exif_taken_at: string | null;
  sort_order: number;
  created_at: string;
}
