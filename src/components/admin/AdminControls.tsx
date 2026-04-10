'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import EditPostModal from './EditPostModal';
import DeletePostButton from './DeletePostButton';

interface Props {
  post: Post;
}

// Compress an image client-side to max 2048px JPEG at 85% quality.
// This mirrors the server-side sharp processing and keeps each file well
// under Vercel's 4.5 MB serverless request-body limit.
// Falls back to the original file if the browser cannot decode it (e.g. HEIC
// on non-Safari browsers).
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 2048;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const name = file.name.replace(/\.[^.]+$/, '.jpg');
          resolve(new File([blob], name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fall back to original
    };
    img.src = url;
  });
}

export default function AdminControls({ post }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setUploadError('');

    // Compress images client-side before upload to stay within Vercel's
    // 4.5 MB serverless payload limit (mobile photos are often 5–15 MB raw).
    const processedFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        processedFiles.push(await compressImage(file));
      } else {
        processedFiles.push(file);
      }
    }

    const formData = new FormData();
    formData.append('slug', post.slug);
    for (const file of processedFiles) {
      formData.append('files', file);
    }

    try {
      const res = await fetch(`/api/posts/${post.id}/media`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setUploadError(data.error ?? 'Upload failed.');
      } else {
        router.refresh();
      }
    } catch {
      setUploadError('Upload failed. Try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Admin</span>
          <div className="flex-1" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {uploading ? 'Uploading…' : 'Add Photos'}
          </button>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit
          </button>
          <DeletePostButton postId={post.id} />
        </div>
        {uploadError && (
          <p className="mt-2 text-sm text-red-500 px-1">{uploadError}</p>
        )}
      </div>

      {editOpen && (
        <EditPostModal post={post} onClose={() => setEditOpen(false)} />
      )}
    </>
  );
}
