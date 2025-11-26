import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FollowingList({
  token,
  currentUserId,
  onShowProfile,
  onOpenConversation,
}: any) {
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !currentUserId) return;
    axios
      .get(`${API}/api/users/${currentUserId}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => setFollowing(res.data.following || []))
      .finally(() => setLoading(false));
  }, [token, currentUserId]);

  function avatarUrl(u: any) {
    if (!u?.avatar) return "/default.png";
    if (u.avatar.startsWith("http")) return u.avatar;
    return API + u.avatar;
  }

  async function toggleFollow(u: any) {
    const route = u.isFollowed ? "unfollow" : "follow";

    await axios.post(
      `${API}/api/users/${u._id}/${route}`,
      {},
      { headers: { Authorization: "Bearer " + token } }
    );

    setFollowing((prev) =>
      prev.map((x) =>
        x._id === u._id ? { ...x, isFollowed: !u.isFollowed } : x
      )
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Following</h2>

      {loading ? (
        <div>Loading…</div>
      ) : following.length === 0 ? (
        <div className="opacity-70 text-sm">Not following anyone yet.</div>
      ) : (
        <div className="grid gap-4">
          {following.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <img
                src={avatarUrl(u)}
                className="w-12 h-12 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                onClick={() => onShowProfile(u)}
              />

              <div
                className="flex-1"
                onClick={() => onShowProfile(u)}
              >
                <div className="font-semibold">{u.username}</div>
                <div className="text-xs opacity-70">{u.email}</div>
              </div>

              {/* Follow / Unfollow */}
              <button
                onClick={() => toggleFollow(u)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                  u.isFollowed
                    ? "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {u.isFollowed ? "Unfollow" : "Follow"}
              </button>

              {/* Message */}
              <button
                onClick={() => onOpenConversation({ partnerId: u._id })}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
              >
                Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
