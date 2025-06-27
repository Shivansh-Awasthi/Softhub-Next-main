'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CiSearch } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { usePathname, useSearchParams } from 'next/navigation';

const Header = ({ initialQuery = '' }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef(null);

    // Update search query when initialQuery or URL changes
    useEffect(() => {
        // If we're on the search page, use the query from URL
        if (pathname === '/search') {
            const queryFromUrl = searchParams.get('query') || initialQuery;
            setSearchQuery(queryFromUrl);
        } else {
            // Clear search query on other pages
            setSearchQuery('');
        }
    }, [pathname, searchParams, initialQuery]);

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
    };

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim() !== '') {
            // Force a full navigation to the search page with the new query
            // This ensures it works even when already on the search page
            // Add a timestamp to force a refresh when already on the search page
            const timestamp = Date.now();
            window.location.href = `/search?query=${encodeURIComponent(searchQuery.trim())}&t=${timestamp}`;
        }
    };

    // Clear search
    const handleClear = () => {
        setSearchQuery('');
    };

    return (
        <header className="flex flex-wrap items-center justify-between px-1.5 pb-6">
            <div
                ref={searchRef}
                className="flex flex-wrap relative ring-1 ring-[#3E3E3E] rounded-lg w-full max-w-[760px] z-50 mt-4 md:mt-1"
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
            </div>
        </header>
    );
};

export default Header;