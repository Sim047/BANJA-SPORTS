// frontend/src/components/ConversationsList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Avatar from "./Avatar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PLACEHOLDER = "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

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
    <div className="flex flex-col gap-2 sm:gap-3">
      {conversations.length === 0 ? (
        <div className="text-center py-12 text-slate-600 dark:text-slate-400">
          <div className="text-4xl mb-3">💬</div>
          <div>No conversations yet</div>
          <div className="text-xs mt-2">Start chatting with users from the All Users page</div>
        </div>
      ) : (
        conversations.map((c: any) => {
          const partner = (c.participants || []).find(
            (p: any) => String(p._id) !== String(currentUserId)
          );

          if (!partner) return null;

          return (
            <div
              key={c._id}
              className="
                flex flex-col sm:flex-row sm:items-center sm:justify-between 
                p-3 sm:p-4 rounded-lg 
                bg-white dark:bg-slate-800
                border border-gray-200 dark:border-gray-700
                hover:shadow-md transition-all
                gap-3
              "
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar
                  src={avatarUrl(partner)}
                  onClick={() => onShowProfile(partner)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-md object-cover cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                  alt={partner.username}
                />

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onShowProfile(partner)}
                >
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                    {partner.username}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {partner.email}
                  </div>
                </div>
              </div>

              <button
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-sm font-medium hover:shadow-md transition-shadow flex-shrink-0"
                onClick={() => onOpenConversation(c)}
              >
                Open Chat
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
