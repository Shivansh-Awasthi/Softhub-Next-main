// app/category/ps3/iso/page.jsx

import { Suspense } from 'react';
import Ps3Iso from "./Ps3Iso";
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
    title: 'PS3 ISO Games - ToxicGames',
    description: 'Download free PlayStation 3 ISO games',
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

// This component fetches data and renders the Ps3Iso component
async function Ps3IsoLoader({ currentPage, itemsPerPage, searchParams }) {
    try {
        const queryString = buildQueryString(searchParams, currentPage, itemsPerPage);
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/ps3?${queryString}`,
            {
                headers: {
                    'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                },
                // Use next.js cache with revalidation
                next: { revalidate: 3600 }
            }
        );

        if (!res.ok) {
            console.error(`API error: ${res.status} ${res.statusText}`);
            throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        return <Ps3Iso serverData={data} initialPage={currentPage} />;
    } catch (error) {
        console.error("Error fetching data:", error);
        // Return component with error state
        return <Ps3Iso serverData={{ apps: [], total: 0, error: error.message }} initialPage={currentPage} />;
    }
}

export default async function Ps3IsoPage({ searchParams }) {
    const currentPage = parseInt(searchParams?.page || '1', 10);
    const itemsPerPage = 48;

    return (
        <Suspense fallback={<CategorySkeleton itemCount={16} platform="PS3" />}>
            <Ps3IsoLoader currentPage={currentPage} itemsPerPage={itemsPerPage} searchParams={searchParams} />
        </Suspense>
    );
}