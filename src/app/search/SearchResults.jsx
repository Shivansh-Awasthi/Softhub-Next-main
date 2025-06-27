'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CiLock } from 'react-icons/ci'; // Lock Icon
import SearchSkeleton from './SearchSkeleton';
import { jwtDecode } from 'jwt-decode';

// Function to format dates consistently between server and client
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Use YYYY-MM-DD format which is consistent across server and client
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const SearchResults = ({ initialData = { apps: [], total: 0 }, initialQuery = '', initialPage = 1, timestamp = Date.now() }) => {
    const router = useRouter();

    // Initialize with initialQuery
    const [query, setQuery] = useState(initialQuery);

    // Update query from URL when component mounts on client
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Get query from URL
            const urlParams = new URLSearchParams(window.location.search);
            const urlQuery = urlParams.get('query');
            if (urlQuery) {
                setQuery(urlQuery);
            }
        }
    }, []);

    // Store the timestamp for cache busting
    const [searchTimestamp, setSearchTimestamp] = useState(timestamp);

    const [data, setData] = useState(initialData.apps || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(initialData.error || '');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalApps, setTotalApps] = useState(initialData.total || 0);
    const [itemsPerPage] = useState(48); // 48 items per page

    // User data state
    const [userData, setUserData] = useState({
        purchasedGames: [],
        isAdmin: false
    });


    const handleData = async () => {
        // Skip fetching if we're on the initial page (server has already fetched the data)
        // regardless of whether results were found or not
        if (currentPage === initialPage) {
            return;
        }

        setLoading(true);

        try {
            // If query is empty, fetch all apps
            const trimmedQuery = query ? query.trim() : '';

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/apps/all?page=${currentPage}&limit=${itemsPerPage}&q=${encodeURIComponent(trimmedQuery)}`,
                {
                    headers: {
                        'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const responseData = await response.json();

            if (responseData.success) {
                setData(responseData.apps);
                setTotalApps(responseData.total);
                setError('');
            } else {
                setError('Failed to load data. Please try again later.');
            }
        } catch (error) {
            console.log("Error fetching apps:", error);
            setError('Failed to load data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Update URL when page changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const purchasedGames = decoded?.purchasedGames || [];
                    const isAdmin = decoded?.role === 'ADMIN';

                    setUserData({
                        purchasedGames,
                        isAdmin
                    });
                } catch (err) {
                    console.error("Failed to decode token:", err);
                }
            }
        }
    }, []);


    // Reset currentPage to 1 and update timestamp whenever the query changes
    useEffect(() => {
        if (query !== initialQuery) {
            setCurrentPage(1);
            // Update timestamp to ensure fresh results
            setSearchTimestamp(Date.now());
        }
    }, [query, initialQuery]);

    // Fetch the data whenever the page, query, or timestamp changes
    useEffect(() => {
        try {
            if (query) {
                handleData();
            }
        } catch (error) {
            console.error("Error in data fetching effect:", error);
            setError('An error occurred while fetching data. Please try again.');
        }
    }, [currentPage, query, searchTimestamp]);

    // Handle empty search query state
    useEffect(() => {
        if (!query || query.length < 1) {
            setError(<span style={{ fontSize: '15px' }}>⚠ Search field is empty.</span>);
            setData([]); // Clear data when no query
        }
    }, [query]);

    // Calculate total pages based on the total apps count
    const totalPages = Math.ceil(totalApps / itemsPerPage);

    // Handle Page Change
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);

        // Scroll to top
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const createSlug = (title) => {
        return title
            .toLowerCase() // Convert to lowercase
            .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .trim(); // Remove trailing spaces
    };

    return (
        <div>
            <div className='cover mb-6'>
                {data.length > 0 && !error && (
                    <h1 className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 text-3xl font-bold mb-4'>
                        Search Results <span className='font-medium ml-2 text-[#8E8E8E]'>{totalApps}</span>
                    </h1>
                )}
            </div>

            {loading ? (
                <SearchSkeleton itemCount={12} />
            ) : error ? (
                <div>
                    <h1 className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 text-3xl font-bold mb-6'>Oops! Something went wrong</h1>
                    <div className="p-6 bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-xl text-sm text-center border border-purple-600/20 shadow-lg relative overflow-hidden">
                        {/* Ambient background elements */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>
                        <p className="relative z-10">{error}</p>
                    </div>
                </div>
            ) : data.length === 0 ? (
                <div>
                    <h1 className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 text-3xl font-bold mb-6'>No Results Found</h1>
                    <div className="p-6 bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-xl text-sm text-center border border-purple-600/20 shadow-lg relative overflow-hidden">
                        {/* Ambient background elements */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>
                        <p className="relative z-10 text-white">Sorry, your search did not yield any results. Try changing or shortening your query.</p>
                    </div>
                </div>
            ) : (
                <div className="w-full md:w-full pt-3 pb-3 bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-xl border border-purple-600/20 shadow-lg relative overflow-hidden">
                    {/* Ambient background elements */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                    <div className="flow-root relative z-10">
                        <ul role="list" className="divide-y divide-gray-700/30">
                            {data.map((ele) => {
                                // Check if the game is paid and whether the user has purchased it
                                const isPurchased = userData.purchasedGames.includes(ele._id);
                                const isUnlocked = userData.isAdmin || !ele.isPaid || isPurchased;
                                const isLocked = !isUnlocked;

                                return (
                                    <li
                                        key={ele._id}
                                        className={`py-2 sm:py-2 p-8 relative hover:bg-black/20 transition-all duration-200 ${isLocked ? 'opacity-30 pointer-events-none' : ''}`}
                                    >
                                        <Link
                                            href={isLocked ? '#' : `/download/${createSlug(ele.platform)}/${createSlug(ele.title)}/${ele._id}`}
                                            className="flex items-center justify-between w-full"
                                        >
                                            <div className="relative flex-shrink-0">
                                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25"></div>
                                                <img
                                                    className="relative w-12 h-12 rounded-lg object-cover border border-purple-500/20 transition-all duration-300 hover:scale-105"
                                                    src={ele.thumbnail[0]}
                                                    alt={ele.title}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 ms-4">
                                                <p className={`font-medium truncate ${ele.platform === 'Mac' ? 'text-blue-400' :
                                                    ele.platform === 'PC' ? 'text-red-400' :
                                                        ele.platform === 'Android' ? 'text-green-400' :
                                                            ele.platform === 'Playstation' ? 'text-purple-400' :
                                                                ele.platform === 'iOS' ? 'text-yellow-400' :
                                                                    'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400'
                                                    }`}>
                                                    {ele.title}
                                                </p>

                                                <p className="text-sm truncate flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-1 ${ele.platform === 'Mac' ? 'text-blue-400' :
                                                        ele.platform === 'PC' ? 'text-red-400' :
                                                            ele.platform === 'Android' ? 'text-green-400' :
                                                                ele.platform === 'Playstation' ? 'text-purple-400' :
                                                                    ele.platform === 'iOS' ? 'text-yellow-400' :
                                                                        'text-gray-400'
                                                        }`}>
                                                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                                                        <path d="M12 18h.01" />
                                                    </svg>
                                                    <span className={`${ele.platform === 'Mac' ? 'text-blue-400' :
                                                        ele.platform === 'PC' ? 'text-red-400' :
                                                            ele.platform === 'Android' ? 'text-green-400' :
                                                                ele.platform === 'Playstation' ? 'text-purple-400' :
                                                                    ele.platform === 'iOS' ? 'text-yellow-400' :
                                                                        'text-gray-300'
                                                        } font-medium`}>
                                                        {ele.platform}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex-1 flex justify-center text-sm font-semibold text-gray-400 hidden sm:block">
                                                {ele.size}
                                            </div>
                                            <div className="text-right text-sm text-gray-400 hidden md:block">
                                                {formatDate(ele.updatedAt)}
                                            </div>
                                        </Link>

                                        {/* Lock Icon for Locked Games */}
                                        {isLocked && (
                                            <div className="absolute top-0 left-0 right-0 bottom-0 lg:right-20 flex justify-center items-center z-10 opacity-100">
                                                {/* Ensure lock icon is fully visible */}
                                                <CiLock className="text-white font-bold text-4xl" />
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            )}

            {/* Pagination Controls - Improved Design */}
            {totalApps > itemsPerPage && !loading && query && (  // Only show pagination if query is not empty and there are multiple pages
                <div className="flex justify-center mt-8 mb-8">
                    <nav aria-label="Page navigation" className="inline-flex items-center">
                        {/* Previous Button */}
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            className={`relative px-4 py-2.5 rounded-l-md text-sm font-medium transition-all duration-300
                                ${currentPage === 1
                                    ? 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#1E1E1E] to-[#121212] text-white hover:from-purple-600 hover:to-blue-600 hover:text-white hover:scale-105 border border-purple-500/20'
                                } border-r border-purple-500/20 focus:z-20 focus:outline-none transform transition-transform shadow-lg`}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Previous</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Page Numbers */}
                        <div className="hidden sm:flex">
                            {/* Generate pagination numbers with ellipsis for large page counts */}
                            {(() => {
                                const pageNumbers = [];
                                const maxPagesToShow = 5;

                                if (totalPages <= maxPagesToShow) {
                                    // Show all pages if there are few
                                    for (let i = 1; i <= totalPages; i++) {
                                        pageNumbers.push(i);
                                    }
                                } else {
                                    // Complex pagination with ellipsis
                                    if (currentPage <= 3) {
                                        // Near the start
                                        for (let i = 1; i <= 4; i++) {
                                            pageNumbers.push(i);
                                        }
                                        pageNumbers.push('ellipsis');
                                        pageNumbers.push(totalPages);
                                    } else if (currentPage >= totalPages - 2) {
                                        // Near the end
                                        pageNumbers.push(1);
                                        pageNumbers.push('ellipsis');
                                        for (let i = totalPages - 3; i <= totalPages; i++) {
                                            pageNumbers.push(i);
                                        }
                                    } else {
                                        // Middle
                                        pageNumbers.push(1);
                                        pageNumbers.push('ellipsis');
                                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                            pageNumbers.push(i);
                                        }
                                        pageNumbers.push('ellipsis');
                                        pageNumbers.push(totalPages);
                                    }
                                }

                                return pageNumbers.map((pageNumber, index) => {
                                    if (pageNumber === 'ellipsis') {
                                        return (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="relative inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-400 bg-gradient-to-r from-[#1E1E1E] to-[#121212] border border-purple-500/20"
                                            >
                                                ...
                                            </span>
                                        );
                                    }

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => paginate(pageNumber)}
                                            className={`relative inline-flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-300
                                                ${currentPage === pageNumber
                                                    ? 'z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                                                    : 'bg-gradient-to-r from-[#1E1E1E] to-[#121212] text-white hover:from-purple-600/70 hover:to-blue-600/70 hover:scale-105 border border-purple-500/20'
                                                } border-r border-purple-500/20 focus:z-20 focus:outline-none transform transition-transform shadow-lg`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                });
                            })()}
                        </div>

                        {/* Mobile Pagination - Just show current page */}
                        <div className="flex sm:hidden">
                            <span className="relative inline-flex items-center px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white border-r border-purple-500/20 shadow-lg shadow-purple-500/20">
                                {currentPage} / {totalPages}
                            </span>
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            className={`relative px-4 py-2.5 rounded-r-md text-sm font-medium transition-all duration-300
                                ${currentPage === totalPages
                                    ? 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#1E1E1E] to-[#121212] text-white hover:from-purple-600 hover:to-blue-600 hover:text-white hover:scale-105 border border-purple-500/20'
                                } focus:z-20 focus:outline-none transform transition-transform shadow-lg`}
                            disabled={currentPage === totalPages}
                        >
                            <span className="sr-only">Next</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
