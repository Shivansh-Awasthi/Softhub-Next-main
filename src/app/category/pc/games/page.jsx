// app/category/pc/games/page.jsx

import { Suspense } from 'react';
import PcGames from "./PcGames";
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
    title: 'PC Games - ToxicGames',
    description: 'Download free PC games and apps',
};

// This component fetches data and renders the PcGames component
async function PcGamesLoader({ currentPage, itemsPerPage }) {
    try {
        // This fetch happens at build time and during revalidation
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/pc?page=${currentPage}&limit=${itemsPerPage}`,
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
        return <PcGames serverData={data} initialPage={currentPage} />;
    } catch (error) {
        console.error("Error fetching data:", error);
        // Return component with error state
        return <PcGames serverData={{ apps: [], total: 0, error: error.message }} initialPage={currentPage} />;
    }
}


export default async function PcGamesPage({ searchParams }) {
    const currentPage = parseInt(searchParams?.page || '1', 10);
    const itemsPerPage = 48;

    return (
        <Suspense fallback={<CategorySkeleton itemCount={16} platform="PC" />}>
            <PcGamesLoader currentPage={currentPage} itemsPerPage={itemsPerPage} />
        </Suspense>
    );
}

