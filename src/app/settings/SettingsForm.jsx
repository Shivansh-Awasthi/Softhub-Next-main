"use client";
import { useState } from "react";

export default function SettingsForm({ user, onSubmit }) {
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [oldPassword, setOldPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await onSubmit({ avatarUrl, username, email, oldPassword });
            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError(err.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
            <div className="mb-6 flex flex-col items-center">
                <img
                    src={avatarUrl || "/default-avatar.png"}
                    alt="Avatar Preview"
                    className="w-24 h-24 rounded-full object-cover mb-2 border-4 border-gray-200 dark:border-gray-700"
                />

                <label className="block text-sm font-medium text-gray-600 mb-1 dark:text-gray-300" htmlFor="username">Avatar Url</label>
                <input
                    type="url"
                    className="block w-full border-gray-200 rounded-md text-sm px-5 py-2 mt-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-800 dark:text-gray-400 placeholder-gray-400/70 shadow-sm"
                    placeholder="Avatar image URL"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1 dark:text-gray-300" htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    className="block w-full border-gray-200 rounded-md text-sm px-5 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-800 dark:text-gray-400 placeholder-gray-400/70 shadow-sm"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1 dark:text-gray-300" htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    className="block w-full border-gray-200 rounded-md text-sm px-5 py-2 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-800 dark:text-gray-400 placeholder-gray-400/70 shadow-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
            </div>

            {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
            {success && <div className="text-green-500 mb-2 text-sm">{success}</div>}
            <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </form>
    );
}
