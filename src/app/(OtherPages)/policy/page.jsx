import { Suspense } from 'react';
import Policy from './Policy';

export const metadata = {
  title: 'Privacy Policy - ToxicGames',
  description: 'Privacy Policy and Terms of Service for ToxicGames',
};

export default function PolicyPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <div className="container mx-auto px-4 py-8">
        <Policy />
      </div>
    </Suspense>
  );
}
