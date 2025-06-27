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
    <div
      ref={searchRef}
      className="flex flex-wrap relative ring-1 ring-[#3E3E3E] rounded-lg w-full max-w-[760px] z-550"
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
  );
};

export default LiveSearch;
