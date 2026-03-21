'use client';

import { useEffect, useRef } from 'react';
import { blogApi } from '@/lib/api/blog';

interface ViewTrackerProps {
  postId: number;
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      // Increment view count
      blogApi.incrementView(postId).catch((err) => {
        console.error('Failed to increment view count:', err);
      });
    }
  }, [postId]);

  return null;
}
