// frontend/src/components/ProfileModal.tsx
import React from "react";
import clsx from "clsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProfileModal({
  user,
  onClose,
  onMessage,
  onFollowToggle,
}: any) {
  if (!user) return null;

  function avatarUrl(u: any) {
    if (!u?.avatar) return "https://placehold.co/120x120?text=User";
    if (u.avatar.startsWith("http")) return u.avatar;
    if (u.avatar.startsWith("/")) return API + u.avatar;
    return API + "/uploads/" + u.avatar;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-xl w-[380px] text-center border border-white/10">

        <img
          src={avatarUrl(user)}
          className="w-24 h-24 rounded-xl mx-auto object-cover border border-white/10"
        />

        <h2 className="mt-3 text-xl font-bold">{user.username}</h2>
        <p className="text-sm opacity-70">{user.email}</p>

        {/* FOLLOWERS & FOLLOWING */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            onClick={() => onFollowToggle("followers", user)}
            className="text-center"
          >
            <div className="text-lg font-bold">{user.followers?.length || 0}</div>
            <div className="text-xs opacity-80">Followers</div>
          </button>

          <button
            onClick={() => onFollowToggle("following", user)}
            className="text-center"
          >
            <div className="text-lg font-bold">{user.following?.length || 0}</div>
            <div className="text-xs opacity-80">Following</div>
          </button>
        </div>

        {/* FOLLOW / UNFOLLOW */}
        {user.isSelf ? null : (
          <button
            onClick={() => onFollowToggle("toggle")}
            className={clsx(
              "mt-5 px-4 py-2 rounded-md w-full font-semibold",
              user.isFollowing
                ? "bg-red-500 text-white"
                : "bg-cyan-500 text-black"
            )}
          >
            {user.isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}

        {/* MESSAGE BUTTON */}
        {!user.isSelf && (
          <button
            onClick={() => onMessage(user)}
            className="mt-3 w-full px-4 py-2 rounded-md border border-white/10 hover:bg-white/10"
          >
            Message
          </button>
        )}

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="mt-4 text-sm opacity-70 hover:opacity-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}
