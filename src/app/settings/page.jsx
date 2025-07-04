"use client";
import SettingsForm from "./SettingsForm";
import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";

export default function SettingsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const xAuthToken = process.env.NEXT_PUBLIC_API_TOKEN;
                if (!token) {
                    setUser(null);
                    setLoading(false);
                    return;
                }
                const headers = { Authorization: `Bearer ${token}` };
                if (xAuthToken) headers["X-Auth-Token"] = xAuthToken;
                let data;
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, { headers, credentials: "include" });
                    data = await res.json();
                    console.log(data);

                    if (data && data.user) setUser(data.user);
                    else throw new Error();
                } catch (err) {
                    // fallback: decode token
                    try {
                        const decoded = jwtDecode(token);
                        setUser({
                            username: decoded.username || decoded.name || "User",
                            email: decoded.email || "",
                            avatar: decoded.avatar || "https://ui-avatars.com/api/?name=U&background=random",
                        });
                    } catch {
                        setUser(null);
                    }
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    const handleSubmit = async ({ avatarUrl, username, email, oldPassword }) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const xAuthToken = process.env.NEXT_PUBLIC_API_TOKEN;
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        if (xAuthToken) headers["X-Auth-Token"] = xAuthToken;
        // Update avatar
        if (avatarUrl && avatarUrl !== user.avatar) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update-avatar`, {
                method: "PATCH",
                headers,
                credentials: "include",
                body: JSON.stringify({ avatarUrl })
            });
        }
        // Update username/email
        if ((username && username !== user.username) || (email && email !== user.email)) {
            const body = {};
            if (username && username !== user.username) body.username = username;
            if (email && email !== user.email) body.email = email;
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/update-profile`, {
                method: "PATCH",
                headers,
                credentials: "include",
                body: JSON.stringify(body)
            });
        }
        // Password change (optional, not implemented here)
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!user) return <div className="text-center py-10 text-red-500">User not found or not logged in.</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#30712]">
            <SettingsForm user={user} onSubmit={handleSubmit} />
        </div>
    );
}
