'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FaApple, FaDownload, FaLock, FaStar, FaCoffee } from "react-icons/fa";
import { FaCrown } from "react-icons/fa";
import { FaRupeeSign } from "react-icons/fa";
import { useLoading } from '@/app/context/LoadingContext';
import EnhancedPagination from '@/app/components/Pagination/EnhancedPagination';

// Utility function to create URL-friendly slugs
function createSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
}

export default function Ps4Iso({ serverData, initialPage = 1 }) {
    // Configuration
    const ITEMS_PER_PAGE = 48;

    // Hooks for URL and navigation
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { showSkeleton } = useLoading();

    // Extract data from server response
    const extractData = (data) => {
        if (data?.apps && Array.isArray(data.apps)) {
            return {
                games: data.apps,
                total: data.total || 0
            };
        }
        if (data?.data && Array.isArray(data.data)) {
            return {
                games: data.data,
                total: data.total || 0
            };
        }
        return {
            games: [],
            total: 0
        };
    };

    const { games, total } = extractData(serverData);

    // State
    const [data, setData] = useState(games);
    const [totalApps, setTotalApps] = useState(total);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || initialPage.toString(), 10));
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);
    const [error, setError] = useState(serverData?.error || null);
    const [purchasedGames, setPurchasedGames] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userData, setUserData] = useState(null);

    // Calculate total pages
    const totalPages = Math.max(1, Math.ceil(totalApps / ITEMS_PER_PAGE));

    // Update state when props or URL changes
    useEffect(() => {
        // Update data and total from server data
        const { games, total } = extractData(serverData);
        setData(games);
        setTotalApps(total);

        // Update current page from URL
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
        if (pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl);
        }

        // Reset page transition state
        const timer = setTimeout(() => {
            setIsPageTransitioning(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [serverData, searchParams]);

    // Load user data from localStorage on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Read JWT token from localStorage (or cookie if you have that setup)
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setUserData(decoded);
                } catch (err) {
                    console.error('Failed to decode JWT token:', err);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }
        }
    }, []);

    // Fetch data when page changes (client-side)
    useEffect(() => {
        if (currentPage === 1) return; // already have page 1 data from server

        const fetchData = async () => {
            setIsPageTransitioning(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/ps4?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
                    {
                        headers: { 'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN },
                    }
                );

                if (!res.ok) {
                    throw new Error(`API error: ${res.status}`);
                }

                const json = await res.json();

                // Handle API response structure
                const { games, total } = extractData(json);
                setData(games);
                setTotalApps(total);
                setError(null);
            } catch (err) {
                setError('Failed to load data: ' + err.message);
                console.error("Client fetch failed:", err.message);
            } finally {
                setIsPageTransitioning(false);
            }
        };

        fetchData();
    }, [currentPage, ITEMS_PER_PAGE]);

    // Handle page change with improved UX
    const handlePageChange = (newPage) => {
        if (newPage === currentPage || newPage < 1 || newPage > totalPages || isPageTransitioning) {
            return; // Don't do anything if invalid page or already transitioning
        }

        // Set transition state
        setIsPageTransitioning(true);

        // Show skeleton while loading
        showSkeleton('PS4');

        // Update URL - this will trigger a new server-side render
        router.push(`${pathname}?page=${newPage}`);

        // Scroll to top
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Game card component with prefetching
    const GameCard = ({ game = {} }) => {
        const isAdmin = userData?.role === 'ADMIN';
        const purchasedGamesFromToken = userData?.purchasedGames || [];
        const isPurchased = purchasedGamesFromToken.includes(game._id);
        const isUnlocked = isAdmin || !game.isPaid || isPurchased;

        // Always create a valid download URL
        const downloadUrl = `/download/${createSlug(game.platform)}/${createSlug(game.title)}/${game._id}`;

        // Prefetch function to start loading the download page data when hovering
        const prefetchDownloadPage = () => {
            if (isUnlocked) {
                // This triggers Next.js to prefetch the page
                router.prefetch(downloadUrl);
            }
        };

        // For locked games, we'll render a div with the lock icon
        // For unlocked games, we'll render a Link to the download page
        if (!isUnlocked) {
            // Locked game - render div with lock icon
            return (
                <div className="relative flex flex-col rounded-[20px] h-60 overflow-hidden transition-all duration-300 ease-in-out cursor-not-allowed group bg-[#131313] hover:translate-y-[-5px]" style={{ boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.5)' }}>
                    {/* Glass morphism border effect */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-purple-600/30 rounded-[21px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 animate-gradient-x"></div>

                    {/* Ambient background elements - always visible */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                    {/* Subtle overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>

                    {/* Price tag - only visible on hover for locked games */}
                    <div className="absolute top-3 right-3 bg-black/70 px-3 py-1.5 rounded-full z-30 border border-green-500/30 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                        <div className="text-sm font-bold text-green-400 flex items-center">
                            <FaRupeeSign className="mr-1" />{game.price || '499'}
                        </div>
                    </div>

                    {/* Premium badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 rounded-full z-30 shadow-lg flex items-center scale-90 group-hover:scale-100 transition-all duration-300">
                        <FaStar className="mr-1 text-white" size={10} />
                        <span className="text-[10px] font-bold text-white">PREMIUM</span>
                    </div>

                    {/* Main image container - similar to PcGames.jsx */}
                    <figure className="flex justify-center items-center overflow-hidden h-full w-full">
                        <img
                            src={game.coverImg || game.thumbnail?.[0] || '/default-game.png'}
                            alt={game.title || 'Game'}
                            className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out transform group-hover:scale-110 filter brightness-[0.85]"
                            onError={(e) => {
                                e.target.src = '/default-game.png';
                                e.target.alt = 'Default game image';
                            }}
                        />
                    </figure>

                    {/* Lock overlay */}
                    <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center z-20 bg-black/40">
                        <div className="relative group-hover:scale-110 transition-all duration-500">
                            {/* Pulsing glow effect */}
                            <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-md"></div>

                            {/* Lock icon container */}
                            <div className="relative bg-black/70 p-5 rounded-full border border-purple-500/40 shadow-[0_0_15px_rgba(147,51,234,0.2)] group-hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all duration-300">
                                <FaLock className="text-white" size={30} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-full overflow-hidden relative z-10">

                        {/* Game platform badge */}
                        <div className="absolute bottom-[4.5rem] left-3 bg-black/70 px-3 py-1.5 rounded-full z-20 border border-blue-500/30">
                            <div className="text-[10px] font-medium text-blue-400 flex items-center">
                                <FaApple className='mr-1' />
                                Mac Exclusive
                            </div>
                        </div>

                        {/* Info panel with glass morphism */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 border-t border-white/10">
                            <div className="text-sm font-bold text-white pb-2 overflow-hidden whitespace-nowrap text-ellipsis">
                                {game.title || 'Untitled Game'}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-xs font-normal text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    </svg>
                                    {game.size || 'N/A'}
                                </div>
                                <div className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-medium">Locked</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            // Unlocked game - render Link to download page
            return (
                <Link
                    href={downloadUrl}
                    className="block"
                    prefetch={true}
                    onMouseEnter={prefetchDownloadPage}
                >
                    <div className="relative flex flex-col rounded-[20px] h-60 overflow-hidden transition-all duration-300 ease-in-out group bg-[#131313] hover:translate-y-[-5px]" style={{ boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.5)' }}>
                        {/* Glass morphism border effect */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 rounded-[21px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 animate-gradient-x"></div>

                        {/* Ambient background elements - always visible */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                        {/* Subtle overlay gradient for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>

                        {/* Premium badge */}
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 rounded-full z-30 shadow-lg flex items-center scale-90 group-hover:scale-100 transition-all duration-300">
                            <FaStar className="mr-1 text-white" size={10} />
                            <span className="text-[10px] font-bold text-white">PREMIUM</span>
                        </div>

                        {/* Main image container - similar to PcGames.jsx */}
                        <figure className="flex justify-center items-center overflow-hidden h-full w-full">
                            <img
                                src={game.coverImg || game.thumbnail?.[0] || '/default-game.png'}
                                alt={game.title || 'Game'}
                                className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out transform group-hover:scale-110 group-hover:brightness-[0.8]"
                                onError={(e) => {
                                    e.target.src = '/default-game.png';
                                    e.target.alt = 'Default game image';
                                }}
                            />
                        </figure>

                        {/* Download button - only visible on hover */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                            <div className="relative">
                                {/* Pulsing glow effect */}
                                <div className="absolute inset-0 rounded-full bg-blue-600/20 blur-md"></div>

                                {/* Download icon container */}
                                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-5 rounded-full shadow-lg">
                                    <FaDownload className="text-white" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col h-full overflow-hidden relative z-10">

                            {/* Game platform badge */}
                            <div className="absolute bottom-[4.5rem] left-3 bg-black/70 px-3 py-1.5 rounded-full z-20 border border-blue-500/30">
                                <div className="text-[10px] font-medium text-blue-400 flex items-center">
                                    <FaApple className="mr-1" />
                                    Mac Exclusive
                                </div>
                            </div>

                            {/* Info panel with glass morphism */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 border-t border-white/10">
                                <div className="text-sm font-bold text-white pb-2 overflow-hidden whitespace-nowrap text-ellipsis group-hover:text-blue-300 transition-colors duration-300">
                                    {game.title || 'Untitled Game'}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs font-normal text-gray-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-blue-400">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        </svg>
                                        {game.size || 'N/A'}
                                    </div>
                                    <div className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 font-medium">Available</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            );
        }
    };

    // Error state or no games available
    if ((error && !data.length) || (!data.length && !isPageTransitioning)) {
        return (
            <div className="container mx-auto p-2 pb-24 relative">
                {/* Add all the decorative elements from the main render */}
                <style jsx global>{`
                    @keyframes gradient-x {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                        100% { transform: translateY(0px); }
                    }
                    @keyframes pulse-glow {
                        0% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(147, 51, 234, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); }
                    }
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-gradient-x {
                        background-size: 200% 200%;
                        animation: gradient-x 3s ease infinite;
                    }
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                    .animate-pulse-glow {
                        animation: pulse-glow 2s infinite;
                    }
                    .animate-fadeInUp {
                        animation: fadeInUp 0.5s ease-out forwards;
                    }
                `}</style>

                {/* Premium background decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 opacity-5 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 opacity-5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-600 opacity-5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-600 opacity-5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '3s' }}></div>

                {/* Decorative particles */}
                <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 opacity-30 rounded-full -z-10 animate-ping" style={{ animationDuration: '3s' }}></div>
                <div className="absolute top-40 right-40 w-2 h-2 bg-blue-400 opacity-30 rounded-full -z-10 animate-ping" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-60 left-60 w-2 h-2 bg-purple-400 opacity-30 rounded-full -z-10 animate-ping" style={{ animationDuration: '5s' }}></div>
                <div className="absolute bottom-20 right-20 w-2 h-2 bg-blue-400 opacity-30 rounded-full -z-10 animate-ping" style={{ animationDuration: '6s' }}></div>

                {/* Enhanced decorative grid lines */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTMwIDMwaDMwVjBoLTMwdjMwek0wIDMwaDMwdjMwSDB2LTMweiIgZmlsbD0iIzJkMmQyZCIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] bg-center opacity-30 -z-10"></div>

                {/* Premium border frame */}
                <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-purple-500/20 rounded-tl-lg -z-10"></div>
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-blue-500/20 rounded-tr-lg -z-10"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-blue-500/20 rounded-bl-lg -z-10"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-purple-500/20 rounded-br-lg -z-10"></div>

                {/* Premium Header with enhanced styling */}
                <div className="cover mb-16 text-center relative">
                    {/* Background glow effects */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-10 blur-xl -z-10"></div>
                    <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-600/20 rounded-full blur-xl -z-10"></div>
                    <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-600/20 rounded-full blur-xl -z-10"></div>

                    {/* Premium badge - responsive for small screens */}
                    <div className="inline-block mb-4 sm:mb-6">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg flex items-center">
                            <FaStar className="mr-1" size={10} />
                            PREMIUM COLLECTION
                        </div>
                    </div>
                    <br />
                    {/* Main heading with glass effect - responsive for small screens */}
                    <div className="inline-block relative mb-6 max-w-full">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 animate-gradient-x"></div>
                        <div className="relative px-4 sm:px-7 py-4 bg-black/50 rounded-lg leading-none flex flex-col sm:flex-row items-center">
                            <FaCrown className="text-amber-500 mb-2 sm:mb-0 sm:mr-3" size={24} />
                            <div className="text-center sm:text-left">
                                <div className="font-bold text-lg sm:text-2xl md:text-3xl lg:text-4xl">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                        Mac Exclusive Games{' '}
                                        <span className="font-medium text-blue-400">0</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description text - responsive for small screens */}
                    <p className="text-gray-400 max-w-2xl mx-auto mb-6 text-sm sm:text-base md:text-lg px-4 sm:px-0">
                        Exclusive premium Mac games available only to our members. Experience the best gaming titles with enhanced graphics and performance.
                    </p>

                    {/* Contact buttons container */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                        {/* Telegram button */}
                        <a
                            href="https://t.me/n0t_ur_type"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 animate-pulse-glow"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm2.8 14.4c.12 0 .234-.05.318-.134.084-.084.134-.198.134-.318 0-.12-.05-.234-.134-.318-.084-.084-.198-.134-.318-.134H9.2c-.12 0-.234.05-.318.134-.084.084-.134.198-.134.318 0 .12.05.234.134.318.084.084.198.134.318.134h5.6zm-2.8-8.4c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 4.8c-.993 0-1.8-.807-1.8-1.8s.807-1.8 1.8-1.8 1.8.807 1.8 1.8-.807 1.8-1.8 1.8z" />
                            </svg>
                            Buy via Telegram
                        </a>

                        {/* Become a Member button */}
                        <Link
                            href="/membership"
                            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-full shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
                        >
                            <FaCoffee className="mr-2" />
                            Become a Member
                        </Link>
                    </div>

                    {/* Feature badges - responsive for small screens */}
                    <div className="flex flex-wrap justify-center gap-3">
                        <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 text-xs sm:text-sm text-gray-300 flex items-center">
                            <FaStar className="text-amber-500 mr-1 sm:mr-2" size={14} />
                            Premium Quality
                        </div>
                        <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 text-xs sm:text-sm text-gray-300 flex items-center">
                            <FaApple className="text-blue-400 mr-1 sm:mr-2" size={14} />
                            Mac Exclusive
                        </div>
                        <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 text-xs sm:text-sm text-gray-300 flex items-center">
                            <FaDownload className="text-green-400 mr-1 sm:mr-2" size={14} />
                            Easy Download
                        </div>
                    </div>

                    {/* Decorative line */}
                    <div className="absolute -bottom-6 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                </div>

                {/* No games available message */}
                <div className="text-center py-16 bg-gradient-to-r from-purple-900/10 to-blue-900/10 rounded-xl border border-purple-500/20 animate-fadeInUp">
                    <div className="inline-block p-6 rounded-full bg-gradient-to-r from-purple-900/20 to-blue-900/20 mb-6 animate-float">
                        <FaApple className="text-purple-400" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-3">No Exclusive Games Available</h3>
                    <p className="text-gray-400 text-lg max-w-lg mx-auto mb-4">Our exclusive Mac games collection is currently being updated.</p>
                    <p className="text-gray-500 mt-2">Check back soon for premium exclusive content</p>

                    <div className="mt-8 flex justify-center space-x-4">
                        <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 text-sm text-gray-300 flex items-center animate-pulse-glow">
                            <FaStar className="text-amber-500 mr-2" size={14} />
                            Coming Soon
                        </div>
                        <button
                            onClick={() => router.refresh()}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30 text-sm text-gray-300 flex items-center hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="container mx-auto p-2 pb-24 relative">
            {/* Add CSS for animations */}
            <style jsx global>{`
                @keyframes gradient-x {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes float {
                    0% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                    100% {
                        transform: translateY(0px);
                    }
                }

                @keyframes pulse-glow {
                    0% {
                        box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.4);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 3s ease infinite;
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .animate-pulse-glow {
                    animation: pulse-glow 2s infinite;
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
            `}</style>

            {/* Premium background decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 opacity-5 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 opacity-5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-600 opacity-5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-600 opacity-5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '3s' }}></div>

            {/* Decorative particles */}
            <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 opacity-30 rounded-full -z-10 animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-40 right-40 w-2 h-2 bg-blue-400 opacity-30 rounded-full -z-10 animate-ping" style={{ animationDuration: '4s' }}></div>
            <div className="absolute bottom-60 left-60 w-2 h-2 bg-purple-400 opacity-30 rounded-full -z-10 animate-ping" style={{ animationDuration: '5s' }}></div>
            <div className="absolute bottom-20 right-20 w-2 h-2 bg-blue-400 opacity-30 rounded-full -z-10 animate-ping" style={{ animationDuration: '6s' }}></div>

            {/* Enhanced decorative grid lines */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTMwIDMwaDMwVjBoLTMwdjMwek0wIDMwaDMwdjMwSDB2LTMweiIgZmlsbD0iIzJkMmQyZCIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] bg-center opacity-30 -z-10"></div>

            {/* Premium border frame */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-purple-500/20 rounded-tl-lg -z-10"></div>
            <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-blue-500/20 rounded-tr-lg -z-10"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-blue-500/20 rounded-bl-lg -z-10"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-purple-500/20 rounded-br-lg -z-10"></div>

            {/* Premium Header with enhanced styling */}
            <div className="cover mb-16 text-center relative">
                {/* Background glow effects */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-10 blur-xl -z-10"></div>
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-purple-600/20 rounded-full blur-xl -z-10"></div>
                <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-600/20 rounded-full blur-xl -z-10"></div>

                {/* Premium badge - responsive for small screens */}
                <div className="inline-block mb-4 sm:mb-6">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg flex items-center">
                        <FaStar className="mr-1" size={10} />
                        PREMIUM COLLECTION
                    </div>
                </div>
                <br />
                {/* Main heading with glass effect - responsive for small screens */}
                <div className="inline-block relative mb-6 max-w-full">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 animate-gradient-x"></div>
                    <div className="relative px-4 sm:px-7 py-4 bg-black/50 rounded-lg leading-none flex flex-col sm:flex-row items-center">
                        <FaCrown className="text-amber-500 mb-2 sm:mb-0 sm:mr-3" size={24} />
                        <div className="text-center sm:text-left">
                            <div className="font-bold text-lg sm:text-2xl md:text-3xl lg:text-4xl">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                    Mac Exclusive Games{' '}
                                    <span className="font-medium text-blue-400">{totalApps}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description text - responsive for small screens */}
                <p className="text-gray-400 max-w-2xl mx-auto mb-6 text-sm sm:text-base md:text-lg px-4 sm:px-0">
                    Exclusive premium Mac games available only to our members. Experience the best gaming titles with enhanced graphics and performance.
                </p>

                {/* Contact buttons container */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                    {/* Telegram button */}
                    <a
                        href="https://t.me/n0t_ur_type"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 animate-pulse-glow"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10S2 17.514 2 12 6.486 2 12 2zm2.8 14.4c.12 0 .234-.05.318-.134.084-.084.134-.198.134-.318 0-.12-.05-.234-.134-.318-.084-.084-.198-.134-.318-.134H9.2c-.12 0-.234.05-.318.134-.084.084-.134.198-.134.318 0 .12.05.234.134.318.084.084.198.134.318.134h5.6zm-2.8-8.4c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 4.8c-.993 0-1.8-.807-1.8-1.8s.807-1.8 1.8-1.8 1.8.807 1.8 1.8-.807 1.8-1.8 1.8z" />
                        </svg>
                        Buy via Telegram
                    </a>

                    {/* Become a Member button */}
                    <Link
                        href="/membership"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-full shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
                    >
                        <FaCoffee className="mr-2" />
                        Become a Member
                    </Link>
                </div>

                {/* Feature badges - responsive for small screens */}
                <div className="flex flex-wrap justify-center gap-3">
                    <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 text-xs sm:text-sm text-gray-300 flex items-center">
                        <FaStar className="text-amber-500 mr-1 sm:mr-2" size={14} />
                        Premium Quality
                    </div>
                    <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 text-xs sm:text-sm text-gray-300 flex items-center">
                        <FaApple className="text-blue-400 mr-1 sm:mr-2" size={14} />
                        Mac Exclusive
                    </div>
                    <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 text-xs sm:text-sm text-gray-300 flex items-center">
                        <FaDownload className="text-green-400 mr-1 sm:mr-2" size={14} />
                        Easy Download
                    </div>
                </div>

                {/* Decorative line */}
                <div className="absolute -bottom-6 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
            </div>

            {data.length > 0 ? (
                <>
                    <div className="relative">
                        {/* Premium loading overlay during page transitions */}
                        {isPageTransitioning && (
                            <div className="absolute inset-0 bg-[#1a1a1a] bg-opacity-80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                                <div className="flex flex-col items-center bg-black/50 p-8 rounded-xl border border-purple-500/30">
                                    <div className="relative mb-6">
                                        {/* Pulsing glow effect */}
                                        <div className="absolute inset-0 rounded-full bg-purple-600/20 blur-xl animate-pulse"></div>

                                        {/* Spinner */}
                                        <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-t-purple-500 border-r-blue-500 border-b-purple-500 border-l-blue-500 border-t-transparent"></div>
                                    </div>
                                    <p className="text-white text-lg font-medium">Loading Premium Content</p>
                                    <p className="text-gray-400 text-sm mt-2">Page {currentPage} of {totalPages}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 transition-opacity duration-300 ease-in-out relative">
                            {/* Grid accent elements */}
                            <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-purple-500/30 rounded-tl-lg"></div>
                            <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-blue-500/30 rounded-br-lg"></div>

                            {data.map((game) => (
                                <GameCard
                                    key={game?._id || `game-${Math.random().toString(36).substring(2, 9)}`}
                                    game={game}
                                />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-16 bg-gradient-to-r from-purple-900/10 to-blue-900/10 rounded-xl border border-purple-500/20 animate-fadeInUp">
                    <div className="inline-block p-6 rounded-full bg-gradient-to-r from-purple-900/20 to-blue-900/20 mb-6 animate-float">
                        <FaApple className="text-purple-400" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-3">Premium Collection Coming Soon</h3>
                    <p className="text-gray-400 text-lg max-w-lg mx-auto mb-4">Our exclusive Mac games collection is being prepared for you.</p>
                    <p className="text-gray-500 mt-2">Check back soon for premium exclusive content</p>

                    <div className="mt-8 flex justify-center space-x-4">
                        <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30 text-sm text-gray-300 flex items-center animate-pulse-glow">
                            <FaStar className="text-amber-500 mr-2" size={14} />
                            Coming Soon
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-16 mb-16 relative animate-fadeInUp">
                    {/* Premium pagination decorative elements */}
                    <div className="absolute left-1/4 -top-8 w-32 h-32 bg-purple-600 opacity-5 rounded-full blur-2xl -z-10 animate-pulse"></div>
                    <div className="absolute right-1/4 -top-8 w-32 h-32 bg-blue-600 opacity-5 rounded-full blur-2xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

                    {/* Premium pagination frame */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl -z-10"></div>
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 animate-gradient-x"></div>

                    {/* Premium pagination header */}
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            Browse Premium Collection
                        </h3>
                        <p className="text-gray-400 text-sm">Page {currentPage} of {totalPages}</p>
                    </div>

                    <div className="relative z-10 bg-black/30 p-4 rounded-xl border border-purple-500/20">
                        <EnhancedPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            isLoading={isPageTransitioning}
                        />
                    </div>

                    {/* Decorative line */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent -z-10"></div>
                </div>
            )}
        </div>
    );
}