import { Suspense } from 'react';
import Dmca from './Dmca';
export const metadata = {
  title: 'Copyright Holders (DMCA) - ToxicGames',
  description: 'Information for copyright holders and DMCA takedown requests',
};

export default function DmcaPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <div className="container mx-auto px-4 py-8">
        <Dmca />
      </div>
    </Suspense>
  );
}
