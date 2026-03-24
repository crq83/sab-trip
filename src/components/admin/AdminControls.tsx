'use client';

import { useState } from 'react';
import { Post } from '@/types';
import EditPostModal from './EditPostModal';
import DeletePostButton from './DeletePostButton';

interface Props {
  post: Post;
}

export default function AdminControls({ post }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Admin</span>
        <div className="flex-1" />
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

      {editOpen && (
        <EditPostModal post={post} onClose={() => setEditOpen(false)} />
      )}
    </>
  );
}
