// app/mac/games/page.jsx

import { Suspense } from 'react';
import MacGames from "./MacGames";
import CategorySkeleton from "@/app/category/CategorySkeleton";

// Set revalidation time to 1 hour (3600 seconds)
export const revalidate = 3600;

// Generate static pages for the first 5 pages
export async function generateStaticParams() {
    // For search params, we don't need to generate static params
    // as Next.js will handle the search params dynamically
    return [];
}

export const metadata = {
    title: 'Mac Games - ToxicGames',
    description: 'Download free Mac games and apps',
};

// This component fetches data and renders the MacGames component
async function MacGamesLoader({ currentPage, itemsPerPage }) {
    try {
        // Ensure currentPage is a valid number
        const page = isNaN(currentPage) ? 1 : currentPage;

        // This fetch happens at build time and during revalidation
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/mac?page=${page}&limit=${itemsPerPage}`,
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
        return <MacGames serverData={data} initialPage={page} />;
    } catch (error) {
        console.error("Error fetching data:", error);
        // Return component with error state
        return <MacGames serverData={{ apps: [], total: 0, error: error.message }} initialPage={1} />;
    }
}

export default async function MacGamesPage({ searchParams }) {
    const currentPage = parseInt(searchParams?.page || '1', 10);
    const itemsPerPage = 48;

    return (
        <Suspense fallback={<CategorySkeleton itemCount={16} platform="Mac" />}>
            <MacGamesLoader currentPage={currentPage} itemsPerPage={itemsPerPage} />
        </Suspense>
    );
}
