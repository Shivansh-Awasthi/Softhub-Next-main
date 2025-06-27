'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LiveCounter } from './components/Counter/LiveCounter';
import { LuAppWindowMac } from "react-icons/lu";
import { FaAndroid } from "react-icons/fa";
import { FaPlaystation } from "react-icons/fa";

const images = [
    'https://img.playbook.com/NzGgc9TjLeq_Ic9CZ4VLwiUBrK82Gigj4VqjhcTTlwE/Z3M6Ly9wbGF5Ym9v/ay1hc3NldHMtcHVi/bGljLzIwYTYzOTJj/LWEyNWUtNDdjYy05/Y2E5LWFjMmQ2ZGQy/YmRkNw',
    'https://img.playbook.com/fEFoQgs0r1pXKzOJcJIfIevmy08UHSLlInS1-Fcp8uc/Z3M6Ly9wbGF5Ym9v/ay1hc3NldHMtcHVi/bGljL2RkZGUzOTQ1/LTQwNzMtNDMxNy05/N2QyLTk3OTJkNDFi/OTBlNQ',
    'https://img.playbook.com/Z_dmnLQyanAMg7VIdnAATqzc7KTX-op4jBsdjexfxWk/Z3M6Ly9wbGF5Ym9v/ay1hc3NldHMtcHVi/bGljLzk5NTkyOWI1/LWE3YWQtNGUyZS1h/YWJmLWFiZTU3ZDE5/YTI4Nw',
    'https://img.playbook.com/X0CxPl24l4RbK0kdRTk7NAtbQVW_5S9PYB05cE4vFZk/Z3M6Ly9wbGF5Ym9v/ay1hc3NldHMtcHVi/bGljLzM1MThlMDAx/LTNiYWQtNGQxZS1i/OWQ0LTY1MmM5MWQx/OTU4Yw'
];

