"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const PlayerComponent = dynamic(() => import('../components/PlayPodcast'), {
  suspense: true,
});

export default function PlayerPage() {  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerComponent />
    </Suspense>
  );
}
