// frontend/src/components/MyJoinRequests.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

dayjs.extend(relativeTime);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface MyJoinRequest {
  event: {
    _id: string;
    title: string;
    startDate: string;
    location: any;
    organizer: {
      _id: string;
      username: string;
      avatar?: string;
    };
  };
  request: {
    _id: string;
    transactionCode: string;
    requestedAt: string;
    status: "pending" | "approved" | "rejected";
  };
}

export default function MyJoinRequests({ token }: { token: string }) {
  const [requests, setRequests] = useState<MyJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("MyJoinRequests component mounted, token:", !!token);
    loadMyRequests();
  }, [token]);

  async function loadMyRequests() {
    if (!token) return;
    
    try {
      setLoading(true);
      console.log("MyJoinRequests: Fetching join requests...");
      const res = await axios.get(`${API}/api/events/my-join-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("MyJoinRequests: Received data:", res.data);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Error loading my join requests:", err);
      // Silently fail - just show no requests
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
        <p className="text-slate-400 mt-2">Loading your requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return null; // Don't show anything if no requests
  }

  const pendingRequests = requests.filter(r => r.request.status === "pending");
  
  console.log("MyJoinRequests: Total requests:", requests.length, "Pending:", pendingRequests.length);

  if (pendingRequests.length === 0) {
    return null; // Only show pending requests
  }

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-8 border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        Your Pending Join Requests ({pendingRequests.length})
      </h2>

      <div className="space-y-4">
        {pendingRequests.map((item) => (
          <div
            key={item.request._id}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                  {item.event.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{dayjs(item.event.startDate).format("MMM D, YYYY")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Requested {dayjs(item.request.requestedAt).fromNow()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium border border-yellow-200 dark:border-yellow-700">
                <AlertCircle className="w-4 h-4" />
                Pending Approval
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                Organizer: <span className="text-gray-700 dark:text-gray-300 font-medium">{item.event.organizer.username}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Transaction Code: <span className="text-gray-700 dark:text-gray-300 font-mono">{item.request.transactionCode}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
