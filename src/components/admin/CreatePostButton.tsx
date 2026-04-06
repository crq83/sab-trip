'use client';

import { useState } from 'react';
import { PenSquare } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

export default function CreatePostButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#f97316] hover:bg-[#ea6f0e] rounded-xl transition-colors"
      >
        <PenSquare className="w-4 h-4" />
        New Post
      </button>
      {open && <CreatePostModal onClose={() => setOpen(false)} />}
    </>
  );
}
