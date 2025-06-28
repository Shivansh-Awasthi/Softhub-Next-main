"use client";
import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaDownload, FaExclamationTriangle, FaUsers, FaExternalLinkAlt } from "react-icons/fa";

const STATUS_ORDER = ["pending", "processing", "approved", "rejected"];

const STATUS_META = {
    pending: {
        color: "blue",
        heading: "Pending Requests",
        headingGradient: "bg-gradient-to-r from-blue-400 to-blue-600",
        badge: "bg-blue-700 text-blue-100",
        glow: "shadow-[0_0_24px_0_rgba(59,130,246,0.4)]",
        border: "border-blue-600",
        textColor: "text-blue-400",
        desc: "Support your favorite games and help them reach our library. Games with 20 or more community votes get priority processing.",
        success: { label: "Success Rate", value: "85%", color: "text-blue-400" },
    },
    processing: {
        color: "yellow",
        heading: "Processing Requests",
        headingGradient: "bg-gradient-to-r from-yellow-400 to-yellow-600",
        badge: "bg-yellow-700 text-yellow-100",
        glow: "shadow-[0_0_24px_0_rgba(234,179,8,0.4)]",
        border: "border-yellow-500",
        textColor: "text-yellow-400",
        desc: "Games that have reached the vote threshold and are being processed by our team.",
        success: { label: "Est. Time", value: "24h", color: "text-yellow-400" },
    },
    approved: {
        color: "green",
        heading: "Approved Requests",
        headingGradient: "bg-gradient-to-r from-green-400 to-green-600",
        badge: "bg-green-700 text-green-100",
        glow: "shadow-[0_0_24px_0_rgba(34,197,94,0.4)]",
        border: "border-green-600",
        textColor: "text-green-400",
        desc: "Successfully processed games ready for download. Get them while they are fresh!",
        success: { label: "Success Rate", value: "97%", color: "text-green-400" },
    },
    rejected: {
        color: "red",
        heading: "Rejected Requests",
        headingGradient: "bg-gradient-to-r from-red-400 to-red-600",
        badge: "bg-red-700 text-red-100",
        glow: "shadow-[0_0_24px_0_rgba(239,68,68,0.4)]",
        border: "border-red-600",
        textColor: "text-red-400",
        desc: "These requests did not meet our requirements or lacked sufficient community support. They will be automatically removed after 3 days.",
        success: { label: "Auto Removal", value: "3 Days", color: "text-red-400" },
    },
};

