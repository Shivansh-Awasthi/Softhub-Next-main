/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    // Add headers to allow access to sitemap and robots.txt
    async headers() {
        return [
            {
                source: '/sitemap.xml',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/xml',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=43200',
                    },
                ],
            },
            {
                source: '/sitemapindex.xml',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/xml',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=43200',
                    },
                ],
            },
            {
                source: '/robots.txt',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'text/plain',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=43200',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
