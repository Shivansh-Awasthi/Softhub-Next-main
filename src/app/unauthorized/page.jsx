import Link from 'next/link';
import { Suspense } from 'react';
export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>

      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Access Denied</h2>
          <p className="mb-6">You don't have permission to access the requested page.</p>
          <Link
            href="/"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-block"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </Suspense>
  );
}