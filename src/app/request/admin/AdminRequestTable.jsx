"use client";
import { useEffect, useState } from "react";

// Table for listing and managing all game requests (admin view)
const STATUS_COLORS = {
    pending: "bg-blue-100 text-blue-700 border-blue-400",
    processing: "bg-yellow-100 text-yellow-700 border-yellow-400",
    approved: "bg-green-100 text-green-700 border-green-400",
    rejected: "bg-red-100 text-red-700 border-red-400",
    deleted: "bg-gray-100 text-gray-500 border-gray-300"
};

export default function AdminRequestTable() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState([]); // For bulk actions
    const [statusUpdating, setStatusUpdating] = useState(null);
    const [statsRequestId, setStatsRequestId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        setLoading(true);
        setError("");
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const res = await fetch("http://localhost:8080/api/requests/admin/requests", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (res.ok) {
                setRequests(data.requests || []);
            } else {
                setError(data.error || "Failed to load requests.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(id, status) {
        setStatusUpdating(id);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const res = await fetch(`http://localhost:8080/api/requests/admin/requests/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                fetchRequests();
            }
        } finally {
            setStatusUpdating(null);
        }
    }

    return (
        <div className="bg-[#1A2739] rounded-2xl shadow-2xl p-8 mt-8 border border-blue-900">
            <h2 className="text-3xl font-bold mb-6 text-blue-300 tracking-tight">All Game Requests</h2>
            {loading ? (
                <div className="text-center py-8 text-blue-200">Loading...</div>
            ) : error ? (
                <div className="text-red-400 text-center py-4">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-800">
                        <thead className="bg-[#22304a]">
                            <tr>
                                <th></th>
                                <th className="px-4 py-3 text-blue-200 font-semibold">Title</th>
                                <th className="px-4 py-3 text-blue-200 font-semibold">Platform</th>
                                <th className="px-4 py-3 text-blue-200 font-semibold">Status</th>
                                <th className="px-4 py-3 text-blue-200 font-semibold">Votes</th>
                                <th className="px-4 py-3 text-blue-200 font-semibold">Requested By</th>
                                <th className="px-4 py-3 text-blue-200 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#192132] divide-y divide-blue-900">
                            {requests.map((req) => (
                                <tr key={req._id} className="hover:bg-[#22304a] transition-all">
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(req._id)}
                                            onChange={() => setSelected(selected.includes(req._id)
                                                ? selected.filter((id) => id !== req._id)
                                                : [...selected, req._id])}
                                            className="accent-blue-600 w-4 h-4 rounded"
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-blue-100 text-lg">{req.title}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-block bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                            {req.platform}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={req.status}
                                            onChange={(e) => updateStatus(req._id, e.target.value)}
                                            disabled={statusUpdating === req._id}
                                            className={`border-2 rounded-lg px-3 py-1 font-semibold shadow focus:ring-2 focus:ring-blue-400 transition-all ${STATUS_COLORS[req.status]}`}
                                        >
                                            {['pending', 'processing', 'approved', 'rejected', 'deleted'].map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-blue-200 font-bold text-center">{req.votes}</td>
                                    <td className="px-4 py-3 text-blue-200">{req.requester?.username || 'N/A'}</td>
                                    <td className="px-4 py-3 space-x-2">
                                        <button
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all"
                                            onClick={() => setStatsRequestId(req._id)}
                                        >
                                            Stats
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
