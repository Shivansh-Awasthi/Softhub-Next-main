"use client";
import { useEffect, useState } from "react";

const STATUS_ORDER = ["pending", "processing", "approved", "rejected"];
const STATUS_LABELS = {
  pending: "Pending Requests",
  processing: "Processing Requests",
  approved: "Approved Requests",
  rejected: "Rejected Requests",
};

function ProgressBar({ value, max }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full bg-gray-200 rounded h-3 mb-2">
      <div
        className="bg-blue-500 h-3 rounded"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}

function RequestCard({ req, onVote, voting, isVoted }) {
  return (
    <div className="bg-white rounded shadow p-4 mb-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg">{req.title}</span>
        <span className="text-sm font-bold">{req.votes} / 20 votes</span>
      </div>
      <ProgressBar value={req.votes} max={20} />
      {req.steamLink && (
        <a
          href={req.steamLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm mb-1"
        >
          View on Steam
        </a>
      )}
      <button
        onClick={() => onVote(req._id)}
        disabled={voting || isVoted}
        className={`w-full p-2 rounded font-semibold ${
          voting || isVoted
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {isVoted ? "Supported" : "+ Support Request"}
      </button>
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
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Game Requests</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {!loading &&
        STATUS_ORDER.map((status) =>
          grouped[status]?.length ? (
            <div key={status} className="mb-8">
              <h2 className="text-xl font-semibold mb-3">{STATUS_LABELS[status]}</h2>
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
          ) : null
        )}
    </div>
  );
}
