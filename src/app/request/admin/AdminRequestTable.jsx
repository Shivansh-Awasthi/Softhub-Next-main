"use client";
import { useEffect, useState } from "react";

// Table for listing and managing all game requests (admin view)
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
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">All Game Requests</h2>
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : error ? (
                <div className="text-red-600 text-center py-4">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th></th>
                                <th className="px-4 py-2">Title</th>
                                <th className="px-4 py-2">Platform</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Votes</th>
                                <th className="px-4 py-2">Requested By</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50">
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(req._id)}
                                            onChange={() => setSelected(selected.includes(req._id)
                                                ? selected.filter((id) => id !== req._id)
                                                : [...selected, req._id])}
                                        />
                                    </td>
                                    <td className="px-4 py-2 font-semibold">{req.title}</td>
                                    <td className="px-4 py-2">{req.platform}</td>
                                    <td className="px-4 py-2">
                                        <select
                                            value={req.status}
                                            onChange={(e) => updateStatus(req._id, e.target.value)}
                                            disabled={statusUpdating === req._id}
                                            className="border rounded px-2 py-1"
                                        >
                                            {['pending', 'processing', 'approved', 'rejected', 'deleted'].map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">{req.votes}</td>
                                    <td className="px-4 py-2">{req.requester?.username || 'N/A'}</td>
                                    <td className="px-4 py-2 space-x-2">
                                        <button
                                            className="text-blue-600 underline"
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
