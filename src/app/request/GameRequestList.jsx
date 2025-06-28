"use client";
import { useEffect, useState } from "react";

const STATUS_ORDER = ["pending", "processing", "approved", "rejected"];
const STATUS_LABELS = {
    pending: "Pending Requests",
    processing: "Processing Requests",
    approved: "Approved Requests",
    rejected: "Rejected Requests",
};

// Status colors mapping
const STATUS_COLORS = {
    pending: {
        border: "border-t-blue-500",
        progress: "#3b82f6",
        text: "text-blue-500",
    },
    processing: {
        border: "border-t-yellow-500",
        progress: "#eab308",
        text: "text-yellow-500",
    },
    approved: {
        border: "border-t-green-500",
        progress: "#22c55e",
        text: "text-green-500",
    },
    rejected: {
        border: "border-t-red-500",
        progress: "#ef4444",
        text: "text-red-500",
    },
};

function CircularProgressBar({ value, max, color }) {
    const progress = Math.min((value / max) * 100, 100);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference * (1 - progress / 100);

    return (
        <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold text-lg">{Math.round(progress)}%</span>
            </div>
        </div>
    );
}

function RequestCard({ req, onVote, voting, isVoted }) {
    const statusColor = STATUS_COLORS[req.status];

    return (
        <div className={`bg-white rounded-xl shadow-lg p-5 border-t-4 ${statusColor.border} transition-all hover:shadow-xl`}>
            <div className="flex flex-col items-center">
                <div className="mb-4">
                    <CircularProgressBar
                        value={req.votes}
                        max={20}
                        color={statusColor.progress}
                    />
                </div>

                <div className="text-center mb-3">
                    <h3 className="font-bold text-xl mb-1">{req.title}</h3>
                    <p className={`font-semibold ${statusColor.text}`}>
                        {req.votes} / 20 votes
                    </p>
                </div>

                {req.status === "processing" && (
                    <div className="bg-gray-100 rounded-lg p-3 mb-3 w-full">
                        <p className="font-medium text-gray-700">Status Update</p>
                        <p className="text-gray-600">Under review</p>
                    </div>
                )}

                {req.steamLink && (
                    <a
                        href={req.steamLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center w-full mb-3"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.372 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.09 3.332-1.386.268-.643.214-1.313-.1-1.938l-3.073 1.684zm3.728-5.115h.03c1.188 0 2.154-.966 2.154-2.154 0-1.188-.966-2.154-2.154-2.154-1.188 0-2.154.966-2.154 2.154 0 1.188.966 2.154 2.154 2.154zm6.724.025c1.83 0 3.316-1.486 3.316-3.317 0-1.83-1.486-3.316-3.316-3.316-1.831 0-3.317 1.486-3.317 3.316 0 1.831 1.486 3.317 3.317 3.317z" />
                        </svg>
                        View on Steam
                    </a>
                )}

                {req.status === "pending" && (
                    <button
                        onClick={() => onVote(req._id)}
                        disabled={voting || isVoted}
                        className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-colors ${voting || isVoted
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        {isVoted ? (
                            <span className="flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Supported
                            </span>
                        ) : (
                            "+ Support Request"
                        )}
                    </button>
                )}

                <div className="text-gray-500 text-sm mt-3 w-full text-center">
                    {req.status === "pending" && isVoted && "Requested 3 days ago"}
                    {req.status === "processing" && "Started processing 6 hours ago"}
                </div>
            </div>
        </div>
    );
}

export default function GameRequestList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votingId, setVotingId] = useState(null);
    const [voted, setVoted] = useState({});
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            setError("");
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const res = await fetch("http://localhost:8080/api/requests", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await res.json();
                if (res.ok) {
                    setRequests(data.filter((r) => STATUS_ORDER.includes(r.status)));
                } else {
                    setError(data.error || data.message || "Failed to load requests.");
                }
            } catch (err) {
                setError("An error occurred. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleVote = async (id) => {
        setVotingId(id);
        setError("");
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const res = await fetch(`http://localhost:8080/api/requests/${id}/vote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const data = await res.json();
            if (res.ok) {
                setRequests((prev) =>
                    prev.map((r) => (r._id === id ? { ...r, votes: r.votes + 1 } : r))
                );
                setVoted((prev) => ({ ...prev, [id]: true }));
            } else {
                setError(data.error || data.message || "Failed to vote.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setVotingId(null);
        }
    };

    const grouped = STATUS_ORDER.reduce((acc, status) => {
        acc[status] = requests.filter((r) => r.status === status);
        return acc;
    }, {});

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Game Requests</h1>

            {loading && (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">{error}</div>}

            {!loading && (
                <div className="space-y-10">
                    {STATUS_ORDER.map((status) => (
                        grouped[status]?.length > 0 && (
                            <div key={status} className="mb-8">
                                <div className="flex items-center mb-6">
                                    <h2 className="text-4xl md:text-5xl font-bold text-blue-400 mb-4">{STATUS_LABELS[status]}</h2>
                                    <span className="ml-3 bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm">
                                        {grouped[status].length}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {grouped[status].map((req) => (
                                        <RequestCard
                                            key={req._id}
                                            req={req}
                                            onVote={handleVote}
                                            voting={votingId === req._id}
                                            isVoted={!!voted[req._id] || req.status !== "pending"}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}