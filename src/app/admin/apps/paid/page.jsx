"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const PaidGameAdminPage = () => {
    const [email, setEmail] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [ps4Games, setPs4Games] = useState([]);
    const [selectedGame, setSelectedGame] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();

    // Check admin status on mount (client-side)
    React.useEffect(() => {
        async function checkAdmin() {
            const res = await fetch(`${apiUrl}/api/user/me`, {
                credentials: 'include',
                headers: {
                    'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                },
            });

            const data = await res.json();
            if (!data.success || data.user.role !== "ADMIN") {
                router.replace("/");
            }
        }
        checkAdmin();
        fetchRecentUsers();
        fetchPs4PaidGames();
    }, []);

    // Fetch recent 10 users
    async function fetchRecentUsers() {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`${apiUrl}/api/user/recent`, {
                credentials: 'include',
                headers: {
                    'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                },
            });
            const data = await res.json();
            setUsers(data.users || []);
        } catch (e) {
            setMessage("Failed to fetch users");
        }
        setLoading(false);
    }

    // Search user by email
    async function searchUserByEmail() {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`${apiUrl}/api/user/by-email?email=${encodeURIComponent(email)}`, {
                credentials: 'include',
                headers: {
                    'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                },
            });
            const data = await res.json();
            if (data.user) {
                setUsers([data.user]);
            } else {
                setUsers([]);
                setMessage("No user found");
            }
        } catch (e) {
            setMessage("Failed to search user");
        }
        setLoading(false);
    }

    // Fetch paid PS4 games
    async function fetchPs4PaidGames() {
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`${apiUrl}/api/apps/category/ps4`, {
                headers: {
                    'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                },
            });
            const data = await res.json();
            // Only show paid games
            const paidGames = (data.apps || data.games || []).filter(game => game.isPaid);
            setPs4Games(paidGames);
        } catch (e) {
            setMessage("Failed to fetch games");
        }
        setLoading(false);
    }

    // Add game to user
    async function addGameToUser() {
        if (!selectedUser || !selectedGame) return;
        setLoading(true);
        setMessage("");
        try {
            const res = await fetch(`${apiUrl}/api/user/add-purchased-game`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                },
                credentials: 'include',
                body: JSON.stringify({ userId: selectedUser._id, gameId: selectedGame })
            });
            const data = await res.json();
            setMessage(data.message);
        } catch (e) {
            setMessage("Failed to add game");
        }
        setLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10 border border-gray-200">
            <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700 tracking-tight drop-shadow-sm">Admin: Add Paid PS4 Game to User</h1>
            <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <input
                    type="email"
                    placeholder="Search user by email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border-2 border-blue-200 focus:border-blue-500 transition p-3 rounded-lg w-full sm:w-2/3 shadow-sm focus:outline-none"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={searchUserByEmail} className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition disabled:opacity-60">Search</button>
                    <button onClick={fetchRecentUsers} className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition">Recent 10</button>
                </div>
            </div>
            <div className="mb-6">
                <h2 className="font-bold mb-3 text-lg text-gray-700 flex items-center gap-2"><span className="material-icons text-blue-500">person_search</span>Users:</h2>
                {users.length === 0 && <div className="text-gray-400 italic text-center">No users found.</div>}
                <ul className="space-y-2">
                    {users.map(user => (
                        <li key={user._id} className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition shadow-sm hover:shadow-md ${selectedUser && selectedUser._id === user._id ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200'}`} onClick={() => setSelectedUser(user)}>
                            <div>
                                <span className="font-semibold text-gray-800">{user.username}</span> <span className="text-gray-500">({user.email})</span>
                            </div>
                            {selectedUser && selectedUser._id === user._id && <span className="material-icons text-blue-500">check_circle</span>}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mb-6">
                <h2 className="font-bold mb-3 text-lg text-gray-700 flex items-center gap-2"><span className="material-icons text-green-500">sports_esports</span>Paid PS4 Games:</h2>
                <select value={selectedGame} onChange={e => setSelectedGame(e.target.value)} className="border-2 border-green-200 focus:border-green-500 transition p-3 rounded-lg w-full shadow-sm focus:outline-none bg-gray-50">
                    <option value="">Select a game</option>
                    {ps4Games.map(game => (
                        <option key={game._id} value={game._id}>{game.title}</option>
                    ))}
                </select>
            </div>
            <button
                className="w-full bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                disabled={!selectedUser || !selectedGame || loading}
                onClick={addGameToUser}
            >
                {loading ? <span className="animate-spin material-icons align-middle">autorenew</span> : 'Add Game to User'}
            </button>
            {message && <div className="mt-6 text-center text-lg font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg py-3 px-4 shadow-sm">{message}</div>}
        </div>
    );
};

export default PaidGameAdminPage;
