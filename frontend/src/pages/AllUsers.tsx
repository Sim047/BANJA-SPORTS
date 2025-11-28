// frontend/src/pages/AllUsers.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PLACEHOLDER = "https://placehold.co/200x200?text=User";

type User = {
  _id: string;
  username?: string;
  email?: string;
  avatar?: string;
  isFollowed?: boolean;
};

export default function AllUsers({ token, onOpenConversation, currentUserId }: any) {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [listMode, setListMode] = useState<"grid" | "list">("grid");

  // Profile Modal
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [followList, setFollowList] = useState<any[]>([]);
  const [followListMode, setFollowListMode] = useState<"followers" | "following">(
    "followers"
  );
  const [followListLoading, setFollowListLoading] = useState(false);

  /* ----------------------------------------------------------
     LOAD USERS
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!token) return;
    loadUsers();
  }, [token]);

  async function loadUsers(q = "") {
    try {
      setLoading(true);

      const url =
        API + "/api/users/all" + (q ? "?search=" + encodeURIComponent(q) : "");

      const res = await axios.get(url, {
        headers: { Authorization: "Bearer " + token },
      });

      const normalized = (res.data || []).map((u: any) => ({
        ...(u || {}),
        isFollowed: !!u.isFollowed,
      }));

      setUsers(normalized);
    } catch (err) {
      console.error("AllUsers load err", err);
    } finally {
      setLoading(false);
    }
  }

  /* ----------------------------------------------------------
     SEARCH (debounced)
  ----------------------------------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => {
      if (!token) return;
      loadUsers(search);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  /* ----------------------------------------------------------
     UTIL: Avatar Url
  ----------------------------------------------------------- */
  function avatarUrl(u: any) {
    if (!u?.avatar) return PLACEHOLDER;
    if (u.avatar.startsWith("http")) return u.avatar;
    if (u.avatar.startsWith("/")) return API + u.avatar;
    return API + "/uploads/" + u.avatar;
  }

  /* ----------------------------------------------------------
     START CONVERSATION
  ----------------------------------------------------------- */
  async function startConversation(user: User) {
    if (!token) return;

    setProcessingId(user._id);

    try {
      const res = await axios.post(
        API + "/api/users/conversations/start",
        { partnerId: user._id },
        { headers: { Authorization: "Bearer " + token } }
      );

      onOpenConversation(res.data);
    } catch (err) {
      console.error("startConversation error", err);
      alert("Could not start chat");
    } finally {
      setProcessingId(null);
    }
  }

  /* ----------------------------------------------------------
     FOLLOW / UNFOLLOW
  ----------------------------------------------------------- */
  async function followToggle(user: User, follow: boolean) {
    if (!token) return;

    setProcessingId(user._id);

    try {
      const url = `${API}/api/users/${user._id}/${follow ? "follow" : "unfollow"}`;

      await axios.post(
        url,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isFollowed: follow } : u
        )
      );
    } catch (err) {
      console.error("followToggle error", err);
    } finally {
      setProcessingId(null);
    }
  }

  /* ----------------------------------------------------------
     OPEN PROFILE
  ----------------------------------------------------------- */
  async function openProfile(userId: string) {
    setProfileOpen(true);
    setProfileLoading(true);

    try {
      const res = await axios.get(API + "/api/users/" + userId, {
        headers: { Authorization: "Bearer " + token },
      });

      setProfileUser(res.data);
    } catch (err) {
      console.error("openProfile err", err);
      setProfileUser(null);
    } finally {
      setProfileLoading(false);
    }
  }

  /* ----------------------------------------------------------
     FETCH FOLLOW LIST
  ----------------------------------------------------------- */
  async function fetchFollowList(userId: string, which: "followers" | "following") {
    try {
      const res = await axios.get(API + `/api/users/${userId}/${which}`, {
        headers: { Authorization: "Bearer " + token },
      });
      return res.data || [];
    } catch (err) {
      console.error("fetchFollowList err", err);
      return [];
    }
  }

  async function viewFollowList(which: "followers" | "following") {
    if (!profileUser) return;
    setFollowListMode(which);
    setFollowListLoading(true);

    const items = await fetchFollowList(profileUser._id, which);

    setFollowList(items);
    setFollowListLoading(false);
  }

  /* ==========================================================
     RENDER
  =========================================================== */

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">All Users</h2>

        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input w-48"
          />

          <select
            value={listMode}
            onChange={(e) => setListMode(e.target.value as any)}
            className="input"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </div>
      </div>

      {/* USERS */}
      {loading ? (
        <div>Loading users…</div>
      ) : users.length === 0 ? (
        <div>No users found.</div>
      ) : listMode === "grid" ? (
        /* -------------------- GRID MODE -------------------- */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {users.map((u) => (
            <div
              key={u._id}
              className="
                bg-white dark:bg-slate-800
                rounded-xl border border-gray-200 dark:border-gray-700
                p-5 flex flex-col items-center text-center 
                shadow-sm hover:shadow-lg transition-all
                min-h-[280px]
              "
            >
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer mb-3 flex-shrink-0"
                onClick={() => openProfile(u._id)}
              >
                <img
                  src={avatarUrl(u)}
                  className="w-full h-full object-cover"
                  alt={u.username}
                />
              </div>

              {/* Username */}
              <div
                className="mt-1 font-semibold cursor-pointer truncate w-full text-slate-900 dark:text-slate-100"
                onClick={() => openProfile(u._id)}
              >
                {u.username}
              </div>

              {/* Email */}
              <div className="text-xs text-slate-600 dark:text-slate-400 truncate w-full mb-4">
                {u.email}
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2 mt-auto w-full">
                <button
                  className="w-full px-4 py-2 rounded-md bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-sm font-medium hover:shadow-md transition-shadow"
                  onClick={() => startConversation(u)}
                  disabled={processingId === u._id}
                >
                  {processingId === u._id ? "..." : "Message"}
                </button>

                {u._id !== currentUserId && (
                  <button
                    className="w-full px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    onClick={() => followToggle(u, !u.isFollowed)}
                    disabled={processingId === u._id}
                  >
                    {u.isFollowed ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* -------------------- LIST MODE -------------------- */
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="
                flex items-center justify-between 
                p-3 rounded-lg 
                bg-slate-200 dark:bg-slate-800
                border border-gray-300 dark:border-gray-700
              "
            >
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl(u)}
                  alt={u.username}
                  className="w-12 h-12 rounded-md object-cover cursor-pointer"
                  onClick={() => openProfile(u._id)}
                />

                <div>
                  <div
                    className="font-bold cursor-pointer"
                    onClick={() => openProfile(u._id)}
                  >
                    {u.username}
                  </div>
                  <div className="text-xs opacity-60">{u.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded-md bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
                  onClick={() => startConversation(u)}
                >
                  Chat
                </button>

                {u._id !== currentUserId && (
                  <button
                    className="px-3 py-1 rounded-md bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
                    onClick={() => followToggle(u, !u.isFollowed)}
                  >
                    {u.isFollowed ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------------------------------------------
         PROFILE MODAL (works with your new dark/light theme)
      ------------------------------------------------------------------- */}
      {profileOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setProfileOpen(false)}
          />

          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl p-6 w-full max-w-md shadow-2xl">

            {profileLoading ? (
              <div className="text-slate-900 dark:text-slate-100">Loading profile…</div>
            ) : !profileUser ? (
              <div className="text-slate-900 dark:text-slate-100">Profile unavailable</div>
            ) : (
              <>
                {/* Avatar and main info */}
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={avatarUrl(profileUser)}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />

                  <div className="flex-1">
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{profileUser.username}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{profileUser.email}</div>

                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                      <div>Followers: <b className="text-slate-900 dark:text-slate-100">{profileUser.followersCount}</b></div>
                      <div>Following: <b className="text-slate-900 dark:text-slate-100">{profileUser.followingCount}</b></div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    className="w-full px-4 py-2 rounded-md bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-medium hover:shadow-md transition-shadow"
                    onClick={() => startConversation(profileUser)}
                  >
                    Message
                  </button>
                  
                  {profileUser._id !== currentUserId && (
                    <button
                      className="w-full px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      onClick={() =>
                        followToggle(profileUser, !profileUser.isFollowed)
                      }
                    >
                      {profileUser.isFollowed ? "Unfollow" : "Follow"}
                    </button>
                  )}

                  <button
                    className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
