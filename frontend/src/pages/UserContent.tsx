import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "";

type Tab = "events" | "posts";

export default function UserContent({ token, onNavigate }: any) {
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem("auralink-user-content-tab") as Tab) || "events");
  const [user, setUser] = useState<any>(null);

  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setUserId(localStorage.getItem("auralink-user-content-id"));
  }, []);

  useEffect(() => {
    if (!userId || !token) return;
    axios
      .get(`${API}/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setUser(r.data))
      .catch(() => setUser(null));
  }, [userId, token]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [tab, userId]);

  useEffect(() => {
    if (!userId || !hasMore || loading) return;
    loadPage(page);
  }, [page, userId, tab]);

  function loadPage(p: number) {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    const limit = 20;
    const url = tab === "events"
      ? `${API}/api/events/user/${userId}?page=${p}&limit=${limit}`
      : `${API}/api/posts/user/${userId}?page=${p}&limit=${limit}`;
    axios
      .get(url, { headers })
      .then((r) => {
        const list = tab === "events" ? (r.data.events || []) : (r.data.posts || []);
        setItems((prev) => [...prev, ...list]);
        const total = (tab === "events" ? r.data.total : r.data.totalPosts) || list.length;
        const totalPages = r.data.totalPages || 1;
        setHasMore(p < totalPages);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((pp) => pp + 1);
      }
    });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [hasMore, loading]);

  function formatLocation(loc: any): string {
    try {
      if (!loc) return "";
      if (typeof loc === "string") return loc;
      const parts = [loc.name, loc.city, loc.state, loc.country].filter(Boolean);
      return parts.join(", ");
    } catch {
      return "";
    }
  }

  function openFromCard(item: any) {
    if (tab === "events") {
      try {
        localStorage.setItem("auralink-highlight-event", item._id);
        localStorage.setItem("auralink-discover-category", "sports");
      } catch {}
      onNavigate && onNavigate("discover");
    } else {
      try { localStorage.setItem("auralink-highlight-post", item._id); } catch {}
      onNavigate && onNavigate("posts");
    }
  }

  return (
    <div className="min-h-screen themed-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-heading">{user?.username || "User"}</h1>
            <p className="text-theme-secondary text-sm">{user?.status || (user?.username ? `@${user.username}` : "")}</p>
          </div>
          <button className="text-sm px-3 py-2 rounded-xl border" style={{ borderColor: 'var(--border)' }} onClick={() => onNavigate && onNavigate('dashboard')}>Back</button>
        </div>

        <div className="flex items-center gap-3">
          <button
            className={`px-3 py-2 rounded-xl text-sm font-semibold ${tab === 'events' ? 'bg-cyan-600 text-white' : 'themed-card'}`}
            onClick={() => { setTab('events'); localStorage.setItem('auralink-user-content-tab', 'events'); }}
          >
            Events
          </button>
          <button
            className={`px-3 py-2 rounded-xl text-sm font-semibold ${tab === 'posts' ? 'bg-purple-600 text-white' : 'themed-card'}`}
            onClick={() => { setTab('posts'); localStorage.setItem('auralink-user-content-tab', 'posts'); }}
          >
            Posts
          </button>
        </div>

        <div className="space-y-3">
          {items.map((it) => (
            <button key={it._id} onClick={() => openFromCard(it)} className="w-full text-left p-3 rounded-xl themed-card hover:shadow-md">
              {tab === 'events' ? (
                <div className="flex items-center gap-3">
                  <img src={it.image || 'https://placehold.co/80x80?text=E'} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-heading truncate">{it.title || 'Untitled Event'}</div>
                    <div className="text-xs text-theme-secondary truncate">{formatLocation(it.location)}</div>
                    <div className="text-xs text-cyan-500">{it.startDate ? new Date(it.startDate).toLocaleDateString() : ''}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={it.imageUrl || 'https://placehold.co/80x80?text=P'} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-heading truncate">{it.title || 'Post'}</div>
                    <div className="text-xs text-theme-secondary line-clamp-2">{it.caption || ''}</div>
                  </div>
                </div>
              )}
            </button>
          ))}

          <div ref={sentinelRef} className="py-4 text-center text-sm text-theme-secondary">
            {loading ? 'Loading…' : (hasMore ? 'Scroll to load more' : 'End of results')}
          </div>
        </div>
      </div>
    </div>
  );
}
