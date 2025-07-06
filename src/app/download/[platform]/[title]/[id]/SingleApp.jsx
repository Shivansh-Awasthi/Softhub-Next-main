'use client';

import React, { useCallback, useEffect, useState } from 'react';
import GiscusComments from './GiscusComments';
import GameAnnouncement from './GameAnnouncement';
import DownloadSection from './DownloadSection';
import DescriptionTabs from './DescriptionTabs';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Link from 'next/link';

const SingleApp = ({ appData }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [data, setData] = useState(appData);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [hasAccess, setHasAccess] = useState(null); // Start with null (loading)
    const [userData, setUserData] = useState(null);
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);

    // Robust user data fetching with API + JWT fallback
    const fetchUserData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const xAuthToken = process.env.NEXT_PUBLIC_API_TOKEN;

            if (!token) {
                setUserData(null);
                return null;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                ...(xAuthToken && { 'X-Auth-Token': xAuthToken })
            };

            let userData;
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
                    { headers }
                );
                userData = res.data?.user || null;
            } catch (backendError) {
                // Fallback to JWT decode if backend fails
                try {
                    const decoded = jwtDecode(token);
                    userData = {
                        username: decoded.username || decoded.name || "User",
                        email: decoded.email || "",
                        avatar: decoded.avatar || "https://ui-avatars.com/api/?name=U&background=random",
                        purchasedGames: decoded.purchasedGames || [],
                        createdAt: decoded.iat ? new Date(decoded.iat * 1000) : undefined,
                        role: decoded.role || 'USER',
                        isAdmin: decoded.role === 'ADMIN',
                        isMod: decoded.role === 'MOD',
                        isPremium: decoded.role === 'PREMIUM',
                    };
                } catch (decodeError) {
                    console.error("Failed to decode token:", decodeError);
                    userData = null;
                }
            }

            return userData;
        } catch (error) {
            console.error("User fetch error:", error);
            return null;
        }
    }, []);

    // Main function to load user data and check access
    const loadUserDataAndCheckAccess = useCallback(async () => {
        setIsCheckingAccess(true);
        try {
            const user = await fetchUserData();
            // Ensure isAdmin is always a boolean
            if (user) {
                user.isAdmin = user.role === 'ADMIN';
                user.isMod = user.role === 'MOD';
                user.isPremium = user.role === 'PREMIUM';
            }
            setUserData(user);

            if (user) {
                const { isAdmin, isMod, isPremium } = user;
                const hasPurchased = user.purchasedGames?.map(String).includes(String(appData._id));
                const shouldHaveAccess = isAdmin || isMod || isPremium || !appData.isPaid || hasPurchased;

                setHasAccess(shouldHaveAccess);
            } else {
                // No user = guest
                setHasAccess(!appData.isPaid);
            }
        } catch (error) {
            console.error("Access check error:", error);
            setHasAccess(false);
        } finally {
            setIsCheckingAccess(false);
        }
    }, [appData, fetchUserData]);

    // Initial load and event listeners
    useEffect(() => {
        loadUserDataAndCheckAccess();

        const handleAuthChange = () => loadUserDataAndCheckAccess();
        const handlePurchaseEvent = () => loadUserDataAndCheckAccess();

        window.addEventListener('auth-change', handleAuthChange);
        window.addEventListener('purchase-completed', handlePurchaseEvent);

        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
            window.removeEventListener('purchase-completed', handlePurchaseEvent);
        };
    }, [loadUserDataAndCheckAccess]);

    // Slide handling functions
    const nextSlide = () => {
        if (data?.thumbnail && data.thumbnail.length > 1) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % (data.thumbnail.length - 1));
        }
    };

    const prevSlide = () => {
        if (data?.thumbnail && data.thumbnail.length > 1) {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + (data.thumbnail.length - 1)) % (data.thumbnail.length - 1));
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}.${month}.${year}`;
    };

    // Function to handle body scroll locking
    const lockScroll = () => {
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '15px';
        }
    };

    const unlockScroll = () => {
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    };

    const handleDownloadClick = () => {
        setShowModal(true);
        lockScroll();
    };

    const closeModal = () => {
        setShowModal(false);
        unlockScroll();
    };

    // Clean up scroll lock when component unmounts
    useEffect(() => {
        return () => {
            unlockScroll();
        };
    }, []);

    // Loading state
    if (isCheckingAccess || hasAccess === null) {
        return (
            <div className="flex justify-center items-center h-[40rem]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                    <h1 className="text-xl text-gray-300">Checking access...</h1>
                </div>
            </div>
        );
    }

    // If there's an error, show an error message
    if (error) {
        return (
            <div className="flex justify-center items-center h-[40rem]">
                <h1 className="text-2xl text-red-500">{error}</h1>
            </div>
        );
    }

    // If the app is paid and the user doesn't have access
    if (!hasAccess) {
        return (
            <div className="flex justify-center items-center h-[40rem]">
                <div className="text-center p-8 bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-xl border border-purple-600/20 max-w-md">
                    <div className="mb-6">
                        <div className="bg-red-500/20 p-4 rounded-full inline-block">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-red-400 mb-4">Access Restricted</h1>
                    <p className="text-gray-300 mb-6">
                        {appData.isPaid
                            ? "This is a premium app. Please purchase it to access the download."
                            : "You don't have permission to access this content."
                        }
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/membership"
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                        >
                            Get Membership
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-300"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }




    return (
        <div style={{ position: 'relative' }}>
            {/* Admin Edit Floating Button */}
            {userData?.isAdmin || userData.isMod && (
                <button
                    className="absolute top-8 right-8 z-[100] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-3 rounded-full shadow-xl font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 pointer-events-auto"
                    style={{
                        boxShadow: '0 4px 24px 0 rgba(80, 0, 200, 0.18)',
                        position: 'absolute',
                        top: '2rem',
                        right: '2rem',
                        zIndex: 100
                    }}
                    onClick={() => window.location.href = `/admin/apps/update/${data._id}`}
                    title="Edit this app"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7l1 1" />
                    </svg>
                    Edit
                </button>
            )}
            <div className='flex flex-wrap flex-col xl:flex-row px-2 justify-center xl:items-start items-center'>
                {/* Left Content */}
                <div className="flex-1">
                    {/* Card */}
                    <div className="flex pb-3 flex-grow flex-col rounded-lg ">
                        <div className="flex items-center gap-4 text-slate-800 gap-3 sm:gap-5 bg-gradient-to-r from-[#1E1E1E] to-[#121212] p-4 rounded-xl border border-purple-600/20 ">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25"></div>
                                <img
                                    src={data.thumbnail && data.thumbnail[0] ? data.thumbnail[0] : "https://via.placeholder.com/58"}
                                    alt={data.title}
                                    className="relative h-[48px] w-[48px] sm:h-[58px] sm:w-[58px] rounded-lg object-cover object-center border border-purple-500/20"
                                />
                            </div>
                            <div className="flex w-full flex-col overflow-hidden">
                                <div className="w-full flex items-center justify-between overflow-hidden">
                                    <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 text-base sm:text-xl md:text-xl lg:text-3xl font-bold overflow-hidden text-ellipsis truncate max-w-full whitespace-normal md:whitespace-nowrap">
                                        {data.title}
                                    </h1>
                                </div>
                                <p className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] text-gray-300 uppercase font-medium mt-0.5 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-purple-400">
                                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                                        <path d="M12 18h.01" />
                                    </svg>
                                    {data.platform}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Slider Logic */}
                    {data.thumbnail && data.thumbnail.length > 1 && (
                        <div id="default-carousel" className="flex relative w-full max-w-full mt-6">
                            <div className="relative bg-gradient-to-br from-[#1E1E1E] to-[#121212] w-full h-[13rem] sm:h-[19rem] md:h-[20rem] lg:h-[26rem] overflow-hidden rounded-xl border border-purple-600/20 shadow-lg">
                                {/* Ambient background elements */}
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                                {data.thumbnail.slice(1).map((image, index) => (
                                    <div key={index} className={`transition-all duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden'} h-full`}>
                                        <img
                                            src={image}
                                            className="block w-full h-full object-cover rounded-lg"
                                            alt={`Slide ${index + 2}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Slider indicators */}
                            <div className="absolute flex -translate-x-1/2 bottom-4 left-1/2 space-x-2 overflow-hidden max-w-full justify-center">
                                {data.thumbnail.slice(1).map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-125'
                                            : 'bg-gray-600 hover:bg-gray-500'
                                            }`}
                                        aria-current={index === currentIndex}
                                        aria-label={`Slide ${index + 2}`}
                                        onClick={() => setCurrentIndex(index)}
                                    />
                                ))}
                            </div>

                            {/* Slider controls */}
                            <button
                                type="button"
                                className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 flex items-center justify-center w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 cursor-pointer transition-all duration-300 focus:outline-none"
                                onClick={prevSlide}
                                aria-label="Previous slide"
                            >
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
                            </button>
                            <button
                                type="button"
                                className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 flex items-center justify-center w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 cursor-pointer transition-all duration-300 focus:outline-none"
                                onClick={nextSlide}
                                aria-label="Next slide"
                            >
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
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Card */}
                <div className="w-full max-w-[24rem] mx-auto xl:ml-6 px-7 py-7 bg-gradient-to-br from-[#23233a] via-[#181828] to-[#12121a] rounded-2xl shadow-2xl mt-6 xl:mt-[8.1rem] border border-purple-600/30 relative overflow-hidden flex flex-col justify-between xl:h-[26rem] lg:h-[26rem] min-h-[26rem] transition-all duration-300">
                    {/* Ambient background elements */}
                    <div className="absolute -top-12 -left-12 w-44 h-44 bg-purple-600 opacity-15 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-blue-600 opacity-15 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex-1 overflow-auto custom-scrollbar">
                        <div className="grid grid-cols-1 gap-5">
                            {/* Platform */}
                            <div>
                                <div className="flex items-center mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-2">
                                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                                        <path d="M12 18h.01" />
                                    </svg>
                                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform</h2>
                                </div>
                                <p className="text-sm text-gray-100 ml-6 font-medium">{data.platform}</p>
                            </div>
                            {/* Interface Language */}
                            {/* <div>
                                <div className="flex items-center mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-2">
                                        <path d="m5 8 6 6" />
                                        <path d="m4 14 6-6 2 2 6-6" />
                                        <path d="M2 5h12" />
                                        <path d="M7 2h1" />
                                    </svg>
                                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interface language</h2>
                                </div>
                                <p className="text-sm text-gray-100 ml-6 font-medium">English, Russian, German, Chinese...</p>
                            </div> */}
                            {/* Tested */}
                            <div>
                                <div className="flex items-center mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-2">
                                        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                                        <path d="m15 9-6 6" />
                                        <path d="m9 9 6 6" />
                                    </svg>
                                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tested</h2>
                                </div>
                                <p className="text-sm text-gray-100 ml-6 font-medium">
                                    {data.platform === "Mac" && "Mac Air M1"}
                                    {data.platform === "PC" && "PC"}
                                    {data.platform === "Android" && "Android device"}
                                    {data.platform === "Playstation" && "PC (Emulator)"}
                                </p>
                            </div>
                            {/* Size */}
                            <div>
                                <div className="flex items-center mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-2">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    </svg>
                                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Size</h2>
                                </div>
                                <p className="text-sm text-gray-100 ml-6 font-medium">{data.size}</p>
                            </div>
                            {/* Updated at */}
                            <div>
                                <div className="flex items-center mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Updated at</h2>
                                </div>
                                <p className="text-sm text-gray-100 ml-6 font-medium">{formatDate(data.updatedAt)}</p>
                            </div>
                            {/* Architecture */}
                            <div>
                                <div className="flex items-center mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-2">
                                        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                                        <path d="M12 18h.01" />
                                    </svg>
                                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Architecture</h2>
                                </div>
                                <p className="text-sm text-gray-100 ml-6 font-medium">{data.architecture && String(data.architecture).trim() !== '' ? data.architecture : (data.platform === 'Mac' ? 'Port' : data.platform === 'PC' ? 'Native' : '')}</p>
                            </div>
                        </div>
                    </div>
                    <div className='pt-2 pb-1 mt-2 relative z-10'>
                        <button
                            className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 w-full text-center pb-1 rounded-xl text-base font-bold uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                            onClick={handleDownloadClick}
                        >
                            <div className="flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Free Download ({data.size})
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Description/Installation Section */}
            <DescriptionTabs data={data} />

            {/* Modal for Download Instructions */}
            {showModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center backdrop-blur-md overflow-hidden"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 2000,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)'
                    }}
                    onClick={(e) => {
                        // Close modal when clicking outside of modal content
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className="bg-gradient-to-br from-[#1E1E1E] to-[#121212] px-6 sm:px-12 lg:px-24 py-6 sm:py-8 rounded-xl w-full max-w-4xl mx-auto text-center my-auto max-h-[90vh] overflow-y-auto border border-purple-600/20 shadow-2xl"
                        style={{ position: 'relative', zIndex: 2001 }}
                    >
                        {/* Close Icon */}
                        <div
                            className="absolute top-4 right-4 cursor-pointer bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all duration-300"
                            onClick={closeModal}
                        >
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
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-3">Installation Instructions</h3>

                        {/* For MAC games*/}
                        {data.category?.name === 'mac' && (
                            <div>
                                <div className="bg-[#0F0F0F] p-6 rounded-xl border border-purple-500/20 shadow-lg mb-6">
                                    <div className="flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-2">
                                            <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
                                            <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                                            <path d="M12 2v2"></path>
                                            <path d="M12 22v-2"></path>
                                            <path d="m17 20.66-1-1.73"></path>
                                            <path d="M11 10.27 7 3.34"></path>
                                            <path d="m20.66 17-1.73-1"></path>
                                            <path d="m3.34 7 1.73 1"></path>
                                            <path d="M14 12h8"></path>
                                            <path d="M2 12h2"></path>
                                            <path d="m20.66 7-1.73 1"></path>
                                            <path d="m3.34 17 1.73-1"></path>
                                            <path d="m17 3.34-1 1.73"></path>
                                            <path d="m7 20.66 1-1.73"></path>
                                        </svg>
                                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">MAC INSTALLATION</h2>
                                    </div>
                                    <div className="space-y-3 text-left">
                                        <p className="text-sm sm:text-base text-gray-200">1. Run the downloaded image and drag the application to the Applications folder shortcut.</p>
                                        <p className="text-sm sm:text-base text-gray-200">2. Once copying is complete, the application can be launched via Launchpad.</p>
                                        <div className="bg-black/30 p-4 rounded-lg mt-4 border-l-2 border-yellow-500">
                                            <p className='text-white text-sm'>If the application shows <span className='text-yellow-400 font-medium'>"The app is damaged and can't be opened. You should move it to the bin"</span> then visit our <a className='text-blue-400 hover:text-blue-300 transition-colors font-medium' href="https://toxicgames.in/faq">FAQ </a>page and refer that video.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Check if announcement is not empty and has enough data */}
                                {data?.announcement && <GameAnnouncement announcements={data.announcement} />}

                                <div className='flex flex-wrap justify-center items-center mt-6 p-3 bg-blue-900/10 rounded-lg border border-blue-800/20'>
                                    <span className="text-gray-300 text-sm mr-2">Need help?</span>
                                    <a
                                        href="https://vimeo.com/1030290869?share=copy"
                                        target='_blank'
                                        className='flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polygon points="10 8 16 12 10 16 10 8"></polygon>
                                        </svg>
                                        Watch Installation Video
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* For Software MAC */}
                        {data.category?.name === 'smac' && (
                            <div>
                                <div>
                                    <h2 className="mt-3 text-[#8E8E8E] hover:underline text-lg sm:text-xl">Software MAC</h2>
                                    <p className="mt-1 text-sm sm:text-base">Follow the instructions to mount the image, then drag the application to the Applications folder.</p>
                                    <p className="text-sm sm:text-base">This version may require additional configurations for certain users.</p>
                                </div>

                                {/* Check if announcement is not empty */}
                                {data?.announcement && <GameAnnouncement announcements={data.announcement} />}
                            </div>
                        )}

                        {/* For PC */}
                        {data.category?.name === 'pc' && (
                            <div>
                                <div>
                                    <h2 className="mt-3 text-[#8E8E8E] hover:underline text-lg sm:text-xl">PC</h2>
                                    <p className="mt-1 text-sm sm:text-base">Game is pre-installed / portable, therefore you do not need to install the game.</p>
                                    <p className='text-green-500 text-base'>Just extract the <span className='text-yellow-500'>rar / zip file</span> and lauch the game directly from it's  <span className='text-yellow-500'>exe</span>.</p>
                                </div>

                                {/* Check if announcement is not empty */}
                                {data?.announcement && <GameAnnouncement announcements={data.announcement} />}
                            </div>
                        )}

                        {/* For Software PC */}
                        {data.category?.name === 'spc' && (
                            <>
                                <h2 className="mt-3 text-[#8E8E8E] hover:underline text-lg sm:text-xl">Software PC</h2>
                                <p className="mt-1 text-sm sm:text-base">Run the installer and follow the setup process. It might need additional configurations for software compatibility.</p>
                                <p className="text-sm sm:text-base">After installation, the software will be ready to use.</p>
                            </>
                        )}

                        {/* For Android */}
                        {data.category?.name === 'android' && (
                            <div>
                                <div>
                                    <h2 className="mt-3 text-[#8E8E8E] hover:underline text-lg sm:text-xl">Android</h2>
                                    <p className="mt-1 text-sm sm:text-base">Install the APK directly on your Android device.</p>
                                    <p className="text-sm sm:text-base">Ensure that you have enabled installation from unknown sources in your device settings.</p>
                                </div>

                                {/* Check if announcement is not empty */}
                                {data?.announcement && <GameAnnouncement announcements={data.announcement} />}
                            </div>
                        )}

                        {/* For Android Softwares */}
                        {data.category?.name === 'sandroid' && (
                            <>
                                <h2 className="mt-3 text-[#8E8E8E] hover:underline text-lg sm:text-xl">Android</h2>
                                <p className="mt-1 text-sm sm:text-base">Install the APK directly on your Android device.</p>
                                <p className="text-sm sm:text-base">Ensure that you have enabled installation from unknown sources in your device settings.</p>
                            </>
                        )}

                        {/* For PlayStation (ps2, ps3, ps4, ppsspp) */}
                        {['Playstation'].includes(data.platform) && (
                            <div>
                                <div>
                                    <h2 className="mt-3 text-[#8E8E8E] hover:underline text-lg sm:text-xl">PlayStation</h2>
                                    <p className="mt-1 text-sm sm:text-base">For PlayStation, follow the platform-specific instructions to install or load the game on your console.</p>
                                    <p className="text-sm sm:text-base text-yellow-300">To run these on PC, download the appropriate versions of Emulators <a className='text-blue-600 hover:underline' href='https://www.ppsspp.org/download/' target='_blank'>PPSSPP</a>, <a className='text-blue-600 hover:underline' href='https://pcsx2.net/' target='_blank'>PCSX2</a>, or <a className='text-blue-600 hover:underline' href='https://rpcs3.net/download' target='_blank'>RPCS3</a>, and enjoy your gameplay!</p>
                                </div>
                                {/* Check if announcement is not empty */}
                                {data?.announcement && <GameAnnouncement announcements={data.announcement} />}
                            </div>
                        )}

                        <DownloadSection
                            platform={data.platform}
                            downloadLinks={data.downloadLink}
                        />

                        {/* Troubleshooting Section */}
                        <p className="mt-4 text-sm sm:text-base">Doesn't download? Broken file? Doesn't work? Gives an error? How to update?</p>
                        <p className="text-sm sm:text-base">We have collected all the answers on our <a href="https://t.me/downloadmacgames" target='_blank' className='text-cyan-600 text-base hover:underline'>Telegram Group</a>.</p>
                    </div>
                </div>
            )}



            {/* Background image that adapts to different screen sizes */}
            <div
                className="fixed top-0 bottom-0 right-0 left-0"
                style={{
                    background: `linear-gradient(to top right, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) 100%), url('${data.thumbnail[2]}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    opacity: 0.4, // Slightly reduced opacity to make content more visible
                    zIndex: -10,
                    pointerEvents: 'none', // Allows interaction with elements above this
                    height: '100vh', // Only cover the viewport height
                    maxHeight: '100vh', // Ensure it doesn't extend beyond viewport
                }}
            >
            </div>



            {/* Comment box */}
            <div className='bg-gradient-to-br from-[#1E1E1E] to-[#121212] border border-purple-600/20 rounded-xl shadow-lg flex flex-col items-center mt-8 mb-4 relative overflow-hidden'>
                {/* Ambient background elements */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                <h2 className='pt-6 mb-8 text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 relative z-10'>Comments</h2>
                <div className='flex justify-center w-full relative z-10'>
                    <GiscusComments objectId={data._id} />
                </div>
            </div>
        </div>
    );
};

export default SingleApp;
