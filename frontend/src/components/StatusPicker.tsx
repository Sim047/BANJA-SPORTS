// frontend/src/components/StatusPicker.tsx
import React, { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StatusPicker({ token, currentStatus, onUpdated }: any) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState(currentStatus?.mood || "");
  const [emoji, setEmoji] = useState(currentStatus?.emoji || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!token) return;
    try {
      setSaving(true);
      const res = await axios.post(
        API + "/api/status",
        { mood, emoji },
        { headers: { Authorization: "Bearer " + token } }
      );
      if (res.data) onUpdated(res.data);
      setOpen(false);
    } catch (err) {
      console.error("status save error", err);
    } finally {
      setSaving(false);
    }
  }

  async function clearStatus() {
    if (!token) return;
    try {
      await axios.delete(API + "/api/status", { headers: { Authorization: "Bearer " + token } });
      onUpdated(null);
      setMood("");
      setEmoji("");
      setOpen(false);
    } catch (err) {
      console.error("status clear error", err);
    }
  }

  function setPreset(p: any) {
    setMood(p.mood);
    setEmoji(p.emoji);
    // auto-save for fast UX
    setTimeout(save, 80);
  }

  const presets = [
    { emoji: "🟢", mood: "Online" },
    { emoji: "🔴", mood: "Busy" },
    { emoji: "🌙", mood: "Away" },
  ];

  return (
    <div className="status-picker">
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-semibold text-sm opacity-70">Status</h4>
        <button className="text-xs text-cyan-400 hover:underline" onClick={() => setOpen(!open)}>{open ? "Close" : "Set status"}</button>
      </div>

      {!open && currentStatus && (
        <div className="py-1 px-2 rounded-md inline-flex items-center gap-2 card-status">
          <span>{currentStatus.emoji}</span>
          <span className="text-sm opacity-80">{currentStatus.mood}</span>
        </div>
      )}

      {open && (
        <div className="p-3 rounded-lg card-editor mt-2">
          <div className="flex gap-2 mb-3">
            {presets.map((p) => (
              <button key={p.mood} className="px-2 py-1 rounded-md text-xs bg-slate-700 hover:bg-slate-600" onClick={() => setPreset(p)}>
                {p.emoji} {p.mood}
              </button>
            ))}
          </div>

          <input className="input w-full mb-2" placeholder="Custom status" value={mood} onChange={(e) => setMood(e.target.value)} />
          <input className="input w-full mb-3" placeholder="Emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} />

          <div className="flex gap-2">
            <button className="btn flex-1" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button className="px-4 py-2 border rounded-md" onClick={clearStatus}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}
