// frontend/src/components/ConversationsList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PLACEHOLDER = "https://placehold.co/40x40?text=U";

export default function ConversationsList({
  token,
  onOpenConversation,
  currentUserId,
  onShowProfile,
}: any) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(API + "/api/conversations", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((r) => setConversations(r.data || []))
      .catch((err) => console.error("ConversationsList error:", err));
  }, [token]);

  function avatarUrl(u: any) {
    if (!u?.avatar) return PLACEHOLDER;
    if (u.avatar.startsWith("http")) return u.avatar;
    if (u.avatar.startsWith("/")) return API + u.avatar;
    return API + "/uploads/" + u.avatar;
  }

  return (
    <div className="px-2 mt-4">
      <h4 className="font-semibold mb-2">Messages</h4>

      <div className="flex flex-col gap-3">
        {conversations.map((c: any) => {
          const partner = (c.participants || []).find(
            (p: any) => String(p._id) !== String(currentUserId)
          );

          if (!partner) return null;

          return (
            <div
              key={c._id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-800/40 cursor-pointer"
            >
              {/* CLICK PROFILE */}
              <img
                src={avatarUrl(partner)}
                onClick={() => onShowProfile(partner)}
                className="w-10 h-10 rounded-md object-cover"
              />

              <div
                className="flex-1"
                onClick={() => onShowProfile(partner)}
              >
                <div className="font-semibold">{partner.username}</div>
                <div className="text-xs opacity-60">{partner.email}</div>
              </div>

              <button
                className="px-3 py-1 rounded-md border"
                onClick={() => onOpenConversation(c)}
              >
                Open
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