const HomeClient = ({
    macGames,
    macSoftwares,
    pcGames,
    androidGames,
    ps2Games,
    totalMacGames,
    totalMacSoft,
    totalPcGames,
    totalAndroidGames,
    totalPs2Iso
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const pathname = usePathname();

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

    // Function to get days since creation/update
    const getDaysSince = (createdAt, updatedAt) => {
        const now = new Date();
        const gameCreatedAt = new Date(createdAt);
        const gameUpdatedAt = new Date(updatedAt);

        // Use the more recent date (created or updated)
        const mostRecentDate = gameUpdatedAt > gameCreatedAt ? gameUpdatedAt : gameCreatedAt;
        const diffTime = Math.abs(now - mostRecentDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    // For count visitors accessible/visible only for the admins
    const [isAdmin, setIsAdmin] = useState(false);

    // Check the role in localStorage on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('role');
            if (role === 'ADMIN') {
                setIsAdmin(true); // If the role is "ADMIN", set state to true
            }
        }
    }, []);

    const createSlug = (text = '') => {
        // First ensure we have a string
        const str = String(text || '');

        return str
            .toLowerCase() // Convert to lowercase
            .trim() // Remove whitespace from both ends
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars (except hyphens)
            .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-+/, '') // Remove leading hyphens
            .replace(/-+$/, '') // Remove trailing hyphens
            || 'untitled'; // Fallback if empty
    };

    return (
        <div className="relative">
            {/* Background decorative elements */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-purple-600 opacity-5 rounded-full blur-3xl -z-10"></div>
            <div className="fixed bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-600 opacity-5 rounded-full blur-3xl -z-10"></div>
            <div className="fixed top-1/3 left-1/4 w-64 h-64 bg-purple-600 opacity-5 rounded-full blur-3xl -z-10"></div>

            {/* Decorative grid lines */}
            <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTMwIDMwaDMwVjBoLTMwdjMwek0wIDMwaDMwdjMwSDB2LTMweiIgZmlsbD0iIzJkMmQyZCIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] bg-center opacity-40 -z-10"></div>

            {/* Slider Logic */}
            <div id="default-carousel" className="relative w-full mb-16" data-carousel="slide">
                {/* Carousel Container */}
                <div className="relative h-56 sm:h-72 md:h-88 lg:h-[25rem] overflow-hidden rounded-xl shadow-lg border border-purple-600/20 bg-gradient-to-br from-[#1E1E1E]/50 to-[#121212]/50">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`transition-opacity duration-700 ease-in-out absolute inset-0 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            <img src={image} className="block w-full h-full object-cover" alt={`Slide ${index + 1}`} />

                            {/* Overlay text and button on the 4th image (index === 0) */}
                            {index === 3 && (
                                <div className="absolute inset-0 flex flex-col text-white p-8 ml-6 mt-4 md:p-0 md:ml-20 md:mt-28 z-0 w-full ">
                                    <h2 className="text-lg font-thin mb-4 sm:text-base md:text-lg">SOFTWARE</h2>
                                    <p className="mb-4 font-semibold sm:text-sm md:text-base overflow-hidden whitespace-nowrap text-ellipsis">Download Free Softwares On Your Mac</p>
                                    <div className='w-fill'>
                                        <Link href="/category/mac/softwares">
                                            <button className="mx-auto ml-0 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 sm:px-4 sm:py-2 md:px-6 md:py-3 overflow-hidden whitespace-nowrap text-ellipsis">
                                                Download Now
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Overlay text and button on the 4th image (index === 3) */}
                            {index === 0 && (
                                <div className="absolute inset-0 flex flex-col text-white p-8 ml-6 mt-4 md:p-0 md:ml-20 md:mt-28 z-0">
                                    <h2 className="text-lg font-base mb-4 sm:text-base md:text-lg">Exclusive Games</h2>
                                    <p className="mb-6 font-semibold sm:text-sm md:text-base overflow-hidden whitespace-nowrap text-ellipsis">To get our Exclusive Mac games Messege on my <a href="https://t.me/n0t_ur_type" className='text-cyan-500' target='_blank'>Telegram</a></p>
                                    <div className='w-fill'>
                                        <a href="https://t.me/n0t_ur_type" target='_blank' rel="noopener noreferrer">
                                            <button className="mx-auto ml-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 sm:px-4 sm:py-2 md:px-6 md:py-3 overflow-hidden whitespace-nowrap text-ellipsis">
                                                Send message..
                                            </button>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Overlay text and button on the 4th image (index === 2) */}
                            {index === 1 && (
                                <div className="absolute inset-0 flex flex-col text-white p-8 ml-6 mt-4 md:p-0 md:ml-20 md:mt-28 z-0">
                                    <h2 className="text-lg font-thin mb-4 sm:text-base md:text-lg">Macbook Games</h2>
                                    <p className="mb-6 font-semibold sm:text-sm md:text-base overflow-hidden whitespace-nowrap text-ellipsis">Download Your Favourite Games for Free.</p>
                                    <div className='w-fill'>
                                        <Link href="/category/mac/games">
                                            <button className="mx-auto ml-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 sm:px-4 sm:py-2 md:px-6 md:py-3 overflow-hidden whitespace-nowrap text-ellipsis">
                                                Download Now..
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Overlay text and button on the 4th image (index === 3) */}
                            {index === 2 && (
                                <div className="absolute inset-0 flex flex-col text-white p-8 ml-6 mt-4 md:p-0 md:ml-20 md:mt-28 z-0">
                                    <h2 className="text-lg font-thin mb-4 sm:text-base md:text-lg">TELEGRAM CHAT</h2>
                                    <p className="mb-6 font-semibold sm:text-sm md:text-base overflow-hidden whitespace-nowrap text-ellipsis">Join Our Channel @freemacgames</p>
                                    <div className='w-fill'>
                                        <a href="https://t.me/freemacgames" target="_blank" rel="noopener noreferrer">
                                            <button className="mx-auto ml-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 sm:px-4 sm:py-2 md:px-6 md:py-3 overflow-hidden whitespace-nowrap text-ellipsis">
                                                Join our Telegram
                                            </button>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Pagination Dots */}
                <div className="absolute flex space-x-3 bottom-7 left-1/2 transform -translate-x-1/2 z-20">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 w-6 shadow-lg'
                                : 'bg-white/50 hover:bg-white/80'
                                }`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>

                {/* Previous Button */}
                <button
                    type="button"
                    className="absolute top-1/2 -translate-y-1/2 left-4 z-20"
                    onClick={() => setCurrentIndex((currentIndex - 1 + images.length) % images.length)}
                >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-gradient-to-l hover:from-purple-600/80 hover:to-blue-600/80 border border-purple-500/30 transition-all duration-300 shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </span>
                </button>

                {/* Next Button */}
                <button
                    type="button"
                    className="absolute top-1/2 -translate-y-1/2 right-4 z-20"
                    onClick={() => setCurrentIndex((currentIndex + 1) % images.length)}
                >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple-600/80 hover:to-blue-600/80 border border-purple-500/30 transition-all duration-300 shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white"
                        >
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </span>
                </button>
            </div>

            <div>
                {/* This div will be visible based on the role */}
                <div style={{ display: isAdmin ? 'block' : 'none' }}>
                    <LiveCounter />
                </div>
            </div>


            {/* Mac Games Category */}
            <div className="container mx-auto p-2 mb-6">
                <div className="cover mb-8 flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-10 blur-xl -z-10 -translate-y-1/2"></div>
                    <h2 className="text-2xl font-bold relative">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            Mac Games{' '}
                            <span className="font-medium text-blue-400">{totalMacGames}</span>
                        </span>
                        <span className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
                    </h2>
                    <Link
                        href="/category/mac/games"
                        className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center"
                    >
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* Conditional rendering based on data existence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
                    {Array.isArray(macGames) && macGames.length > 0 ? (
                        macGames.slice(-8).reverse().map((ele) => (
                            <Link
                                key={ele._id}
                                href={`/download/${createSlug(ele.platform)}/${createSlug(ele.title)}/${ele._id}`}
                                className="group flex flex-col rounded-xl h-52 overflow-hidden transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl border border-purple-600/20 relative"
                            >
                                {/* Ambient background elements - always visible */}
                                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                                {/* Subtle overlay gradient for better text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

                                <figure className="flex justify-center items-center rounded-t-xl overflow-hidden h-full">
                                    <img
                                        src={ele.coverImg}
                                        alt={ele.title}
                                        className="w-full h-full object-cover rounded-t-xl transition-transform duration-700 ease-in-out transform group-hover:scale-110"
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

                                <div className="flex flex-col p-3 bg-gradient-to-br from-[#1E1E1E] to-[#121212] flex-grow relative">
                                    {/* Glowing separator line */}
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-600/20 to-transparent"></div>

                                    <div className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white pb-2 overflow-hidden whitespace-nowrap text-ellipsis group-hover:from-blue-400 group-hover:to-purple-400 transition-colors duration-300">
                                        {ele.title}
                                    </div>
                                    <div className="text-xs font-normal text-gray-400 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        </svg>
                                        {ele.size}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center text-gray-500">Loading Mac Games...</div> // Loading state
                    )}
                </div>
            </div>

            {/* Mac Softwares */}
            <div className='container mx-auto p-2 mb-6'>
                <div className="cover mb-8 flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-10 blur-xl -z-10 -translate-y-1/2"></div>
                    <h2 className="text-2xl font-bold relative">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            Mac Softwares{' '}
                            <span className="font-medium text-blue-400">{totalMacSoft}</span>
                        </span>
                        <span className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
                    </h2>
                    <Link
                        href="/category/mac/softwares"
                        className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center"
                    >
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* Conditional rendering for Mac Softwares */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.isArray(macSoftwares) && macSoftwares.length > 0 ? (
                        macSoftwares.slice(0, 8).map((ele) => (
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
                        ))
                    ) : (
                        <div className="text-center text-gray-500">Loading Mac Softwares...</div> // Loading state
                    )}
                </div>
            </div>

            {/* PC Games */}
            <div className='container mx-auto p-2 mb-6'>
                <div className="cover mb-8 flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-10 blur-xl -z-10 -translate-y-1/2"></div>
                    <h2 className="text-2xl font-bold relative">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            PC Games{' '}
                            <span className="font-medium text-blue-400">{totalPcGames}</span>
                        </span>
                        <span className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
                    </h2>
                    <Link
                        href="/category/pc/games"
                        className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center"
                    >
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
                    {/* Check if pcGames is an array and has items */}
                    {Array.isArray(pcGames) && pcGames.length > 0 ? (
                        pcGames.slice(0, 8).map((ele) => (
                            <Link
                                key={ele._id}
                                href={`/download/${createSlug(ele.platform)}/${createSlug(ele.title)}/${ele._id}`}
                                className="group flex flex-col rounded-xl h-52 overflow-hidden transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl border border-purple-600/20 relative"
                            >
                                {/* Ambient background elements - always visible */}
                                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                                {/* Subtle overlay gradient for better text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

                                <figure className="flex justify-center items-center rounded-t-xl overflow-hidden h-full">
                                    <img
                                        src={ele.coverImg}
                                        alt={ele.title}
                                        className="w-full h-full object-cover rounded-t-xl transition-transform duration-700 ease-in-out transform group-hover:scale-110"
                                    />
                                </figure>

                                {/* Game platform badge */}
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md z-20 border border-purple-600/20">
                                    <div className="text-[10px] font-medium text-blue-400 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                            <rect width="14" height="8" x="5" y="2" rx="2" />
                                            <rect width="20" height="8" x="2" y="14" rx="2" />
                                            <path d="M6 18h2" />
                                            <path d="M12 18h6" />
                                        </svg>
                                        PC
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

                                <div className="flex flex-col p-3 bg-gradient-to-br from-[#1E1E1E] to-[#121212] flex-grow relative">
                                    {/* Glowing separator line */}
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-600/20 to-transparent"></div>

                                    <div className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white pb-2 overflow-hidden whitespace-nowrap text-ellipsis group-hover:from-blue-400 group-hover:to-purple-400 transition-colors duration-300">
                                        {ele.title}
                                    </div>
                                    <div className="text-xs font-normal text-gray-400 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        </svg>
                                        {ele.size}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center text-gray-500">Loading PC Games...</div> // Loading state
                    )}
                </div>
            </div>

            {/* Android Games */}
            <div className='container mx-auto p-2 mb-6'>
                <div className="cover mb-8 flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-10 blur-xl -z-10 -translate-y-1/2"></div>
                    <h2 className="text-2xl font-bold relative">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            Android Games{' '}
                            <span className="font-medium text-blue-400">{totalAndroidGames}</span>
                        </span>
                        <span className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
                    </h2>
                    <Link
                        href="/category/android/games"
                        className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center"
                    >
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Check if androidGames is an array and has items */}
                    {Array.isArray(androidGames) && androidGames.length > 0 ? (
                        androidGames.slice(0, 8).map((ele) => (
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

                                    {/* Android platform badge */}
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md z-20 border border-purple-600/20">
                                        <div className="text-[10px] font-medium text-blue-400 flex items-center">
                                            <FaAndroid className='mr-2' />
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
                        ))
                    ) : (
                        <div className="text-center text-gray-500">Loading Android Games...</div> // Loading state
                    )}
                </div>
            </div>

            {/* PS2 Roms */}
            <div className='container mx-auto p-2 mb-6'>
                <div className="cover mb-8 flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-10 blur-xl -z-10 -translate-y-1/2"></div>
                    <h2 className="text-2xl font-bold relative">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            PS2 Roms{' '}
                            <span className="font-medium text-blue-400">{totalPs2Iso}</span>
                        </span>
                        <span className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></span>
                    </h2>
                    <Link
                        href="/category/ps2/iso"
                        className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center"
                    >
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Check if ps2Games is an array and has items */}
                    {Array.isArray(ps2Games) && ps2Games.length > 0 ? (
                        ps2Games.slice(0, 8).map((ele) => (
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

                                    {/* PS2 platform badge */}
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md z-20 border border-purple-600/20">
                                        <div className="text-[10px] font-medium text-blue-400 flex items-center">
                                            <FaPlaystation className='mr-1' />
                                            PS2
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
                        ))
                    ) : (
                        <div className="text-center text-gray-500">Loading PS2 Roms...</div> // Loading state
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeClient;
