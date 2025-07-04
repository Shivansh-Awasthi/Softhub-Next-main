"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ user, onSubmit }) {
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [oldPassword, setOldPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await onSubmit({ avatarUrl, username, email, oldPassword });
            setSuccess("Profile updated successfully! Please log in again.");
            setTimeout(() => {
                // Remove token and redirect to login
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                }
                router.push("/login");
            }, 1000);
        } catch (err) {
            setError(err.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-[8px] transition-all min-h-screen">
            <div className="w-full h-full mx-auto flex items-center justify-center">
                <div className="relative overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-lg w-full p-0">
                    {/* Top Border Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />
                    {/* Back Button */}
                    <button
                        type="button"
                        className="absolute top-5 left-5 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-white/70 dark:bg-gray-800/70 rounded-full px-3 py-2 shadow-md z-10 transition-all"
                        onClick={() => window.history.back()}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium text-sm">Back</span>
                    </button>
                    <div className="p-8 sm:p-10">
                        <form onSubmit={handleSubmit} className="w-full mx-auto">
                            <div className="mb-6 flex flex-col items-center">
                                <img
                                    src={avatarUrl || "/default-avatar.png"}
                                    alt="Avatar Preview"
                                    className="w-24 h-24 rounded-full object-cover mb-2 border-4 border-blue-200 dark:border-blue-700 shadow-lg"
                                />
                                <div className="text-xs text-blue-500 dark:text-blue-300 mb-2">To change your avatar, paste any image URL below.</div>
                                <div className="text-xs text-gray-400">Note: You have to re-login to see the changes.</div>
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 dark:text-gray-200" htmlFor="avatarUrl">Avatar URL</label>
                                <input
                                    id="avatarUrl"
                                    type="url"
                                    className="block w-full border-gray-200 rounded-xl text-base px-5 py-3 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 placeholder-gray-400/70 shadow-sm dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-1"
                                    placeholder="Paste your avatar image URL (e.g. https://...jpg)"
                                    value={avatarUrl}
                                    onChange={e => setAvatarUrl(e.target.value)}
                                    autoComplete="off"
                                />
                                <div className="text-xs text-gray-400 mt-1">Recommended: Square image, 200x200px or larger.</div>
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 dark:text-gray-200" htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    className="block w-full border-gray-200 rounded-xl text-base px-5 py-3 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 placeholder-gray-400/70 shadow-sm dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-1"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="Enter your username"
                                />
                                <div className="text-xs text-gray-400 mt-1">Pick a unique username for your profile.</div>
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 dark:text-gray-200" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="block w-full border-gray-200 rounded-xl text-base px-5 py-3 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 placeholder-gray-400/70 shadow-sm dark:focus:ring-blue-500 dark:focus:border-blue-500 mt-1"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    placeholder="Enter your email address"
                                />
                                <div className="text-xs text-gray-400 mt-1">Use a valid email for account recovery and notifications.</div>
                            </div>
                            {error && <div className="text-red-500 mb-2 text-sm text-center">{error}</div>}
                            {success && <div className="text-green-500 mb-2 text-sm text-center">{success}</div>}
                            <button
                                type="submit"
                                className="w-full py-4 px-4 mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
