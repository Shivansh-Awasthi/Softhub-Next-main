// app/category/ppsspp/iso/page.jsx

import { Suspense } from 'react';
import PpssppIso from "./PpssppIso";
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
    title: 'PPSSPP ISO Games - ToxicGames',
    description: 'Download free PSP ISO games for PPSSPP emulator',
};

// This component fetches data with a timeout to prevent long waits
async function PpssppIsoLoader({ currentPage, itemsPerPage }) {
    try {
        // Check if we're in a build environment (no actual API call needed)
        if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
            console.log('Building PPSSPP ISO page with mock data');
            // Return mock data during build to prevent 404 errors
            return <PpssppIso
                serverData={{
                    apps: [],
                    total: 0,
                    success: true,
                    message: "Mock data for build"
                }}
                initialPage={currentPage}
            />;
        }

        // Create a promise that rejects after 5 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out')), 5000);
        });

        // Create the fetch promise
        const fetchPromise = fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/ppsspp?page=${currentPage}&limit=${itemsPerPage}`,
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
            // Instead of throwing, return empty data
            return <PpssppIso
                serverData={{
                    apps: [],
                    total: 0,
                    error: `API error: ${res.status}`,
                    success: false
                }}
                initialPage={currentPage}
            />;
        }

        const data = await res.json();
        return <PpssppIso serverData={data} initialPage={currentPage} />;
    } catch (error) {
        console.error("Error fetching data:", error);
        // Return component with error state
        return <PpssppIso
            serverData={{
                apps: [],
                total: 0,
                error: error.message,
                success: false
            }}
            initialPage={currentPage}
        />;
    }
}

export default async function PpssppIsoPage({ searchParams }) {
    const currentPage = parseInt(searchParams?.page || '1', 10);
    const itemsPerPage = 48;

    return (
        <Suspense fallback={<CategorySkeleton itemCount={16} platform="PPSSPP" />}>
            <PpssppIsoLoader currentPage={currentPage} itemsPerPage={itemsPerPage} />
        </Suspense>
    );
}
