'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { CiSearch } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { useRouter, useSearchParams } from 'next/navigation';
import LiveSearchResults from './LiveSearchResults';

const HeaderSSR = ({ initialQuery = '', initialResults = { apps: [], total: 0 } }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [liveResults, setLiveResults] = useState(initialResults.apps || []);
    const [totalResults, setTotalResults] = useState(initialResults.total || 0);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    // Handle search input change - this updates the URL which triggers server-side data fetching
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Show results if there's a query
        if (value.trim()) {
            setShowResults(true);

            // Update URL with search query (this will trigger a server fetch)
            const params = new URLSearchParams(searchParams.toString());
            params.set('query', value);

            // Use router.replace to update URL without full navigation
            router.replace(`/header-ssr?${params.toString()}`, { scroll: false });
        } else {
            setShowResults(false);

            // Remove query parameter if search is empty
            const params = new URLSearchParams(searchParams.toString());
            params.delete('query');

            // Use router.replace to update URL without full navigation
            router.replace(`/header-ssr${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
        }
    };

    // Update local state when initialResults changes (from server)
    useEffect(() => {
        if (initialResults) {
            setLiveResults(initialResults.apps || []);
            setTotalResults(initialResults.total || 0);
        }
    }, [initialResults]);

    // Update searchQuery when initialQuery changes (from URL)
    useEffect(() => {
        setSearchQuery(initialQuery);
        // Show results if there's a query
        if (initialQuery && initialQuery.trim() !== '') {
            setShowResults(true);
        }
    }, [initialQuery]);

    // Handle click outside to close results dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        // Add both mousedown and click events to ensure it works in all scenarios
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim() !== '') {
            // Navigate to search page
            router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
            setShowResults(false);
        }
    };

    // Clear search
    const handleClear = () => {
        setSearchQuery('');
        setLiveResults([]);
        setShowResults(false);

        // Remove query parameter
        const params = new URLSearchParams(searchParams.toString());
        params.delete('query');

        // Use router.replace to update URL without full navigation
        router.replace(`/header-ssr${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <header className="flex flex-wrap items-center justify-between px-1.5 pb-6">
                {/* Blur overlay for background when search results are shown */}
                <div
                    className={`fixed inset-0 bg-black transition-all duration-300 ${showResults
                        ? 'opacity-70 backdrop-blur-xl z-40 pointer-events-auto'
                        : 'opacity-0 backdrop-blur-none z-0 pointer-events-none'
                        }`}
                    onClick={() => setShowResults(false)}
                ></div>

                <div
                    ref={searchRef}
                    className="flex flex-wrap relative border border-white border-opacity-5 rounded-lg w-full max-w-[760px] z-50"
                    onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up to the body
                >
                    <form onSubmit={handleSearch} className="w-full flex items-center">
                        <input
                            type="text"
                            placeholder="Search the site"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="bg-[#242424] hover:bg-[#262626] rounded-lg text-white py-3 pl-4 pr-12 h-12 flex-grow focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-opacity-80 transition duration-200"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute right-14 top-0 h-full w-4 flex items-center justify-center rounded-full"
                            >
                                <RxCross2 className="text-xxl h-7 w-7 text-[#8e8e8e] hover:text-[#ffffff]" />
                            </button>
                        )}
                        <button type="submit" className="absolute right-1 top-0 h-full w-12 flex items-center justify-center rounded-full">
                            <CiSearch className="text-xxl h-7 w-7 text-[#8e8e8e] hover:text-[#ffffff]" />
                        </button>
                    </form>

                    {/* Live Search Results Dropdown */}
                    {showResults && (
                        <LiveSearchResults
                            results={liveResults}
                            query={searchQuery}
                            loading={loading}
                            totalResults={totalResults}
                            onResultClick={() => setShowResults(false)}
                        />
                    )}
                </div>
            </header>
        </Suspense>
    );
};

export default HeaderSSR;
