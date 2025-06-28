"use client";
import { useState } from "react";

// Modal for showing voting stats (placeholder, needs integration)
export default function AdminStatsModal({ requestId, onClose }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch stats when requestId changes
    // ...implement fetch logic here...

    if (!requestId) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center relative animate-fadeIn">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Voting Stats</h2>
                {loading ? (
                    <div>Loading...</div>
                ) : stats ? (
                    <pre className="text-left bg-gray-100 rounded p-4 overflow-x-auto">{JSON.stringify(stats, null, 2)}</pre>
                ) : (
                    <div>No stats available.</div>
                )}
                <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold shadow hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
