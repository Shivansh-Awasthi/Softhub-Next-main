// app/android/software/page.jsx

import { Suspense } from 'react';
import AndroidSoftwares from "./AndroidSoftwares";
import CategorySkeleton from "@/app/category/CategorySkeleton";

// Set revalidation time to 1 hour (3600 seconds)
export const revalidate = 3600;

// Generate static pages for the first 5 pages
export async function generateStaticParams() {
    return [
        { page: '1' },
        { page: '2' },
        { page: '3' },
        { page: '4' },
        { page: '5' },
    ];
}

export const metadata = {
    title: 'Android Software - ToxicGames',
    description: 'Download free Android software and applications',
};

// Helper: Build query string from searchParams
function buildQueryString(searchParams, currentPage, itemsPerPage) {
    const params = new URLSearchParams();
    params.set('page', currentPage);
    params.set('limit', itemsPerPage);
    if (searchParams?.tags) params.set('tags', searchParams.tags);
    if (searchParams?.gameMode) params.set('gameMode', searchParams.gameMode);
    if (searchParams?.sizeLimit) params.set('sizeLimit', searchParams.sizeLimit);
    if (searchParams?.releaseYear) params.set('releaseYear', searchParams.releaseYear);
    if (searchParams?.sortBy) params.set('sortBy', searchParams.sortBy);
    return params.toString();
}

// This component fetches data with a timeout to prevent long waits
async function AndroidSoftwaresLoader({ searchParams, currentPage, itemsPerPage }) {
    try {
        // Create a promise that rejects after 5 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out')), 5000);
        });

        const queryString = buildQueryString(searchParams, currentPage, itemsPerPage);
        // Create the fetch promise
        const fetchPromise = fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/sandroid?${queryString}`,
            {
                headers: {
                    'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                },
                // Use next.js cache with revalidation
                next: { revalidate: 3600 }
            }
        );

        // Race the fetch against the timeout
        const res = await Promise.race([fetchPromise, timeoutPromise]);

        if (!res.ok) {
            console.error(`API error: ${res.status} ${res.statusText}`);
            throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        return <AndroidSoftwares serverData={data} initialPage={currentPage} />;
    } catch (error) {
        console.error("Error fetching data:", error);
        // Return component with error state
        return <AndroidSoftwares serverData={{ apps: [], total: 0, error: error.message }} initialPage={currentPage} />;
    }
}

export default async function AndroidSoftwaresPage({ searchParams }) {
    const currentPage = parseInt(searchParams?.page || '1', 10);
    const itemsPerPage = 48;

    return (
        <Suspense fallback={<CategorySkeleton itemCount={16} platform="Android" />}>
            <AndroidSoftwaresLoader searchParams={searchParams} currentPage={currentPage} itemsPerPage={itemsPerPage} />
        </Suspense>
    );
}
