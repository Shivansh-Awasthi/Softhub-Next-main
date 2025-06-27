// src/app/search/page.jsx
import { Suspense } from 'react';
import SearchResults from './SearchResults';
import SearchSkeleton from './SearchSkeleton';

export const metadata = {
  title: 'Search Results - ToxicGames',
  description: 'Search for games and software across multiple platforms',
};

// Server-side data fetching with timeout
async function fetchSearchResults(query, page = 1, limit = 48) {
  if (!query) {
    return { apps: [], total: 0 };
  }

  try {
    // Create a promise that rejects after 5 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Search request timed out')), 5000);
    });

    // Create the fetch promise
    const fetchPromise = fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/apps/all?page=${page}&limit=${limit}&q=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
        },
        cache: 'no-store' // Ensure fresh data
      }
    );

    // Race the fetch against the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? { apps: data.apps, total: data.total } : { apps: [], total: 0 };
  } catch (error) {
    console.error("Error fetching search results:", error);
    return { apps: [], total: 0, error: error.message };
  }
}

// This component fetches data and renders the SearchResults
async function SearchDataLoader({ searchParams }) {
  // Await searchParams to properly access its properties
  const params = await searchParams;

  // Handle searchParams safely
  const query = params?.query || '';
  const page = parseInt(params?.page || '1', 10);
  // Get timestamp to ensure cache busting (ignored in actual data fetching)
  const timestamp = params?.t || Date.now();

  // Fetch initial data on the server
  const initialData = await fetchSearchResults(query, page);

  return <SearchResults
    initialData={initialData}
    initialQuery={query}
    initialPage={page}
    timestamp={timestamp}
  />;
}

export default function SearchPage({ searchParams }) {
  return (
    <Suspense fallback={<SearchSkeleton itemCount={12} />}>
      <SearchDataLoader searchParams={searchParams} />
    </Suspense>
  );
}