function CircularProgressBar({ value, max, color, size = 56, stroke = 6 }) {
    const progress = Math.min((value / max) * 100, 100);
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference * (1 - progress / 100);
    return (
        <div className="relative flex items-center justify-center" style={{ width: `${size}px`, height: `${size}px` }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#232b3a"
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s" }}
                />
            </svg>
            <span className="absolute text-lg font-bold text-white">{value}</span>
        </div>
    );
}

function RequestCard({ req, status, onVote, voting, isVoted, glow }) {
    const meta = STATUS_META[status];
    const votesNeeded = Math.max(0, 20 - req.votes);
    const percent = Math.round((req.votes / 20) * 100);
    const timeAgo = req.timeAgo || "3 days ago"; // Replace with real time logic
    return (
        <div
            className={`relative bg-[#181e29] rounded-2xl border ${meta.border} p-6 flex flex-col min-h-[320px] transition-all duration-200 ${glow ? meta.glow : "hover:shadow-xl hover:scale-[1.03]"}`}
        >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-white font-bold text-lg truncate max-w-[70%]">{req.title}</span>
                {status === "pending" ? (
                    <span className="bg-[#232b3a] text-blue-200 px-3 py-1 rounded-full text-xs font-bold">{req.votes}/20</span>
                ) : status === "processing" ? (
                    <span className="bg-[#232b3a] text-yellow-200 px-3 py-1 rounded-full text-xs font-bold">{req.votes} votes</span>
                ) : status === "approved" ? (
                    <span className="bg-[#232b3a] text-green-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaCheck className="inline" /> Approved</span>
                ) : (
                    <span className="bg-[#232b3a] text-red-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaTimes className="inline" /> Rejected</span>
                )}
            </div>
            {/* Progress/Status */}
            <div className="flex flex-col items-center mb-4">
                {status === "pending" && (
                    <div className="w-full flex items-center gap-3 bg-[#20283a] rounded-xl p-3 mb-2">
                        <CircularProgressBar value={req.votes} max={20} color="#3b82f6" />
                        <div>
                            <div className="text-blue-100 font-bold text-base">{votesNeeded === 0 ? "0 votes needed" : `${votesNeeded} votes needed`}</div>
                            <div className="text-blue-400 text-xs font-semibold">{percent}% complete</div>
                        </div>
                    </div>
                )}
                {status === "processing" && (
                    <div className="w-full flex items-center gap-3 bg-[#23201e] rounded-xl p-3 mb-2">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-900/30">
                            <FaExclamationTriangle className="text-yellow-400 text-2xl" />
                        </div>
                        <div>
                            <div className="text-yellow-100 font-bold text-base">Status Update</div>
                            <div className="text-yellow-400 text-xs font-semibold">Quality check in progress</div>
                            <div className="text-yellow-400 text-xs font-bold mt-1">{req.votes} votes</div>
                        </div>
                    </div>
                )}
                {status === "approved" && (
                    <div className="w-full flex items-center gap-3 bg-[#1a2b22] rounded-xl p-3 mb-2">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-900/30">
                            <FaDownload className="text-green-400 text-2xl" />
                        </div>
                        <div>
                            <div className="text-green-100 font-bold text-base">Ready for Download</div>
                            <div className="text-green-400 text-xs font-semibold">Files verified and tested</div>
                        </div>
                    </div>
                )}
                {status === "rejected" && (
                    <div className="w-full flex items-center gap-3 bg-[#2a1a1a] rounded-xl p-3 mb-2">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-900/30">
                            <FaExclamationTriangle className="text-red-400 text-2xl" />
                        </div>
                        <div>
                            <div className="text-red-100 font-bold text-base">{req.votes} of 20 votes received</div>
                            <div className="text-red-400 text-xs font-semibold">Insufficient community support</div>
                        </div>
                    </div>
                )}
            </div>
            {/* View on Steam */}
            {req.steamLink && (
                <a
                    href={req.steamLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#232b3a] hover:bg-opacity-80 text-gray-200 font-medium rounded-lg px-4 py-2 mb-3 transition-all border border-transparent hover:border-blue-500"
                >
                    <FaExternalLinkAlt className="text-base" /> View on Steam
                </a>
            )}
            {/* Vote/Share Button */}
            {status === "pending" && (
                <button
                    onClick={() => onVote(req._id)}
                    disabled={voting || isVoted}
                    className={`w-full py-3 mt-1 rounded-xl font-bold text-base transition-all ${voting || isVoted
                        ? "bg-[#232b3a] text-blue-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500 shadow-lg hover:shadow-blue-500/40"}`}
                >
                    {isVoted ? (
                        <span className="flex items-center justify-center"><FaCheck className="mr-2" />Already Supported</span>
                    ) : (
                        <span className="flex items-center justify-center">+ Support Request</span>
                    )}
                </button>
            )}
            {/* Footer */}
            <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                <span>
                    {status === "pending" && `Requested ${timeAgo}`}
                    {status === "processing" && `Started processing `}
                    {status === "approved" && `Approved ${timeAgo}`}
                    {status === "rejected" && `Rejected ${timeAgo}. Auto removal in 3 days`}
                </span>
                <span className="flex items-center gap-1">
                    <FaUsers className={`${meta.textColor}`} />
                    <span className={`font-bold ${meta.textColor}`}>{req.votes} requests</span>
                </span>
            </div>
        </div>
    );
}

function PopupModal({ open, message, onClose }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative animate-fadeIn">
                <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-4 mb-4">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                    </div>
                    <div className="text-xl font-semibold text-gray-800 mb-2">Notice</div>
                    <div className="text-gray-600 mb-6">{message}</div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-bold shadow hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all"
                    >
                        OK
                    </button>
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
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [cardsToShow, setCardsToShow] = useState(12);

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
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setRequests((prev) =>
                    prev.map((r) => (r._id === id ? { ...r, votes: r.votes + 1 } : r))
                );
                setVoted((prev) => ({ ...prev, [id]: true }));
            } else if (res.status === 429) {
                setModalMessage("Your daily vote is used. Try again tomorrow.");
                setModalOpen(true);
            } else {
                setModalMessage(data.error || data.message || "Failed to vote.");
                setModalOpen(true);
            }
        } catch (err) {
            setModalMessage("An error occurred. Please try again.");
            setModalOpen(true);
        } finally {
            setVotingId(null);
        }
    };

    const grouped = STATUS_ORDER.reduce((acc, status) => {
        acc[status] = requests.filter((r) => r.status === status);
        return acc;
    }, {});

    return (
        <div className="max-w-7xl mx-auto py-10 px-2 md:px-6 bg-[#10131a] min-h-screen">
            <PopupModal open={modalOpen} message={modalMessage} onClose={() => setModalOpen(false)} />
            {STATUS_ORDER.map((status) => {
                const meta = STATUS_META[status];
                const cards = grouped[status] || [];
                if (!cards.length) return null;
                const showLoadMore = cards.length > cardsToShow;
                return (
                    <section key={status} className="mb-16">
                        {/* Section Heading */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                            <div>
                                <h2 className={`text-4xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent ${meta.headingGradient} drop-shadow-lg`}>
                                    {meta.heading}
                                    <span className={`ml-3 px-4 py-1 rounded-full font-bold text-lg ${meta.badge}`}>{cards.length}</span>
                                </h2>
                                <p className="text-gray-400 text-lg max-w-2xl mt-1">{meta.desc}</p>
                            </div>
                            <div className="flex items-center gap-4 bg-[#181e29] rounded-xl px-6 py-3 border border-[#232b3a]">
                                <span className={`flex items-center gap-2 font-semibold ${meta.success.color}`}>
                                    {meta.success.label === "Success Rate" ? <FaCheck /> : <FaExclamationTriangle />}
                                    {meta.success.label}
                                </span>
                                <span className={`text-3xl font-extrabold ml-2 ${meta.success.color}`}>{meta.success.value}</span>
                                {meta.success.label === "Est. Time" && <span className="text-xs text-gray-400 ml-2">Last 30 days</span>}
                            </div>
                        </div>
                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {cards.slice(0, cardsToShow).map((req, idx) => (
                                <RequestCard
                                    key={req._id}
                                    req={req}
                                    status={status}
                                    onVote={handleVote}
                                    voting={votingId === req._id}
                                    isVoted={!!voted[req._id] || req.status !== "pending"}
                                    glow={idx === 3} // Example: 4th card glows
                                />
                            ))}
                        </div>
                        {/* Load More Button */}
                        {showLoadMore && (
                            <div className="flex justify-center mt-10">
                                <button
                                    className={`px-8 py-3 rounded-2xl bg-[#181e29] border ${meta.border} ${meta.textColor} font-bold text-lg flex items-center gap-2 shadow hover:shadow-lg hover:bg-opacity-80 transition-all`}
                                    onClick={() => setCardsToShow(cardsToShow + 12)}
                                >
                                    Load More {meta.heading.split(" ")[0]}
                                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}