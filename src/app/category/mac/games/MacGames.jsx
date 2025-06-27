'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useLoading } from '@/app/context/LoadingContext';
import EnhancedPagination from '@/app/components/Pagination/EnhancedPagination';
import { LuAppWindowMac } from "react-icons/lu";

// Slugify function (simplified version)
const slugify = (text = '') => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export default function MacGames({ serverData, initialPage = 1 }) {
    // Configuration
    const ITEMS_PER_PAGE = 48;

    // Hooks for URL and navigation
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Get the current page from URL or initialPage prop

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
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);
    const [error, setError] = useState(serverData?.error || null);
    const [purchasedGames, setPurchasedGames] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userData, setUserData] = useState(null);

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

    // Get loading context
    const { showSkeleton } = useLoading();

    // Function to check if a game is new (within 2 days)
    const isGameNew = (createdAt, updatedAt) => {
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)); // 2 days ago

        // Check both createdAt and updatedAt
        const gameCreatedAt = new Date(createdAt);
        const gameUpdatedAt = new Date(updatedAt);

        // Game is new if either created or updated within 2 days
        return gameCreatedAt >= twoDaysAgo || gameUpdatedAt >= twoDaysAgo;
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage === currentPage || newPage < 1 || newPage > totalPages || isPageTransitioning) {
            return; // Don't do anything if invalid page or already transitioning
        }

        // Set transition state
        setIsPageTransitioning(true);

        // Show skeleton while loading
        showSkeleton('Mac');

        // Update URL - this will trigger a new server-side render
        router.push(`${pathname}?page=${newPage}`);

        // Scroll to top
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(totalApps / ITEMS_PER_PAGE));

    // We no longer need to generate page numbers here
    // The EnhancedPagination component handles this internally

    // Safe slug generation
    const createSlug = (text = '') => {
        return slugify(text) || 'untitled';
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
                <div className="relative flex flex-col rounded-xl h-52 overflow-hidden transition-all duration-300 ease-in-out shadow-lg border border-purple-600/20 opacity-90 cursor-not-allowed">
                    {/* Ambient background elements - always visible */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                    {/* Subtle overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

                    {/* Lock overlay */}
                    <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center z-20 bg-black/50">
                        <div className="bg-black/70 p-3 rounded-full border border-purple-600/30">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="34"
                                height="34"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                            >
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-col rounded-xl h-full overflow-hidden">
                        <figure className="flex justify-center items-center rounded-t-xl overflow-hidden h-full">
                            <img
                                src={game.coverImg || '/default-game.png'}
                                alt={game.title || 'Game'}
                                className="w-full h-full object-cover rounded-t-xl transition-transform duration-700 ease-in-out transform hover:scale-110"
                                onError={(e) => {
                                    e.target.src = '/default-game.png';
                                    e.target.alt = 'Default game image';
                                }}
                            />
                        </figure>

                        {/* Game platform badge */}
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md z-20 border border-purple-600/20">
                            <div className="text-[10px] font-medium text-blue-400 flex items-center">
                                <LuAppWindowMac className="mr-1" />
                                Mac
                            </div>
                        </div>

                        {/* NEW badge for games within 2 days */}
                        {isGameNew(game.createdAt, game.updatedAt) && (
                            <div className="absolute top-2 right-2 z-20">
                                <div className="relative">
                                    {/* Glowing background */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-sm opacity-75"></div>
                                    {/* Badge content */}
                                    <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[8px] font-bold px-2 py-1 rounded-full border border-green-400/50 shadow-lg">
                                        <div className="flex items-center">
                                            <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            NEW
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col p-3 bg-gradient-to-br from-[#1E1E1E] to-[#121212] flex-grow relative">
                            {/* Glowing separator line */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-600/20 to-transparent"></div>

                            <div className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white pb-2 overflow-hidden whitespace-nowrap text-ellipsis">
                                {game.title || 'Untitled Game'}
                            </div>
                            <div className="text-xs font-normal text-gray-400 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                </svg>
                                {game.size || 'N/A'}
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
                    <div className="relative flex flex-col rounded-xl h-52 overflow-hidden transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl border border-purple-600/20">
                        {/* Ambient background elements - always visible */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                        {/* Subtle overlay gradient for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

                        <div className="flex flex-col rounded-xl h-full overflow-hidden">
                            <figure className="flex justify-center items-center rounded-t-xl overflow-hidden h-full">
                                <img
                                    src={game.coverImg || '/default-game.png'}
                                    alt={game.title || 'Game'}
                                    className="w-full h-full object-cover rounded-t-xl transition-transform duration-700 ease-in-out transform group-hover:scale-110"
                                    onError={(e) => {
                                        e.target.src = '/default-game.png';
                                        e.target.alt = 'Default game image';
                                    }}
                                />
                            </figure>

                            {/* Game platform badge */}
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md z-20 border border-purple-600/20">
                                <div className="text-[10px] font-medium text-blue-400 flex items-center">
                                    <LuAppWindowMac className="mr-1" />
                                    Mac
                                </div>
                            </div>

                            {/* NEW badge for games within 2 days */}
                            {isGameNew(game.createdAt, game.updatedAt) && (
                                <div className="absolute top-2 right-2 z-20">
                                    <div className="relative">
                                        {/* Glowing background */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-sm opacity-75"></div>
                                        {/* Badge content */}
                                        <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[8px] font-bold px-2 py-1 rounded-full border border-green-400/50 shadow-lg">
                                            <div className="flex items-center">
                                                <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                NEW
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col p-3 bg-gradient-to-br from-[#1E1E1E] to-[#121212] flex-grow relative">
                                {/* Glowing separator line */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-600/20 to-transparent"></div>

                                <div className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white pb-2 overflow-hidden whitespace-nowrap text-ellipsis group-hover:from-blue-400 group-hover:to-purple-400 transition-colors duration-300">
                                    {game.title || 'Untitled Game'}
                                </div>
                                <div className="text-xs font-normal text-gray-400 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    </svg>
                                    {game.size || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            );
        }
    };

    // Error state
    if (error && !data.length) {
        return (
            <div className="container mx-auto p-2 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => router.refresh()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry Loading Games
                </button>
            </div>
        );
    }

    // Main render
    return (
        <div className="container mx-auto p-2 relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600 opacity-5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 opacity-5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-purple-600 opacity-5 rounded-full blur-3xl -z-10"></div>

            {/* Decorative grid lines */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTMwIDMwaDMwVjBoLTMwdjMwek0wIDMwaDMwdjMwSDB2LTMweiIgZmlsbD0iIzJkMmQyZCIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] bg-center opacity-40 -z-10"></div>

            {/* Header with enhanced styling */}
            <div className="cover mb-12 text-center relative">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-10 blur-xl -z-10"></div>
                <h1 className="inline-block font-bold text-4xl mb-3 relative">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        Mac Games{' '}
                        <span className="font-medium text-blue-400">{totalApps}</span>
                    </span>
                    <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
                </h1>
            </div>

            {data.length > 0 ? (
                <>
                    <div className="relative">
                        {/* Loading overlay during page transitions */}
                        {isPageTransitioning && (
                            <div className="absolute inset-0 bg-[#1a1a1a] bg-opacity-70 z-10 flex items-center justify-center rounded-lg">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                    <p className="text-white text-lg">Loading page {currentPage}...</p>
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

                    {totalPages > 1 && (
                        <div className="mt-12 relative">
                            {/* Pagination decorative elements */}
                            <div className="absolute left-1/4 -top-8 w-24 h-24 bg-purple-600 opacity-5 rounded-full blur-2xl -z-10"></div>
                            <div className="absolute right-1/4 -top-8 w-24 h-24 bg-blue-600 opacity-5 rounded-full blur-2xl -z-10"></div>

                            <div className="relative z-10">
                                <EnhancedPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    isLoading={isPageTransitioning}
                                />
                            </div>

                            {/* Decorative line */}
                            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent -z-10"></div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-10 text-gray-400">
                    No games available at the moment
                </div>
            )}
        </div>
    );
}