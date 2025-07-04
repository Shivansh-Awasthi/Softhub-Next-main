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
        <form onSubmit={handleSubmit} className="w-full mx-auto p-6 bg-[#030712] rounded-xl shadow">
            <div className="mb-6 flex flex-col items-center">
                <img
                    src={avatarUrl || "/default-avatar.png"}
                    alt="Avatar Preview"
                    className="w-24 h-24 rounded-full object-cover mb-2 border-4 border-gray-200 dark:border-gray-700"
                />
                <div className="text-red-500">Note: You have to re-login to see the changes. </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-3 dark:text-gray-300 dark:font-normal rtl:text-right" htmlFor="avatarUrl">Avatar URL</label>
                <input
                    id="avatarUrl"
                    type="url"
                    className="block w-full border-gray-200 rounded-md text-sm px-5 py-3.5 focus:border-[--primary-color] focus:ring-[--primary-color] dark:bg-gray-800 dark:border-gray-800 dark:text-gray-400 placeholder-gray-400/70 shadow-sm dark:focus:ring-[--primary-color] dark:focus:border-[--primary-color] mt-1"
                    placeholder="Avatar image URL"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    autoComplete="off"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-3 dark:text-gray-300 dark:font-normal rtl:text-right" htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    className="block w-full border-gray-200 rounded-md text-sm px-5 py-3.5 focus:border-[--primary-color] focus:ring-[--primary-color] dark:bg-gray-800 dark:border-gray-800 dark:text-gray-400 placeholder-gray-400/70 shadow-sm dark:focus:ring-[--primary-color] dark:focus:border-[--primary-color] mt-1"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-3 dark:text-gray-300 dark:font-normal rtl:text-right" htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    className="block w-full border-gray-200 rounded-md text-sm px-5 py-3.5 focus:border-[--primary-color] focus:ring-[--primary-color] dark:bg-gray-800 dark:border-gray-800 dark:text-gray-400 placeholder-gray-400/70 shadow-sm dark:focus:ring-[--primary-color] dark:focus:border-[--primary-color] mt-1"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />
            </div>
            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            {success && <div className="text-green-500 mb-2 text-sm">{success}</div>}
            <button
                type="submit"
                className="w-full py-4 px-4 mt-10 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </form>
    );
}
