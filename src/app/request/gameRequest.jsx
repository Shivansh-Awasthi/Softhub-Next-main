"use client";
import { useState } from "react";
import { FaHeart, FaPlus, FaClock, FaCog, FaTimesCircle, FaSteam, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaGamepad, FaVoteYea, FaBolt } from 'react-icons/fa';


// PopupModal: Modern, reusable modal for error/info messages
function PopupModal({ open, message, onClose }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[6px] transition-all">
            <div className="bg-[#232b39] border border-[#2e3748] rounded-2xl shadow-2xl max-w-md w-full p-8 pt-7 relative animate-fadeIn">
                {/* Top blue border */}
                <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r from-red-500 to-red-500" />
                {/* Close button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-[#7b8597] hover:text-blue-400 text-xl focus:outline-none">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex flex-col items-center">
                    <div className="bg-[#22335a] rounded-full p-4 mb-4">
                        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01" />
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">Error</div>
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

export default function GameRequestForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [platform, setPlatform] = useState("");
    const [steamLink, setSteamLink] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const stages = [
        {
            title: "Pending",
            icon: <FaClock className="text-2xl" />,
            color: "bg-blue-500",
            hoverColor: "hover:shadow-blue-500",
            points: ["Need 20 votes", "Within 7 days"]
        },
        {
            title: "Processing",
            icon: <FaCog className="text-2xl" />,
            color: "bg-yellow-500",
            hoverColor: "hover:shadow-yellow-500",
            points: ["Quality check", "~7days processing time"]
        },
        {
            title: "Approved",
            icon: <FaCheckCircle className="text-2xl" />,
            color: "bg-green-500",
            hoverColor: "hover:shadow-green-500",
            points: ["Ready for download", "Files verified"]
        },
        {
            title: "Rejected",
            icon: <FaTimesCircle className="text-2xl" />,
            color: "bg-red-500",
            hoverColor: "hover:shadow-red-500",
            points: ["Less than 20 votes", "Removed in 7 days"]
        }
    ];



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        // Validate Steam link (basic check)
        if (steamLink && !/^https?:\/\/(store\.)?steampowered\.com\//.test(steamLink)) {
            setModalMessage("Invalid Steam link. Please provide a valid Steam store URL.");
            setModalOpen(true);
            setLoading(false);
            return;
        }
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const res = await fetch("http://localhost:8080/api/requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ title, description, platform, steamLink }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setMessage("Request submitted successfully!");
                setTitle("");
                setDescription("");
                setPlatform("");
                setSteamLink("");
            } else if (res.status === 429) {
                setModalMessage("Your request limit exceeded. You can request only a single game in a week.");
                setModalOpen(true);
            } else {
                setModalMessage(data.error || data.message || "Failed to submit request.");
                setModalOpen(true);
            }
        } catch (err) {
            setModalMessage("An error occurred. Please try again.");
            setModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PopupModal open={modalOpen} message={modalMessage} onClose={() => setModalOpen(false)} />
            <section className="bg-[#030712] py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-7xl font-bold text-blue-500 mb-4">
                            Game Request
                        </h1>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">Portal</h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Submit your game requests and let the community decide what gets added to our library next.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1: Submit Game */}
                        <div className="bg-[#232b39]/80 border border-[#2e3748] rounded-2xl shadow-lg p-8 flex flex-col gap-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-3 flex items-center justify-center">
                                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 3.487a2.25 2.25 0 113.182 3.182l-9.193 9.193a2.25 2.25 0 01-.797.53l-3.25 1.25a.5.5 0 01-.65-.65l1.25-3.25a2.25 2.25 0 01.53-.797l9.193-9.193z" />
                                    </svg>
                                </div>
                                <span className="text-blue-400 font-medium text-base">Step 1</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Submit Game</h2>
                                <p className="text-[#b2b9c9] text-base font-normal">Share the Steam link and details for the game you want added to our library.</p>
                            </div>
                        </div>
                        {/* Step 2: Get Votes */}
                        <div className="bg-[#232b39]/80 border border-[#2e3748] rounded-2xl shadow-lg p-8 flex flex-col gap-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-3 flex items-center justify-center">
                                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 10-8 0 4 4 0 008 0zm6 4a4 4 0 00-3-3.87M6 10a4 4 0 00-3 3.87" />
                                    </svg>
                                </div>
                                <span className="text-blue-400 font-medium text-base">Step 2</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Get Votes</h2>
                                <p className="text-[#b2b9c9] text-base font-normal">Gather community support. Your request needs 20 votes for priority processing.</p>
                            </div>
                        </div>
                        {/* Step 3: Fast Processing */}
                        <div className="bg-[#232b39]/80 border border-[#2e3748] rounded-2xl shadow-lg p-8 flex flex-col gap-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-3 flex items-center justify-center">
                                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="text-blue-400 font-medium text-base">Step 3</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Fast Processing</h2>
                                <p className="text-[#b2b9c9] text-base font-normal">Once approved, your request is processed within 24 hours.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <div className="min-h-screen bg-[#030712] py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-5xl md:text-6xl font-bold text-purple-500 mb-4">
                                Game Request
                            </h1>
                            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                                Fill in the details below to submit your request.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Form */}
                            <div className="lg:col-span-2 bg-[#101928]/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-[#232c3a]">
                                <form onSubmit={handleSubmit} className="space-y-7">
                                    {/* Game Title */}
                                    <div>
                                        <label htmlFor="gameTitle" className="block text-base font-semibold text-white mb-2 tracking-wide">
                                            Game Title
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Enter the game title..."
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                                maxLength={191}
                                                className="w-full px-4 py-3 rounded-lg bg-[#181f2a] text-white border border-[#232c3a] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 outline-none placeholder:text-[#7b8597] text-base shadow-inner"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7b8597]">{title.length}/191</span>
                                        </div>
                                        {/* Example error message (replace with your error state if needed) */}
                                        {/* <p className="mt-1 text-sm text-red-400">The title field is required.</p> */}
                                    </div>

                                    {/* Steam Store URL */}
                                    <div>
                                        <label htmlFor="steamUrl" className="block text-base font-semibold text-white mb-2 tracking-wide">
                                            Steam Store URL
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <FaSteam className="text-xl text-[#7b8597]" />
                                            </div>
                                            <input
                                                type="url"
                                                placeholder="https://store.steampowered.com/app/..."
                                                value={steamLink}
                                                onChange={(e) => setSteamLink(e.target.value)}
                                                className="w-full pl-10 px-4 py-3 rounded-lg bg-[#181f2a] text-white border border-[#232c3a] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 outline-none placeholder:text-[#7b8597] text-base shadow-inner"
                                            />
                                            {/* Example valid/invalid state (replace with your validation logic) */}
                                            {/* <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400">✓ Valid URL</span> */}
                                            {/* <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400">The steam link field is required.</span> */}
                                        </div>
                                    </div>

                                    {/* Release Verification Checkbox */}
                                    <div className="flex items-start bg-transparent rounded-lg py-2">
                                        <input
                                            id="verification"
                                            type="checkbox"
                                            className="w-5 h-5 accent-blue-600 rounded border border-[#232c3a] mt-1 focus:ring-blue-500"
                                            required
                                        />
                                        <label htmlFor="verification" className="ml-3 text-[#b2b9c9] text-sm select-none">
                                            I verify that this game has been officially released and is patched by Scene groups or P2P community.
                                            <a href="#" className="text-blue-400 hover:underline ml-1 inline-flex items-center">
                                                What is Denuvo? <FaInfoCircle className="ml-1" />
                                            </a>
                                        </label>
                                    </div>

                                    {/* Important Notice */}
                                    <div className="p-4 rounded-xl bg-[#2a1a13]/80 border border-[#ffb86b] flex items-start gap-3">
                                        <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mt-1" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-yellow-200 mb-1">Important Notice</h3>
                                            <p className="text-sm text-yellow-100">
                                                Games protected by Denuvo DRM cannot be published on our platform. Please verify the game's DRM status before submitting your request to avoid rejection.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Request Processing Info */}
                                    <div className="p-4 rounded-xl bg-[#1a2233]/80 border border-[#3b4a6b] flex items-start gap-3">
                                        <FaInfoCircle className="h-5 w-5 text-blue-400 mt-1" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-blue-200 mb-1">Request Processing Information</h3>
                                            <p className="text-sm text-blue-100">
                                                Requests require 20+ community votes for priority processing. Average processing time is 24 hours after reaching the threshold.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 text-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <FaPlus className="text-xl" />
                                        {loading ? "Submitting..." : "Submit Request"}
                                    </button>
                                    {message && <div className="text-center text-sm mt-2 text-green-400">{message}</div>}
                                </form>
                            </div>
                            {/* right card */}
                            <div className="bg-[#1A2739] rounded-2xl shadow-xl p-8 h-fit">
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <FaCheckCircle className="text-blue-600 text-2xl" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white ml-4">Request Limit & Guidelines</h2>
                                </div>

                                <div className="mt-6 bg-[#1A2739] rounded-xl p-6">
                                    <p className="text-lg text-gray-300 mb-4">
                                        You can submit <span className="font-bold text-blue-600">1  requests</span> this week.
                                    </p>

                                    <div className="mt-8 space-y-4">
                                        <h3 className="text-lg font-semibold text-purple-300">Submission Guidelines:</h3>
                                        <ul className="space-y-3 text-gray-600">
                                            <li className="flex items-start">
                                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                                                <span className='text-gray-300'>Only submit officially released games</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                                                <span className='text-gray-300'>Verify Denuvo status before submission</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                                                <span className='text-gray-300'>Provide accurate Steam store URLs</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></span>
                                                <span className='text-gray-300'>No duplicate requests for the same game</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
                                        <p className="text-gray-700">
                                            <span className="font-semibold">Note:</span> Requests with incomplete or inaccurate information will be rejected automatically.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-16 px-4 bg-[#030712]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-cyan-500 mb-4">
                            Request Lifecycle
                        </h2>
                        <p className="text-lg text-gray-500 max-w-3xl mx-auto">
                            Understanding how your game request progresses through our system
                        </p>
                    </div>

                    <div className="relative flex flex-col lg:flex-row items-stretch justify-between gap-6  mt-12">
                        {/* Timeline line */}
                        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-[#232b39] z-0" style={{ transform: 'translateY(-50%)' }} />
                        {/* Pending */}
                        <div className="relative z-10 w-full lg:w-1/4">
                            <div className="bg-[#232b39]/80 border border-[#2e3748] rounded-2xl shadow-lg p-8 flex flex-col gap-4 group transition-all duration-300 hover:shadow-blue-500/40 hover:ring-2 hover:ring-blue-500/40">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-[#22335a] rounded-xl p-3 flex items-center justify-center">
                                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-400">
                                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Pending</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-blue-300 text-base"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg>Need 20 votes</li>
                                    <li className="flex items-center gap-2 text-blue-300 text-base"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>Within 5 days</li>
                                </ul>
                            </div>
                        </div>
                        {/* Processing */}
                        <div className="relative z-10 w-full lg:w-1/4">
                            <div className="bg-[#232b39]/80 border border-[#2e3748] rounded-2xl shadow-lg p-8 flex flex-col gap-4 group transition-all duration-300 hover:shadow-yellow-500/40 hover:ring-2 hover:ring-yellow-500/40">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-[#4b3a1a] rounded-xl p-3 flex items-center justify-center">
                                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-yellow-400"><circle cx="12" cy="12" r="10" strokeWidth="2" /><circle cx="12" cy="12" r="5" fill="#facc15" /></svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Processing</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-yellow-300 text-base"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Quality check</li>
                                    <li className="flex items-center gap-2 text-yellow-300 text-base"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" /></svg>~24h processing time</li>
                                </ul>
                            </div>
                        </div>
                        {/* Approved (with glow) */}
                        <div className="relative z-10 w-full lg:w-1/4">
                            <div className="bg-[#232b39]/80 border border-[#2e3748] rounded-2xl shadow-lg p-8 flex flex-col gap-4 group transition-all duration-300 hover:shadow-green-500/40 hover:ring-2 hover:ring-green-500/40">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-[#1a3a2a] rounded-xl p-3 flex items-center justify-center">
                                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-400"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Approved</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-green-300 text-base"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /><polyline points="7 11 12 16 17 11" /></svg>Ready for download</li>
                                    <li className="flex items-center gap-2 text-green-300 text-base"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg>Files verified</li>
                                </ul>
                            </div>
                        </div>
                        {/* Rejected */}
                        <div className="relative z-10 w-full lg:w-1/4">
                            <div className="bg-[#232b39]/80 border border-[#2e3748] rounded-2xl shadow-lg p-8 flex flex-col gap-4 group transition-all duration-300 hover:shadow-red-500/40 hover:ring-2 hover:ring-red-500/40">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-[#3a1a2a] rounded-xl p-3 flex items-center justify-center">
                                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-pink-400"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" /></svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Rejected</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-pink-300 text-base"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16h.01" /></svg>Less than 20 votes</li>
                                    <li className="flex items-center gap-2 text-pink-300 text-base"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9l6 6m0-6l-6 6" /></svg>Removed in 3 days</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}