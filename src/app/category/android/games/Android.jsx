'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import EnhancedPagination from '@/app/components/Pagination/EnhancedPagination';
import { FaAndroid } from "react-icons/fa6";

export default function Android({ initialData = { apps: [], total: 0 }, initialPage = 1 }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState(initialData.apps || []);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalItems, setTotalItems] = useState(initialData.total || 0);
    const itemsPerPage = 48;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Calculate total pages
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 1;

    // Update state when props change
    useEffect(() => {
        setData(initialData.apps || []);
        setTotalItems(initialData.total || 0);

        // Update current page from URL if it changes
        const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
        if (pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl);
        }
    }, [initialData, searchParams, currentPage]);

    // Handle page change
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);

        // Navigate to the new page
        router.push(`/category/android/games?page=${newPage}`);
    };

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

    const createSlug = (title) => {
        return title
            .toLowerCase() // Convert to lowercase
            .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .trim(); // Remove trailing spaces
    };

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
                        Android Games{' '}
                        <span className="font-medium text-blue-400">{totalItems}</span>
                    </span>
                    <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
                </h1>

            </div>

            {loading ? (
                <p className="text-center">Loading...</p>
            ) : error ? (
                <p className="text-red-500 text-center">{error}</p>
            ) : data.length === 0 ? (
                <p className="text-center">No Android games found.</p>
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
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25"></div>
                                    <img
                                        src={ele.thumbnail[0]}
                                        alt={ele.title}
                                        className="relative rounded-full w-16 h-16 transition-transform duration-700 ease-in-out transform group-hover:scale-110 border border-purple-500/20 z-10"
                                    />
                                </div>

                                {/* Game platform badge */}
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md z-20 border border-purple-600/20">
                                    <div className="text-[10px] font-medium text-blue-400 flex items-center">
                                        <FaAndroid className='mr-1' />
                                        Android
                                    </div>
                                </div>

                                {/* NEW badge for games within 2 days */}
                                {isGameNew(ele.createdAt, ele.updatedAt) && (
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
