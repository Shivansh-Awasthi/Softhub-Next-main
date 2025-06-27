import { Suspense } from 'react';
import SingleApp from '@/app/download/[platform]/[title]/[id]/SingleApp';
import LoadingSkeleton from './LoadingSkeleton';
import { cookies } from 'next/headers';

// Set a short revalidation time to keep data fresh but allow caching
export const revalidate = 300; // 5 minutes

export async function generateMetadata({ params }) {
    try {
        // Properly await params before accessing its properties
        const paramsData = await params;
        const { platform, title, id } = paramsData;
        const appData = await fetchAppData(id);

        return {
            title: `${appData.title || title} - Download for ${appData.platform || platform}`,
            description: appData.description ?
                appData.description.substring(0, 160) :
                `Download ${title} for ${platform} - Free and safe download`,
            openGraph: {
                title: `${appData.title || title} - Download for ${appData.platform || platform}`,
                description: appData.description ?
                    appData.description.substring(0, 160) :
                    `Download ${title} for ${platform} - Free and safe download`,
                images: appData.thumbnail && appData.thumbnail.length > 0 ?
                    [{ url: appData.thumbnail[0] }] :
                    [],
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        // Use the awaited params here too
        return {
            title: `Download ${paramsData.title} for ${paramsData.platform}`,
            description: 'Download games and software for various platforms',
        };
    }
}


async function fetchAppData(id) {
    const token = cookies().get('token')?.value; // JWT from cookies
    const headers = {
        'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Try fetching from protected route first
    const protectedRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/apps/get/${id}/protected`,
        {
            headers,
            cache: 'no-store' // make sure this is fresh
        }
    );

    if (protectedRes.ok) {
        const protectedData = await protectedRes.json();
        return protectedData.app || {};
    }

    // Fallback to public route
    const publicRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/apps/get/${id}`,
        {
            headers,
            next: { revalidate: 300 }
        }
    );

    if (!publicRes.ok) {
        throw new Error(`Failed to fetch app data: ${publicRes.status}`);
    }

    const publicData = await publicRes.json();
    return publicData.app || {};
}


// This component fetches data and renders the SingleApp
async function AppDataFetcher({ id }) {
    const appData = await fetchAppData(id);

    return <SingleApp appData={appData} />;
}

export default async function DownloadPage({ params }) {
    // Properly await params before accessing its properties
    const paramsData = await params;
    const { id } = paramsData;

    return (
        <div className="min-h-screen text-white">
            <Suspense fallback={<LoadingSkeleton />}>
                <AppDataFetcher id={id} />
            </Suspense>
        </div>
    );
}
