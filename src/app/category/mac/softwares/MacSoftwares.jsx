'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import EnhancedPagination from '@/app/components/Pagination/EnhancedPagination';
import { LuAppWindowMac } from "react-icons/lu";
import FilterBar from '@/app/components/Filtres/FilterBar';
import FilterModal from '@/app/components/Filtres/FilterModal';

export default function MacSoftwares({ serverData, initialPage = 1 }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const ITEMS_PER_PAGE = 48;

    // Extract data from server response
    const extractData = (data) => {
        if (data?.apps && Array.isArray(data.apps)) {
            return {
                apps: data.apps,
                total: data.total || 0
            };
        }
        if (data?.data && Array.isArray(data.data)) {
            return {
                apps: data.data,
                total: data.total || 0
            };
        }
        return {
            apps: [],
            total: 0
        };
    };
    const { apps, total } = extractData(serverData);

    const [data, setData] = useState(apps);
    const [totalItems, setTotalItems] = useState(total);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(serverData?.error || null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const totalPages = Math.max(Math.ceil(totalItems / ITEMS_PER_PAGE), 1);

    // Update state when props or URL changes
    useEffect(() => {
        const { apps, total } = extractData(serverData);
        setData(apps);
        setTotalItems(total);
        setError(serverData?.error || null);
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
        if (pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl);
        }
    }, [serverData, searchParams]);

    // Helper: Map filter modal values to backend query params
    const mapFiltersToQuery = (filters) => {
        const params = new URLSearchParams(searchParams.toString());
        const GENRES = [
            { id: 42, name: "2D" }, { id: 85, name: "3D" }, { id: 1, name: "Action" }, { id: 2, name: "Adventure" },
            { id: 83, name: "Agriculture" }, { id: 33, name: "Anime" }, { id: 40, name: "Apps" }, { id: 71, name: "Arcade" },
            { id: 115, name: "Artificial Intelligence" }, { id: 129, name: "Assassin" }, { id: 60, name: "Atmospheric" },
            { id: 109, name: "Automation" }, { id: 133, name: "Blood" }, { id: 24, name: "Building" }, { id: 95, name: "Cartoon" },
            { id: 22, name: "Casual" }, { id: 107, name: "Character Customization" }, { id: 68, name: "Cinematic*" },
            { id: 106, name: "Classic" }, { id: 49, name: "Co-Op" }, { id: 108, name: "Colony Sim" }, { id: 70, name: "Colorful" },
            { id: 86, name: "Combat" }, { id: 78, name: "Comedy" }, { id: 103, name: "Comic Book" }, { id: 44, name: "Comptetitive" },
            { id: 105, name: "Controller" }, { id: 72, name: "Crafting" }, { id: 5, name: "Crime" }, { id: 59, name: "Cute" },
            { id: 67, name: "Cyberpunk" }, { id: 91, name: "Dark Humor" }, { id: 51, name: "Difficult" }, { id: 58, name: "Dragons" },
            { id: 126, name: "Driving" }, { id: 118, name: "Early Access" }, { id: 46, name: "eSport" }, { id: 125, name: "Exploration" },
            { id: 102, name: "Family Friendly" }, { id: 9, name: "Fantasy" }, { id: 79, name: "Farming Sim" }, { id: 124, name: "Fast-Paced" },
            { id: 135, name: "Female Protagonist" }, { id: 36, name: "Fighting" }, { id: 121, name: "First-Person" }, { id: 84, name: "Fishing" },
            { id: 88, name: "Flight" }, { id: 43, name: "FPS" }, { id: 64, name: "Funny" }, { id: 76, name: "Gore" },
            { id: 134, name: "Great Soundtrack" }, { id: 73, name: "Hack and Slash" }, { id: 10, name: "History" }, { id: 11, name: "Horror" },
            { id: 57, name: "Hunting" }, { id: 69, name: "Idler" }, { id: 100, name: "Illuminati" }, { id: 120, name: "Immersive Sim" },
            { id: 25, name: "Indie" }, { id: 101, name: "LEGO" }, { id: 81, name: "Life Sim" }, { id: 66, name: "Loot" },
            { id: 113, name: "Management" }, { id: 61, name: "Mature" }, { id: 96, name: "Memes" }, { id: 50, name: "Military" },
            { id: 89, name: "Modern" }, { id: 32, name: "Multiplayer" }, { id: 13, name: "Mystery" }, { id: 77, name: "Nudity" },
            { id: 26, name: "Open World" }, { id: 74, name: "Parkour" }, { id: 122, name: "Physics" }, { id: 80, name: "Pixel Graphics" },
            { id: 127, name: "Post-apocalyptic" }, { id: 35, name: "Puzzle" }, { id: 48, name: "PvP" }, { id: 28, name: "Racing" },
            { id: 53, name: "Realistic" }, { id: 82, name: "Relaxing" }, { id: 112, name: "Resource Management" }, { id: 23, name: "RPG" },
            { id: 65, name: "Sandbox" }, { id: 34, name: "Sci-fi" }, { id: 114, name: "Science" }, { id: 15, name: "Science Fiction" },
            { id: 99, name: "Sexual Content" }, { id: 31, name: "Shooters" }, { id: 21, name: "Simulation" }, { id: 93, name: "Singleplayer" },
            { id: 29, name: "Sports" }, { id: 38, name: "Stealth Game" }, { id: 97, name: "Story Rich" }, { id: 27, name: "Strategy" },
            { id: 92, name: "Superhero" }, { id: 117, name: "Surreal" }, { id: 37, name: "Survival" }, { id: 47, name: "Tactical" },
            { id: 87, name: "Tanks" }, { id: 45, name: "Team-Based" }, { id: 104, name: "Third Person" }, { id: 54, name: "Third-Person-Shooter" },
            { id: 17, name: "Thriller" }, { id: 56, name: "Tower Defense" }, { id: 52, name: "Trading" }, { id: 94, name: "Turn-Based" },
            { id: 111, name: "Underwater" }, { id: 41, name: "Utilities" }, { id: 75, name: "Violent" }, { id: 20, name: "VR" },
            { id: 18, name: "War" }, { id: 123, name: "Wargame" }, { id: 119, name: "Zombie" }
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
        router.push(`${pathname}?${params.toString()}`);
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
        router.push(`${pathname}?${params.toString()}`);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        const validPage = Math.max(1, Math.min(newPage, totalPages));
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', validPage);
        router.push(`${pathname}?${params.toString()}`);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Function to check if a software is new (within 2 days)
    const isGameNew = (createdAt) => {
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
        const gameCreatedAt = new Date(createdAt);
        return gameCreatedAt >= twoDaysAgo;
    };

    const createSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    };

    // Helper: Extract filters from URL
    const extractFiltersFromUrl = () => {
        let genres = [];
        const tags = searchParams.get('tags');
        const GENRES = [
            { id: 42, name: "2D" }, { id: 85, name: "3D" }, { id: 1, name: "Action" }, { id: 2, name: "Adventure" },
            { id: 83, name: "Agriculture" }, { id: 33, name: "Anime" }, { id: 40, name: "Apps" }, { id: 71, name: "Arcade" },
            { id: 115, name: "Artificial Intelligence" }, { id: 129, name: "Assassin" }, { id: 60, name: "Atmospheric" },
            { id: 109, name: "Automation" }, { id: 133, name: "Blood" }, { id: 24, name: "Building" }, { id: 95, name: "Cartoon" },
            { id: 22, name: "Casual" }, { id: 107, name: "Character Customization" }, { id: 68, name: "Cinematic*" },
            { id: 106, name: "Classic" }, { id: 49, name: "Co-Op" }, { id: 108, name: "Colony Sim" }, { id: 70, name: "Colorful" },
            { id: 86, name: "Combat" }, { id: 78, name: "Comedy" }, { id: 103, name: "Comic Book" }, { id: 44, name: "Comptetitive" },
            { id: 105, name: "Controller" }, { id: 72, name: "Crafting" }, { id: 5, name: "Crime" }, { id: 59, name: "Cute" },
            { id: 67, name: "Cyberpunk" }, { id: 91, name: "Dark Humor" }, { id: 51, name: "Difficult" }, { id: 58, name: "Dragons" },
            { id: 126, name: "Driving" }, { id: 118, name: "Early Access" }, { id: 46, name: "eSport" }, { id: 125, name: "Exploration" },
            { id: 102, name: "Family Friendly" }, { id: 9, name: "Fantasy" }, { id: 79, name: "Farming Sim" }, { id: 124, name: "Fast-Paced" },
            { id: 135, name: "Female Protagonist" }, { id: 36, name: "Fighting" }, { id: 121, name: "First-Person" }, { id: 84, name: "Fishing" },
            { id: 88, name: "Flight" }, { id: 43, name: "FPS" }, { id: 64, name: "Funny" }, { id: 76, name: "Gore" },
            { id: 134, name: "Great Soundtrack" }, { id: 73, name: "Hack and Slash" }, { id: 10, name: "History" }, { id: 11, name: "Horror" },
            { id: 57, name: "Hunting" }, { id: 69, name: "Idler" }, { id: 100, name: "Illuminati" }, { id: 120, name: "Immersive Sim" },
            { id: 25, name: "Indie" }, { id: 101, name: "LEGO" }, { id: 81, name: "Life Sim" }, { id: 66, name: "Loot" },
            { id: 113, name: "Management" }, { id: 61, name: "Mature" }, { id: 96, name: "Memes" }, { id: 50, name: "Military" },
            { id: 89, name: "Modern" }, { id: 32, name: "Multiplayer" }, { id: 13, name: "Mystery" }, { id: 77, name: "Nudity" },
            { id: 26, name: "Open World" }, { id: 74, name: "Parkour" }, { id: 122, name: "Physics" }, { id: 80, name: "Pixel Graphics" },
            { id: 127, name: "Post-apocalyptic" }, { id: 35, name: "Puzzle" }, { id: 48, name: "PvP" }, { id: 28, name: "Racing" },
            { id: 53, name: "Realistic" }, { id: 82, name: "Relaxing" }, { id: 112, name: "Resource Management" }, { id: 23, name: "RPG" },
            { id: 65, name: "Sandbox" }, { id: 34, name: "Sci-fi" }, { id: 114, name: "Science" }, { id: 15, name: "Science Fiction" },
            { id: 99, name: "Sexual Content" }, { id: 31, name: "Shooters" }, { id: 21, name: "Simulation" }, { id: 93, name: "Singleplayer" },
            { id: 29, name: "Sports" }, { id: 38, name: "Stealth Game" }, { id: 97, name: "Story Rich" }, { id: 27, name: "Strategy" },
            { id: 92, name: "Superhero" }, { id: 117, name: "Surreal" }, { id: 37, name: "Survival" }, { id: 47, name: "Tactical" },
            { id: 87, name: "Tanks" }, { id: 45, name: "Team-Based" }, { id: 104, name: "Third Person" }, { id: 54, name: "Third-Person-Shooter" },
            { id: 17, name: "Thriller" }, { id: 56, name: "Tower Defense" }, { id: 52, name: "Trading" }, { id: 94, name: "Turn-Based" },
            { id: 111, name: "Underwater" }, { id: 41, name: "Utilities" }, { id: 75, name: "Violent" }, { id: 20, name: "VR" },
            { id: 18, name: "War" }, { id: 123, name: "Wargame" }, { id: 119, name: "Zombie" }
        ];
        if (tags) {
            const tagNames = tags.split(',');
            genres = tagNames.map(name => {
                const found = GENRES.find(g => g.name === name);
                return found ? found.id : null;
            }).filter(Boolean);
        }
        let gameMode = searchParams.get('gameMode');
        if (gameMode === 'Singleplayer') gameMode = 'single';
        else if (gameMode === 'Multiplayer') gameMode = 'multi';
        else gameMode = 'any';
        const size = searchParams.get('sizeLimit') || '';
        const year = searchParams.get('releaseYear') || '';
        let popularity = 'all';
        const sortBy = searchParams.get('sortBy');
        if (sortBy) {
            switch (sortBy) {
                case 'popular': popularity = 'popular'; break;
                case 'relevance': popularity = 'relevance'; break;
                case 'sizeAsc': popularity = 'sizeAsc'; break;
                case 'sizeDesc': popularity = 'sizeDesc'; break;
                case 'oldest': popularity = 'oldest'; break;
                case 'newest': popularity = 'newest'; break;
                default: popularity = 'all';
            }
        }
        return {
            genres,
            filterModeAny: true,
            gameMode,
            size,
            year,
            popularity,
        };
    };

    // Persistent filters state
    const [filters, setFilters] = useState(extractFiltersFromUrl());
    useEffect(() => {
        setFilters(extractFiltersFromUrl());
    }, [searchParams]);

    // Main render
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
                        Mac Softwares{' '}
                        <span className="font-medium text-blue-400">{totalItems}</span>
                    </span>
                    <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
                </h1>
            </div>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : error ? (
                <div className="text-center text-red-500">
                    {error}
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
            ) : data.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    No Mac softwares found.
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
                            href={`/download/${createSlug(ele.platform)}/${createSlug(ele.title)}/${ele._id}`}
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

                                {/* Software platform badge */}
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md z-20 border border-purple-600/20">
                                    <div className="text-[10px] font-medium text-blue-400 flex items-center">
                                        <LuAppWindowMac className="mr-1" />
                                        Mac App
                                    </div>
                                </div>

                                {/* NEW badge for software within 2 days */}
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
                            {/* Title and info */}
                            <div className="flex-1 flex flex-col justify-between p-3">
                                <div className="font-semibold text-base text-gray-100 truncate mb-1">
                                    {ele.title}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>{ele.size || 'Unknown size'}</span>
                                    <span>{ele.releaseYear || 'Year?'}</span>
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
