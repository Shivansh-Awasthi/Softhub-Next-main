import { Suspense } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sitemap - ToxicGames',
  description: 'Sitemap for ToxicGames website',
};

// This component displays the sitemap information
export default function SitemapPage() {
  return (
    <Suspense fallback={<div>Loading sitemap...</div>}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#262626] rounded-xl p-6 ring-2 ring-[#2E2E2E] text-gray-200">
          <h1 className="text-3xl font-bold mb-6">Sitemap</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Main Sitemaps</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Link href="/sitemapindex.xml" target="_blank" className="text-blue-400 hover:underline">
                  Main Sitemap Index
                </Link> - Contains references to all sitemaps
              </li>
              <li>
                <Link href="/sitemap.xml" target="_blank" className="text-blue-400 hover:underline">
                  Frontend Sitemap
                </Link> - Contains all static routes of the website
              </li>
              <li>
                <Link href="https://backend.toxicgames.in/sitemap.xml" target="_blank" className="text-blue-400 hover:underline">
                  Backend Sitemap
                </Link> - Contains all dynamic content pages
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Main Categories</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><Link href="/category/mac/games" className="text-blue-400 hover:underline">Mac Games</Link></li>
              <li><Link href="/category/mac/games/exclusive" className="text-blue-400 hover:underline">Mac Premium Games</Link></li>
              <li><Link href="/category/mac/softwares" className="text-blue-400 hover:underline">Mac Software</Link></li>
              <li><Link href="/category/pc/games" className="text-blue-400 hover:underline">PC Games</Link></li>
              <li><Link href="/category/pc/softwares" className="text-blue-400 hover:underline">PC Software</Link></li>
              <li><Link href="/category/android/games" className="text-blue-400 hover:underline">Android Games</Link></li>
              <li><Link href="/category/android/softwares" className="text-blue-400 hover:underline">Android Software</Link></li>
              <li><Link href="/category/ps2/iso" className="text-blue-400 hover:underline">PS2 ISO Games</Link></li>
              <li><Link href="/category/ps3/iso" className="text-blue-400 hover:underline">PS3 ISO Games</Link></li>
              <li><Link href="/category/ps4/iso" className="text-blue-400 hover:underline">PS4 ISO Games</Link></li>
              <li><Link href="/category/ppsspp/iso" className="text-blue-400 hover:underline">PPSSPP ISO Games</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Other Pages</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><Link href="/faq" className="text-blue-400 hover:underline">FAQ</Link></li>
              <li><Link href="/copyright-holders" className="text-blue-400 hover:underline">Copyright Holders (DMCA)</Link></li>
              <li><Link href="/contacts" className="text-blue-400 hover:underline">Contacts</Link></li>
              <li><Link href="/policy" className="text-blue-400 hover:underline">Privacy Policy</Link></li>
              <li><Link href="/donate" className="text-blue-400 hover:underline">Donate</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
