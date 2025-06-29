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
      const xAuthToken = process.env.NEXT_PUBLIC_API_TOKEN;
      const headers = { Authorization: `Bearer ${token}` };
      if (xAuthToken) headers["X-Auth-Token"] = xAuthToken;
      try {
        const res = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/api/user/me",
          { headers }
        );
        setUser(res.data.user);
      } catch (err) {
        // fallback to JWT decode
        try {
          const decoded = jwtDecode(token);
          setUser({
            username: decoded.username || decoded.name || "User",
            avatar: decoded.avatar || DEFAULT_AVATAR,
          });
        } catch {
          setUser(null);
        }
      }
    };
    fetchUser();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      if (!e.target.closest('.profile-dropdown')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  return (
    <div className="relative flex items-center ml-4">
      <button
        className="focus:outline-none"
        onClick={() => setShowDropdown((v) => !v)}
      >
        <img
          src={user?.avatar || DEFAULT_AVATAR}
          alt="avatar"
          className="w-13 h-13 rounded-full border-2 border-blue-400 bg-gray-800 object-cover shadow-lg"
          onError={e => (e.target.src = DEFAULT_AVATAR)}
        />
      </button>
      {showDropdown && (
        <div className="profile-dropdown absolute right-0 mt-2 w-48 bg-[#181818] rounded-lg shadow-lg py-2 z-50 border border-[#232323]">
          <Link href="/profile" onClick={() => setShowDropdown(false)}>
            <span className="block px-4 py-2 text-gray-200 hover:bg-[#232323] cursor-pointer">My profile</span>
          </Link>
          {!user && (
            <Link href="/user/login" onClick={() => setShowDropdown(false)}>
              <span className="block px-4 py-2 text-gray-200 hover:bg-[#232323] cursor-pointer">Login</span>
            </Link>
          )}
          {user && (
            <button
              className="block w-full text-left px-4 py-2 text-red-400 hover:bg-[#232323] cursor-pointer"
              onClick={() => setShowLogoutWarning(true)}
            >
              Logout
            </button>
          )}
        </div>
      )}
      {/* Logout warning card */}
      {showLogoutWarning && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40" onClick={() => setShowLogoutWarning(false)}>
          <div className="bg-[#232323] rounded-lg p-6 shadow-lg w-80" onClick={e => e.stopPropagation()}>
            <div className="text-lg font-semibold text-white mb-2">Are you sure you want to logout?</div>
            <div className="text-gray-400 mb-4">You will need to login again to access your account.</div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
                onClick={() => setShowLogoutWarning(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  localStorage.removeItem('token');
                  setShowLogoutWarning(false);
                  setShowDropdown(false);
                  setUser(null);
                  window.location.href = '/user/logout';
                }}
              >
                Logout
              </button>
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
    <div className="flex items-center justify-between w-full">
      <div className="flex-1">
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
      </div>
      <ProfileIcon />
    </div>
  );
};

export default LiveSearch;
