'use client';

import dynamic from 'next/dynamic';
import { Post } from '@/types';

const TravelMap = dynamic(() => import('./TravelMap'), { ssr: false });

interface Props {
  posts: Post[];
}

export default function MapClient({ posts }: Props) {
  return <TravelMap posts={posts} />;
}
