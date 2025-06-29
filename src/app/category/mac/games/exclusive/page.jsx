// app/category/ps4/iso/page.jsx

import Ps4Iso from "./Ps4Iso";

// Helper to build query string from search params
function buildQueryString(searchParams) {
    const params = new URLSearchParams();
    const allowed = ["tags", "gameMode", "sizeLimit", "releaseYear", "sortBy", "page"];
    for (const key of allowed) {
        const value = searchParams?.[key] || null;
        if (value) params.set(key, value);
    }
    return params.toString();
}

export default async function Page({ searchParams }) {
    // Forward all filters and pagination to backend
    const queryString = buildQueryString(searchParams);
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/ps4?${queryString}`;
    const res = await fetch(apiUrl, {
        headers: {
            'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
        },
        cache: 'no-store',
    });
    const serverData = await res.json();
    return <Ps4Iso serverData={serverData} initialPage={parseInt(searchParams?.page || '1', 10)} />;
}
