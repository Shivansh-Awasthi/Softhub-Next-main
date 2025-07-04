'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CiSearch } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { CiLock } from "react-icons/ci"; // Lock Icon
import Link from 'next/link';
import { searchApps } from '@/app/actions/searchActions';
import { createSlug, getPlatformColorClass } from '@/app/utils/formatUtils';
import LiveSearchSkeleton from './LiveSearchSkeleton';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=U&background=random";

const ProfileIcon = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.username || decoded.name || "User",
          avatar: decoded.avatar || DEFAULT_AVATAR,
        });
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      // If click is outside dropdown and not on the profile button, close
      if (!e.target.closest('.profile-dropdown') && !e.target.closest('.profile-icon-btn')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  return (
    <div className="relative flex items-center ml-4">
      {/* Request Button (responsive label) */}
      <Link href="/request" className="relative inline-block group mr-2" style={{ marginRight: '24px' }}>
        <div className="relative">
          {/* Shadow layers */}
          <div className="absolute top-1 left-1 w-full h-full bg-black rounded-lg"></div>
          <div className="absolute top-0.5 left-0.5 w-full h-full bg-purple-700 rounded-lg"></div>
          {/* Main button */}
          <div className="relative bg-[#5865F2] rounded-lg p-3 border-4 border-black transform transition-all duration-100 group-hover:-translate-x-1 group-hover:-translate-y-1 active:translate-x-0 active:translate-y-0">
            <div className="flex items-center gap-2">
              {/* Responsive label: full on md+, short on sm */}
              <span className="text-white font-black text-sm uppercase tracking-tight hidden sm:inline">Request Game</span>
              <span className="text-white font-black text-sm uppercase tracking-tight sm:hidden">Request</span>
              {/* Ping effect dot */}
              <div className="relative w-3 h-3">
                <span className="absolute w-full h-full bg-yellow-300 rounded-full animate-ping opacity-75"></span>
                <span className="absolute w-full h-full bg-yellow-300 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      {/* Profile Icon Button or Login Button */}
      {user ? (
        <button
          className="focus:outline-none profile-icon-btn"
          onClick={() => setShowDropdown((v) => !v)}
        >
          <img
            src={user.avatar || DEFAULT_AVATAR}
            alt="avatar"
            className="w-13 h-13 rounded-full border-2 border-blue-400 bg-gray-800 object-cover shadow-lg hover: pointer hover: ring-1 hover:ring-purple-500 transition duration-200"
            onError={e => (e.target.src = DEFAULT_AVATAR)}
          />
        </button>
      ) : (
        <Link href="/login" className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Login</Link>
      )}
      {user && showDropdown && (
        <div className="profile-dropdown absolute right-0 mt-122 w-64 bg-[#181C23] rounded-2xl shadow-2xl py-4 z-50 border border-[#232323] flex flex-col gap-1" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
          <Link href="/profile" onClick={() => setShowDropdown(false)}>
            <span className="block px-6 py-2 text-gray-200 hover:bg-[#232323] cursor-pointer text-base">My profile</span>
          </Link>
          <Link href="/watch-history" onClick={() => setShowDropdown(false)}>
            <span className="block px-6 py-2 text-gray-200 hover:bg-[#232323] cursor-pointer text-base">Watch history</span>
          </Link>
          <Link href="/liked" onClick={() => setShowDropdown(false)}>
            <span className="block px-6 py-2 text-gray-200 hover:bg-[#232323] cursor-pointer text-base">Liked</span>
          </Link>
          <Link href="/watchlist" onClick={() => setShowDropdown(false)}>
            <span className="block px-6 py-2 text-gray-200 hover:bg-[#232323] cursor-pointer text-base">Watchlist</span>
          </Link>
          <div className="border-t border-[#232323] my-2"></div>
          <Link href="/billing" onClick={() => setShowDropdown(false)}>
            <span className="block px-6 py-2 text-gray-200 hover:bg-[#232323] cursor-pointer text-base">Billing</span>
          </Link>
          <Link href="/membership" onClick={() => setShowDropdown(false)}>
            <span className="block px-6 py-2 text-gray-200 hover:bg-[#232323] cursor-pointer text-base">Subscription</span>
          </Link>
          <div className="border-t border-[#232323] my-2"></div>
          <Link href="/settings" onClick={() => setShowDropdown(false)}>
            <span className="block px-6 py-2 text-gray-200 hover:bg-[#232323] cursor-pointer text-base">Settings</span>
          </Link>
          {user && (
            <button
              className="block w-full text-left px-6 py-2 text-red-400 hover:bg-[#232323] cursor-pointer text-base"
              onClick={() => setShowLogoutWarning(true)}
            >
              Logout
            </button>
          )}
        </div>
      )}
      {/* Logout warning card */}
      {showLogoutWarning && (
        <div className="fixed inset-0 flex items-center justify-center z-[300] bg-black/60 backdrop-blur-[8px] transition-all" onClick={() => setShowLogoutWarning(false)}>
          <div className="relative overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-md w-full p-0" onClick={e => e.stopPropagation()}>
            {/* Top Border Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />
            <div className="p-8 sm:p-10">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-2 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Are you sure you want to logout?</div>
                <div className="text-gray-500 dark:text-gray-300 mb-4 text-base">You will need to login again to access your account.</div>
                <div className="flex justify-center gap-4 w-full mt-4">
                  <button
                    className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition-all text-lg"
                    onClick={() => setShowLogoutWarning(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:from-red-600 hover:to-pink-600 transition-all text-lg"
                    onClick={() => {
                      localStorage.removeItem('token');
                      setShowLogoutWarning(false);
                      setShowDropdown(false);
                      setUser(null);
                      window.location.href = '/';
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LiveSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ apps: [], total: 0 });
  const [showResults, setShowResults] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef(null);
  const router = useRouter();

  // User data state
  const [userData, setUserData] = useState({
    purchasedGames: [],
    isAdmin: false
  });

  // Load user data from localStorage on client side


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



  // Handle search input change with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        startTransition(async () => {
          const results = await searchApps(searchQuery, 1, 7);
          setSearchResults(results);
          setShowResults(true);
        });
      } else {
        setSearchResults({ apps: [], total: 0 });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      // Add a timestamp to force a refresh when already on the search page
      const timestamp = Date.now();
      window.location.href = `/search?query=${encodeURIComponent(searchQuery.trim())}&t=${timestamp}`;
      setShowResults(false);
    }
  };

  // Clear search
  const handleClear = () => {
    setSearchQuery('');
    setSearchResults({ apps: [], total: 0 });
    setShowResults(false);
  };

  // We're now using the imported createSlug utility function

  return (
    <div className="w-full">
      {/* Responsive: Search bar on top, buttons below on mobile; side-by-side on md+ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2">
        {/* Search Bar */}
        <div className="flex-1">
          <div
            ref={searchRef}
            className="flex flex-wrap relative ring-1 ring-[#3E3E3E] rounded-lg w-full max-w-[760px] z-20"
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
            {showResults && searchQuery.trim() && (
              <>
                {/* Show skeleton while loading */}
                {isPending ? (
                  <LiveSearchSkeleton itemCount={7} />
                ) : searchResults.apps && searchResults.apps.length > 0 ? (
                  // Show actual results when loaded
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-lg border border-purple-600/20 shadow-lg z-50">
                    {/* Ambient background elements */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                    <ul className="divide-y divide-gray-700/30 relative z-10">
                      {searchResults.apps.map((app) => {
                        // Check if the game is paid and whether the user has purchased it
                        const isPurchased = userData.purchasedGames.includes(app._id);
                        const isUnlocked = userData.isAdmin || !app.isPaid || isPurchased;
                        const isLocked = !isUnlocked;


                        return (
                          <li
                            key={app._id}
                            className={`py-2 px-4 hover:bg-black/20 transition-all duration-200 relative ${isLocked ? 'opacity-30 pointer-events-none' : ''}`}
                          >
                            <Link
                              href={isLocked ? '#' : `/download/${createSlug(app.platform)}/${createSlug(app.title)}/${app._id}`}
                              className="flex items-center"
                              onClick={(e) => {
                                setShowResults(false);
                                // Don't force navigation for download links, only for search results
                              }}
                            >
                              <div className="relative flex-shrink-0">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25"></div>
                                <img
                                  className="relative w-10 h-10 rounded-lg object-cover border border-purple-500/20"
                                  src={app.thumbnail[0]}
                                  alt={app.title}
                                />
                              </div>
                              <div className="ml-3">
                                <p className={`font-medium truncate ${getPlatformColorClass(app.platform)}`}>
                                  {app.title}
                                </p>
                                <p className="text-xs text-gray-400">{app.platform}</p>
                              </div>
                            </Link>

                            {/* Lock Icon for Locked Games */}
                            {isLocked && (
                              <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center z-10 opacity-100">
                                <CiLock className="text-white font-bold text-2xl" />
                              </div>
                            )}
                          </li>
                        );
                      })}

                      {/* View all results link */}
                      <li className="py-2 px-4 bg-black/30">
                        <button
                          className="text-center block w-full text-sm text-purple-400 hover:text-purple-300 font-medium"
                          onClick={() => {
                            setShowResults(false);
                            // Force a full page navigation with timestamp to ensure fresh results
                            const timestamp = Date.now();
                            window.location.href = `/search?query=${encodeURIComponent(searchQuery.trim())}&t=${timestamp}`;
                          }}
                        >
                          View all {searchResults.total} results
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  // No results found
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-lg border border-purple-600/20 shadow-lg overflow-hidden z-50">
                    {/* Ambient background elements */}
                    <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-10 rounded-full blur-xl"></div>

                    <div className="p-4 text-center relative z-10">
                      <p className="text-gray-300 text-sm">No results found for "{searchQuery}"</p>
                      <p className="text-gray-400 text-xs mt-1">Try different keywords or check spelling</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* No loading indicator - removed */}
          </div>
        </div>
        {/* Buttons: Request & Profile/Login - below search on mobile, right on md+ */}
        <div className="flex flex-row md:flex-row items-center justify-end mt-2 md:mt-0 ml-0 md:ml-4 gap-2 w-full md:w-auto">
          <ProfileIcon />
        </div>
      </div>
      {/* Profile dropdown and logout warning remain unchanged */}
      {/* (Removed user && showDropdown && ... block, as this logic is handled inside ProfileIcon) */}
    </div>
  );
};

export default LiveSearch;
