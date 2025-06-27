"use client";
import { useState } from "react";

export default function GameRequestForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("");
  const [steamLink, setSteamLink] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
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
      const data = await res.json();
      if (res.ok) {
        setMessage("Request submitted successfully!");
        setTitle("");
        setDescription("");
        setPlatform("");
        setSteamLink("");
      } else {
        setMessage(data.error || data.message || "Failed to submit request.");
      }
    } catch (err) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold mb-2">Request a Game</h2>
      <input
        type="text"
        placeholder="Game Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full border p-2 rounded"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 rounded"
        rows={3}
      />
      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        required
        className="w-full border p-2 rounded"
      >
        <option value="">Select Platform</option>
        <option value="PC">PC</option>
        <option value="Mac">Mac</option>
        <option value="Android">Android</option>
        <option value="iOS">iOS</option>
        <option value="Playstation">Playstation</option>
        <option value="Xbox">Xbox</option>
        <option value="Switch">Switch</option>
      </select>
      <input
        type="url"
        placeholder="Steam Link (optional)"
        value={steamLink}
        onChange={(e) => setSteamLink(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </button>
      {message && <div className="text-center text-sm mt-2">{message}</div>}
    </form>
  );
}
