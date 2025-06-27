// src/app/components/GlobalHeader/page.jsx
import { Suspense } from 'react';
import LiveSearchWrapper from '../LiveSearch/LiveSearchWrapper';

export default async function GlobalHeader() {
  return (
    <Suspense fallback={<div className="w-full h-12 bg-[#242424] rounded-lg animate-pulse"></div>}>
      <LiveSearchWrapper />
    </Suspense>
  );
}
