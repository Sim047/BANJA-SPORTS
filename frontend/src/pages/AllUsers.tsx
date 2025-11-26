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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((u) => (
            <div
              key={u._id}
              className="
                bg-white dark:bg-slate-900 
                rounded-xl border border-gray-200 dark:border-gray-800
                p-4 flex flex-col items-center text-center 
                shadow-sm hover:shadow-md transition
              "
            >
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer"
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
                className="mt-3 font-semibold cursor-pointer truncate w-full"
                onClick={() => openProfile(u._id)}
              >
                {u.username}
              </div>

              {/* Email */}
              <div className="text-xs opacity-60 truncate w-full">
                {u.email}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  className="px-4 py-1 rounded-md bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-sm"
                  onClick={() => startConversation(u)}
                  disabled={processingId === u._id}
                >
                  {processingId === u._id ? "..." : "Message"}
                </button>

                {u._id !== currentUserId && (
                  <button
                    className="px-4 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white text-sm"
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setProfileOpen(false)}
          />

          <div className="relative bg-white dark:bg-slate-900 rounded-xl p-6 w-11/12 md:w-1/2 lg:w-1/3 shadow-xl">

            {profileLoading ? (
              <div>Loading profile…</div>
            ) : !profileUser ? (
              <div>Profile unavailable</div>
            ) : (
              <>
                {/* Avatar and main info */}
                <div className="flex items-center gap-4">
                  <img
                    src={avatarUrl(profileUser)}
                    className="w-20 h-20 rounded-lg object-cover"
                  />

                  <div>
                    <div className="text-lg font-semibold">{profileUser.username}</div>
                    <div className="text-xs opacity-60">{profileUser.email}</div>

                    <div className="mt-2 text-sm">
                      <div>Followers: <b>{profileUser.followersCount}</b></div>
                      <div>Following: <b>{profileUser.followingCount}</b></div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  {profileUser._id !== currentUserId && (
                    <button
                      className="px-4 py-1 rounded-md bg-gray-300 dark:bg-gray-700"
                      onClick={() =>
                        followToggle(profileUser, !profileUser.isFollowed)
                      }
                    >
                      {profileUser.isFollowed ? "Unfollow" : "Follow"}
                    </button>
                  )}

                  <button
                    className="px-4 py-1 rounded-md bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
                    onClick={() => startConversation(profileUser)}
                  >
                    Message
                  </button>

                  <button
                    className="px-3 py-1 rounded-md border ml-auto"
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
