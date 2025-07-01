'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import EnhancedPagination from '@/app/components/Pagination/EnhancedPagination';
import { FaPlaystation } from "react-icons/fa";
import FilterBar from '@/app/components/Filtres/FilterBar';
import FilterModal from '@/app/components/Filtres/FilterModal';

export default function PpssppIso({ serverData }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialPage = parseInt(searchParams.get('page') || '1', 10);

    // Extract filters from URL
    const extractFiltersFromUrl = () => {
        const genres = searchParams.get('tags')
            ? searchParams.get('tags').split(',').map(name => {
                // Map genre names to IDs (update as needed)
                const GENRES = [
                    { id: 1, name: 'Action' },
                    { id: 2, name: 'Adventure' },
                    { id: 3, name: 'RPG' },
                    { id: 4, name: 'Racing' },
                ];
                const found = GENRES.find(g => g.name === name);
                return found ? found.id : null;
            }).filter(Boolean) : [];
        return {
            genres,
            gameMode: searchParams.get('gameMode') === 'Singleplayer' ? 'single' : searchParams.get('gameMode') === 'Multiplayer' ? 'multiplayer' : 'any',
            size: searchParams.get('sizeLimit') || '',
            year: searchParams.get('releaseYear') || '',
            popularity: searchParams.get('sortBy') ? 'popular' : 'all',
        };
    };

    // Persistent filters state
    const [filters, setFilters] = useState(extractFiltersFromUrl());
    useEffect(() => {
        setFilters(extractFiltersFromUrl());
    }, [searchParams]);

    // Function to check if a game is new (within 2 days)
    const isGameNew = (createdAt) => {
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)); // 2 days ago
        const gameCreatedAt = new Date(createdAt);
        return gameCreatedAt >= twoDaysAgo;
    };

    // Initialize with server data or handle error from server
    const [data, setData] = useState(serverData.apps || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(serverData.error || null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalItems, setTotalItems] = useState(serverData.total || 0);
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    const itemsPerPage = 48;
    const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1); // Ensure at least 1 page

    // Debug log to see what data we're receiving
    useEffect(() => {
    }, [serverData]);

    useEffect(() => {
        // Update current page when URL changes
        const page = parseInt(searchParams.get('page') || '1', 10);
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    }, [searchParams, currentPage]);

    useEffect(() => {
        if (currentPage === 1) return; // already have page 1 data from server

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/apps/category/ppsspp?page=${currentPage}&limit=${itemsPerPage}`,
                    {
                        headers: { 'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN },
                    }
                );

                if (!res.ok) {
                    throw new Error(`API error: ${res.status}`);
                }

                const json = await res.json();

                // Handle API response structure
                setData(json.apps || []);
                setTotalItems(json.total || 0);
                setError(null);
            } catch (err) {
                setError('Failed to load data: ' + err.message);
                console.error("Client fetch failed:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage]);

    // Helper: Map filter modal values to backend query params
    const mapFiltersToQuery = (filters) => {
        const params = new URLSearchParams(searchParams.toString());
        const GENRES = [
            { id: 1, name: "Action" }, { id: 2, name: "Adventure" }, { id: 3, name: "RPG" }, { id: 4, name: "Racing" },
            // ...add more as needed or use the full list from PC/Mac if available...
        ];
        const genreNames = filters.genres?.map(id => {
            const found = GENRES.find(g => g.id === id);
            return found ? found.name : null;
        }).filter(Boolean);
        if (genreNames && genreNames.length > 0) {
            params.set('tags', genreNames.join(','));
        } else {
            params.delete('tags');
        }
        if (filters.gameMode && filters.gameMode !== 'any') {
            params.set('gameMode', filters.gameMode === 'single' ? 'Singleplayer' : 'Multiplayer');
        } else {
            params.delete('gameMode');
        }
        if (filters.size) {
            params.set('sizeLimit', filters.size);
        } else {
            params.delete('sizeLimit');
        }
        if (filters.year) {
            params.set('releaseYear', filters.year);
        } else {
            params.delete('releaseYear');
        }
        if (filters.popularity && filters.popularity !== 'all') {
            let sortBy = 'newest';
            switch (filters.popularity) {
                case 'popular': sortBy = 'popular'; break;
                case 'relevance': sortBy = 'relevance'; break;
                case 'sizeAsc': sortBy = 'sizeAsc'; break;
                case 'sizeDesc': sortBy = 'sizeDesc'; break;
                case 'oldest': sortBy = 'oldest'; break;
                case 'newest': sortBy = 'newest'; break;
                default: sortBy = 'newest';
            }
            params.set('sortBy', sortBy);
        } else {
            params.delete('sortBy');
        }
        params.set('page', '1');
        return params;
    };

    // Handle filter apply
    const handleApplyFilters = (filters) => {
        const params = mapFiltersToQuery(filters);
        router.push(`/category/ppsspp/iso?${params.toString()}`);
    };

    // Check if any filter is active
    const isFilterActive = () => {
        const keys = ['tags', 'gameMode', 'sizeLimit', 'releaseYear', 'sortBy'];
        return keys.some(key => searchParams.get(key));
    };

    // Clear all filters
    const handleClearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        ['tags', 'gameMode', 'sizeLimit', 'releaseYear', 'sortBy'].forEach(key => params.delete(key));
        params.set('page', '1');
        router.push(`/category/ppsspp/iso?${params.toString()}`);
    };

    // Update handlePageChange to preserve filters
    const handlePageChange = (newPage) => {
        const validPage = Math.max(1, Math.min(newPage, totalPages));
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', validPage);
        router.push(`/category/ppsspp/iso?${params.toString()}`);
    };

    const slugify = (text = '') => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    };

    return (
        <div className="container mx-auto p-2 relative">
            {/* Filter Bar at the top */}
            <div className="mb-6 flex justify-end items-center gap-3">
                <FilterBar onOpenFilters={() => setFilterModalOpen(true)} />
                {isFilterActive() && (
                    <button
                        onClick={handleClearFilters}
                        className="group relative px-4 py-2 rounded-xl bg-white dark:bg-gray-900 text-red-500 border border-red-200/50 dark:border-red-700/50 hover:border-red-500/50 dark:hover:border-red-500/50 shadow-sm hover:shadow transition-all duration-300 ml-2"
                    >
                        <div className="absolute inset-0 rounded-xl bg-red-500/5 dark:bg-red-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative flex items-center gap-2 font-medium">
                            Clear Filters
                        </span>
                    </button>
                )}
            </div>
            <FilterModal open={filterModalOpen} onClose={() => setFilterModalOpen(false)} onApply={handleApplyFilters} initialFilters={filters} />

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
                        PPSSPP ISO{' '}
                        <span className="font-medium text-blue-400">{totalItems}</span>
                    </span>
                    <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
                </h1>
            </div>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : error ? (
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    {isFilterActive() && (
                        <button
                            onClick={handleClearFilters}
                            className="group relative px-4 py-2 rounded-xl bg-white dark:bg-gray-900 text-red-500 border border-red-200/50 dark:border-red-700/50 hover:border-red-500/50 dark:hover:border-red-500/50 shadow-sm hover:shadow transition-all duration-300 mt-2"
                        >
                            <div className="absolute inset-0 rounded-xl bg-red-500/5 dark:bg-red-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative flex items-center gap-2 font-medium">
                                Clear Filters
                            </span>
                        </button>
                    )}
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    No PPSSPP ISO games found.
                    {isFilterActive() && (
                        <div className="mt-4">
                            <button
                                onClick={handleClearFilters}
                                className="group relative px-4 py-2 rounded-xl bg-white dark:bg-gray-900 text-red-500 border border-red-200/50 dark:border-red-700/50 hover:border-red-500/50 dark:hover:border-red-500/50 shadow-sm hover:shadow transition-all duration-300"
                            >
                                <div className="absolute inset-0 rounded-xl bg-red-500/5 dark:bg-red-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center gap-2 font-medium">
                                    Clear Filters
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 relative">
                    {/* Grid accent elements */}
                    <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-purple-500/30 rounded-tl-lg"></div>
                    <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-blue-500/30 rounded-br-lg"></div>

                    {data.map((ele) => (
                        <Link
                            key={ele._id}
                            href={`/download/${slugify(ele.platform)}/${slugify(ele.title)}/${ele._id}`}
                            className="group flex flex-col rounded-xl h-52 overflow-hidden transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl border border-purple-600/20 relative"
                        >
                            {/* Ambient background elements - always visible */}
                            <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                            <div className="flex flex-col justify-center items-center h-36 bg-gradient-to-br from-[#1E1E1E] to-[#121212] pt-4 relative">
                                {/* App icon with enhanced styling */}
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25"></div>
                                    <img
                                        src={ele.thumbnail[0]}
                                        alt={ele.title}
                                        className="relative rounded-lg w-16 h-16 transition-transform duration-700 ease-in-out transform group-hover:scale-110 border border-purple-500/20 z-10"
                                    />
                                </div>

                                {/* Game platform badge */}
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md z-20 border border-purple-600/20">
                                    <div className="text-[10px] font-medium text-blue-400 flex items-center">
                                        <FaPlaystation className="mr-1 text-lg" />
                                        PSP
                                    </div>
                                </div>

                                {/* NEW badge for games within 2 days */}
                                {isGameNew(ele.createdAt) && (
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
                            </div>

                            <div className="flex flex-col p-3 bg-gradient-to-br from-[#1E1E1E] to-[#121212] flex-grow relative">
                                {/* Glowing separator line */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-600/20 to-transparent"></div>

                                <div className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white text-center pb-2 overflow-hidden whitespace-nowrap text-ellipsis group-hover:from-blue-400 group-hover:to-purple-400 transition-colors duration-300">
                                    {ele.title}
                                </div>
                                <div className="text-xs font-normal text-gray-400 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    </svg>
                                    {ele.size}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Enhanced Pagination Controls */}
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
                            isLoading={loading}
                        />
                    </div>

                    {/* Decorative line */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent -z-10"></div>
                </div>
            )}
        </div>
    );
}
