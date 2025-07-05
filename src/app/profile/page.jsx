"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=U&background=random";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [games, setGames] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();

    const tabList = [
        {
            key: 'overview', label: 'Overview', icon: (
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V7a4 4 0 118 0v4M5 21h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
            )
        },
        {
            key: 'liked', label: 'Liked', icon: (
                <svg className="w-5 h-5 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a4 4 0 014-4 4 4 0 014 4c0 2.21-1.79 4-4 4S4 8.21 4 6z" /></svg>
            )
        },
        {
            key: 'history', label: 'Game History', icon: (
                <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )
        },
        {
            key: 'watchlist', label: 'Watchlist', icon: (
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-3 3H9a3 3 0 01-3-3v-1m6 0H9" /></svg>
            )
        },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const xAuthToken = process.env.NEXT_PUBLIC_API_TOKEN;
                if (!token) {
                    router.push("/user/login");
                    return;
                }
                // Always send Authorization, and send X-Auth-Token if available
                const headers = { Authorization: `Bearer ${token}` };
                if (xAuthToken) headers["X-Auth-Token"] = xAuthToken;
                let data;
                let decoded = null;
                try {
                    const res = await axios.get(
                        process.env.NEXT_PUBLIC_API_URL + "/api/user/me",
                        { headers }
                    );
                    data = res.data;
                } catch (err) {
                    // If backend fails, try to decode token on frontend
                    try {
                        decoded = jwtDecode(token);
                        setUser({
                            username: decoded.username || decoded.name || "User",
                            email: decoded.email || "",
                            avatar: decoded.avatar || DEFAULT_AVATAR,
                            purchasedGames: decoded.purchasedGames || [],
                            createdAt: decoded.iat ? new Date(decoded.iat * 1000) : undefined,
                        });
                        setGames([]);
                        setLoading(false);
                        return;
                    } catch (decodeErr) {
                        setUser(null);
                        setLoading(false);
                        return;
                    }
                }
                setUser(data.user);
                if (data.user.purchasedGames && data.user.purchasedGames.length > 0) {
                    // Fetch purchased games details
                    try {
                        const gamesRes = await axios.get(
                            process.env.NEXT_PUBLIC_API_URL + "/api/apps/get-multiple",
                            {
                                params: { ids: data.user.purchasedGames.join(",") },
                                headers,
                            }
                        );
                        setGames(gamesRes.data.apps || []);
                    } catch (gamesErr) {
                        setGames([]);
                    }
                }
            } catch (err) {
                // Log error for debugging
                console.error("Profile fetch error:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    // Fallback: If games is empty but user.purchasedGames exists (from decoded token), fetch each game by id
    useEffect(() => {
        const fetchGamesById = async () => {
            if (games.length === 0 && user && user.purchasedGames && user.purchasedGames.length > 0) {
                const token = localStorage.getItem("token");
                const xAuthToken = process.env.NEXT_PUBLIC_API_TOKEN;
                const headers = { Authorization: `Bearer ${token}` };
                if (xAuthToken) headers["X-Auth-Token"] = xAuthToken;
                try {
                    const gameDetails = await Promise.all(
                        user.purchasedGames.map(async (id) => {
                            try {
                                const res = await axios.get(
                                    process.env.NEXT_PUBLIC_API_URL + `/api/apps/get/${id}`,
                                    { headers }
                                );
                                return res.data.app;
                            } catch (err) {
                                return null;
                            }
                        })
                    );
                    setGames(gameDetails.filter(Boolean));
                } catch (err) {
                    setGames([]);
                }
            }
        };
        fetchGamesById();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
                <div className="text-white text-lg">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
                <div className="text-white text-lg">You must be logged in to view your profile.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 py-8 px-4 sm:px-6 lg:px-8">
            {/* Banner */}
            <div className="w-full h-32 bg-blue-500 rounded-b-2xl mb-[-64px] relative">
                <button
                    onClick={() => router.push('/settings')}
                    className="absolute right-6 bottom-4 bg-gradient-to-r from-[#b1001e] to-[#ff006a] text-white font-bold rounded-2xl shadow-2xl px-7 py-2.5 text-base flex items-center gap-3 transition-all duration-200 border-2 border-[#b1001e]/80 focus:outline-none focus:ring-2 focus:ring-[#ff006a]/60 focus:ring-offset-2 backdrop-blur-md group cursor-pointer hover:scale-105 hover:shadow-[0_0_24px_4px_rgba(255,0,106,0.25)]"
                    style={{ boxShadow: '0 0 16px 2px #b1001e99, 0 2px 24px 0 #ff006a55' }}
                >
                    <span className="font-bold tracking-wide">Edit Profile</span>
                    <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                </button>
            </div>
            <div className="max-w-4xl mx-auto relative z-10">
                {/* Avatar and Username */}
                <div className="flex flex-col items-center pt-0 pb-6">
                    <div className="-mt-16 mb-2">
                        <img
                            src={user.avatar || DEFAULT_AVATAR}
                            alt="avatar"
                            className="w-28 h-28 rounded-full border-4 border-blue-400 bg-gray-800 object-cover"
                            onError={e => (e.target.src = DEFAULT_AVATAR)}
                        />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{user.username}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                </div>
                {/* Tabs */}
                <div className="flex justify-center border-b border-gray-700 mb-8">
                    {tabList.map(tab => (
                        <button
                            key={tab.key}
                            className={`px-6 py-2 flex items-center font-semibold transition-all duration-200 ${activeTab === tab.key ? 'text-white border-b-2 border-blue-400 bg-blue-900/10' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards */}
                        <div className="mb-10">
                            <div className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V7a4 4 0 118 0v4M5 21h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
                                Toxic Games Statistics
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="rounded-xl bg-gradient-to-br from-blue-800/60 to-blue-600/40 p-6 shadow-lg">
                                    <div className="text-3xl font-bold text-white mb-1">70 <span className="text-base font-normal">pts</span></div>
                                    <div className="text-gray-300 text-sm">Total Points Earned</div>
                                    <div className="text-xs text-blue-200 mt-2">+0 last week</div>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-pink-800/60 to-pink-600/40 p-6 shadow-lg">
                                    <div className="text-3xl font-bold text-white mb-1">{games.length}</div>
                                    <div className="text-gray-300 text-sm">Total Games Purchased</div>
                                    <div className="text-xs text-pink-200 mt-2">+0 last week</div>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-rose-800/60 to-rose-600/40 p-6 shadow-lg">
                                    <div className="text-3xl font-bold text-white mb-1">
                                        ₹{games.reduce((sum, g) => sum + (g.price || 0), 0).toLocaleString("en-IN")}
                                    </div>
                                    <div className="text-gray-300 text-sm">Total Spent</div>
                                    <div className="text-xs text-rose-200 mt-2">on purchased games</div>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-purple-800/60 to-purple-600/40 p-6 shadow-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-bold">{user.createdAt ? new Date(user.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' }) : ''}</span>
                                        <span className="bg-blue-700 text-xs px-2 py-1 rounded-full text-white flex items-center gap-1"><svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M17 8V6a4 4 0 00-8 0v2M3 8v6a9 9 0 0018 0V8" /></svg>Verified</span>
                                    </div>
                                    <div className="text-gray-300 text-sm">Member Since</div>
                                    <div className="text-xs text-purple-200 mt-2">{user.username}</div>
                                </div>
                            </div>
                        </div>
                        {/* Purchased Games List */}
                        <div className="mt-10">
                            <div className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h3a4 4 0 014 4v2" /></svg>
                                Purchased Games
                            </div>
                            {games.length === 0 ? (
                                <div className="text-gray-400">No purchased games yet.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {games.map(game => {
                                        const slugify = (text = "") => text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
                                        const downloadUrl = `/download/${slugify(game.platform)}/${slugify(game.title)}/${game._id}`;
                                        return (
                                            <Link
                                                key={game._id}
                                                href={downloadUrl}
                                                className="block group"
                                                prefetch={true}
                                            >
                                                <div className="relative w-full max-w-xs mx-auto bg-[#181c23] rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center pt-0 pb-8 border border-gray-800 transition-transform duration-300 group-hover:scale-105">
                                                    {/* Cover image top half */}
                                                    <div className="w-full h-36 bg-gray-900 relative">
                                                        <img
                                                            src={game.coverImg || "/default-game.png"}
                                                            alt={game.title}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    {/* Centered thumbnail overlapping cover */}
                                                    <div className="absolute left-1/2 top-36 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                                        <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-800 flex items-center justify-center">
                                                            <img
                                                                src={game.thumbnail[0] || game.coverImg || "/default-game.png"}
                                                                alt={game.title}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Info below thumbnail with overlay, border, shadow, and glow */}
                                                    <div className="relative mt-14 flex flex-col items-center px-6 py-5 w-full">
                                                        {/* Overlay and border/glow */}
                                                        <div className="absolute inset-0 rounded-xl border border-[#e81cff]/40 shadow-[0_4px_32px_0_rgba(232,28,255,0.15)] bg-gradient-to-b from-white/5 via-[#181c23]/80 to-[#181c23] pointer-events-none z-0 group-hover:shadow-[0_0_32px_4px_rgba(232,28,255,0.25)] group-hover:border-[#e81cff]/80 transition-all duration-300"></div>
                                                        <div className="relative z-10 w-full flex flex-col items-center gap-1">
                                                            <div className="font-bold text-white text-lg text-center truncate w-full mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">{game.title}</div>
                                                            <div className="text-sm text-gray-300 font-medium text-center mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{game.platform} • {game.architecture}</div>
                                                            <div className="text-xs text-gray-400 text-center mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">{game.size || 'N/A'}</div>
                                                            <div className="text-xs font-semibold text-[#e81cff] text-center mt-2 drop-shadow-[0_1px_4px_rgba(232,28,255,0.25)]">Free to download forever</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
                {activeTab !== 'overview' && (
                    <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="text-2xl font-bold text-white mb-2">Coming Soon</div>
                        <div className="text-gray-400 text-base text-center max-w-md">This feature will be available in a future update. Stay tuned for more awesome profile tools!</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
