"use client";
import { useState } from "react";

// Bulk status update for selected requests
export default function AdminBulkActions() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    // This would need to get selected IDs from context or parent in a real app
    const selected = [];

    async function handleBulkUpdate() {
        if (!status || selected.length === 0) return;
        setLoading(true);
        setMessage("");
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const res = await fetch("http://localhost:8080/api/requests/admin/requests/bulk-status", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ ids: selected, status }),
            });
            if (res.ok) {
                setMessage("Bulk status update successful!");
            } else {
                setMessage("Bulk update failed.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-blue-50 rounded-xl shadow p-4 mb-6 flex items-center space-x-4">
            <span className="font-semibold">Bulk Status Update:</span>
            <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1">
                <option value="">Select status</option>
                {['pending', 'processing', 'approved', 'rejected', 'deleted'].map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
            <button
                onClick={handleBulkUpdate}
                disabled={loading || !status || selected.length === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
            >
                Update Selected
            </button>
            {message && <span className="ml-4 text-blue-700">{message}</span>}
        </div>
    );
}
