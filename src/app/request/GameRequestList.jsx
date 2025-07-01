"use client";
import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaDownload, FaExclamationTriangle, FaUsers, FaExternalLinkAlt } from "react-icons/fa";
import jwtDecode from "jwt-decode";

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
        tagColor: "bg-blue-900/30 text-blue-200",
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
        tagColor: "bg-yellow-900/30 text-yellow-200",
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
        tagColor: "bg-green-900/30 text-green-200",
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
        tagColor: "bg-red-900/30 text-red-200",
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
    const timeAgo = req.timeAgo || "3 days ago";
    const platform = req.platform || "PC";

    return (
        <div
            className={`relative bg-[#181e29] rounded-2xl border ${meta.border} pt-5 pb-5 px-5 p flex flex-col min-h-[320px] transition-all duration-200 ${glow ? meta.glow : "hover:shadow-xl hover:scale-[1.03]"}`}
        >
            {/* Centered Platform Tag */}
            <div className="flex justify-center -mt-3 mb-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${meta.tagColor} shadow-lg`}>
                    {platform}
                </div>
            </div>

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
                        <span className="flex items-center justify-center"><FaCheck className="mr-2" />Supported</span>
                    ) : (
                        <span className="flex items-center justify-center">+ Support Request</span>
                    )}
                </button>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                <span>
                    {status === "pending" && `Requested ${timeAgo}`}
                    {status === "processing" && (
                        <div>
                            Started processing<br />
                            {timeAgo}
                        </div>
                    )}
                    {status === "approved" && `Approved ${timeAgo}`}
                    {status === "rejected" && (
                        <>
                            Rejected {timeAgo}
                            <br />
                            Auto deleted in 7 days
                        </>
                    )}

                </span>
                <span className="flex items-center gap-1">
                    <FaUsers className={meta.textColor} />
                    <span className={`font-bold ${meta.textColor}`}>{req.votes} requests</span>
                </span>
            </div>
        </div>
    );
}

function PopupModal({ open, message, onClose }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[6px] transition-all">
            <div className="bg-[#232b39] border border-[#2e3748] rounded-2xl shadow-2xl max-w-md w-full p-8 pt-7 relative animate-fadeIn">
                {/* Top blue border */}
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 to-indigo-500" />
                {/* Close button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-[#7b8597] hover:text-blue-400 text-xl focus:outline-none">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex flex-col items-center">
                    <div className="bg-[#22335a] rounded-full p-4 mb-4">
                        <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01" />
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">Daily Vote Used</div>
                    <div className="text-base text-[#b2b9c9] mb-6 text-center">{message}</div>
                    <div className="w-full mb-6">
                        <div className="flex items-center gap-2 bg-[#22335a]/60 border border-blue-700 rounded-xl px-4 py-3">
                            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
                            <span className="text-blue-200 text-sm">Your vote helps determine which games get priority processing!</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-[#313a4d] text-white rounded-xl font-semibold shadow hover:bg-[#3a4560] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-all text-lg"
                    >
                        Close
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
    const [userId, setUserId] = useState(null);

    // Fetch current user ID from token or API
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                if (!token) return;
                // Try to decode token first
                try {
                    const decoded = jwtDecode(token);
                    if (decoded && (decoded._id || decoded.id)) {
                        setUserId(decoded._id || decoded.id);
                        return;
                    }
                } catch (err) { }
                // Fallback: fetch from API
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                            'Content-Type': 'application/json'
                        },
                    });
                    const data = await res.json();
                    if (data && data.user && (data.user._id || data.user.id)) {
                        setUserId(data.user._id || data.user.id);
                    } else {
                        console.warn("User data structure unexpected:", data);
                    }

                } catch (err) { }
            } catch (err) { }
        };
        fetchUserId();
    }, []);


    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            setError("");
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await res.json();
                if (res.ok) {
                    // Add platforms to the requests (in real app, this would come from backend)
                    const requestsWithPlatforms = data.map(req => ({
                        ...req,
                        platform: req.platform || ["PC", "Mac", "Android", "iOS"][Math.floor(Math.random() * 4)]
                    }));
                    setRequests(requestsWithPlatforms.filter((r) => STATUS_ORDER.includes(r.status)));
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${id}/vote`, {
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {cards.slice(0, cardsToShow).map((req, idx) => (
                                <RequestCard
                                    key={req._id}
                                    req={req}
                                    status={status}
                                    onVote={handleVote}
                                    voting={votingId === req._id}
                                    isVoted={!!voted[req._id] || (userId && req.voters && req.voters.some(v => v.user === userId || v.user?._id === userId)) || req.status !== "pending"}
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