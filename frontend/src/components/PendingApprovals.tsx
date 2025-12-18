// frontend/src/components/PendingApprovals.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

dayjs.extend(relativeTime);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Booking {
  _id: string;
  client: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  event?: {
    _id: string;
    title: string;
    sport: string;
  };
  service?: {
    _id: string;
    name: string;
  };
  scheduledDate: string;
  scheduledTime?: string;
  pricing: {
    amount: number;
    currency: string;
  };
  clientNotes?: string;
  createdAt: string;
  bookingType: string;
}

export default function PendingApprovals({ token }: { token: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  async function loadPendingApprovals() {
    try {
      setLoading(true);
      setError("");
      console.log("[PendingApprovals] Loading bookings where I'm the provider...");
      
      const res = await axios.get(`${API}/api/bookings/pending-approvals/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log(`[PendingApprovals] Loaded ${res.data.bookings.length} bookings needing approval`);
      setBookings(res.data.bookings || []);
    } catch (err: any) {
      console.error("[PendingApprovals] Load error:", err);
      setError(err.response?.data?.error || "Failed to load approval requests");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApproval(bookingId: string, approved: boolean) {
    try {
      setProcessing(bookingId);
      const rejectionReason = approved
        ? undefined
        : prompt("Enter reason for rejection (optional):");

      await axios.post(
        `${API}/api/bookings/${bookingId}/approve`,
        { approved, rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from list and reload
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      
      // Show success message
      if (approved) {
        alert("Booking approved! It's now pending payment verification.");
      } else {
        alert("Booking rejected.");
      }
    } catch (err: any) {
      console.error("Approval error:", err);
      alert(err.response?.data?.error || "Failed to process approval");
    } finally {
      setProcessing(null);
    }
  }

  async function handlePaymentVerification(bookingId: string, verified: boolean) {
    try {
      setProcessing(bookingId);
      const notes = verified
        ? prompt("Add notes about payment verification (optional):")
        : prompt("Why is the payment invalid? (optional):");

      await axios.post(
        `${API}/api/bookings/${bookingId}/verify-payment`,
        { verified, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reload pending approvals
      loadPendingApprovals();
      
      if (verified) {
        alert("Payment verified! Booking is now confirmed.");
      } else {
        alert("Payment marked as unverified.");
      }
    } catch (err: any) {
      console.error("Payment verification error:", err);
      alert(err.response?.data?.error || "Failed to verify payment");
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Checking for pending approvals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          <p className="font-medium">Error loading pending approvals</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={loadPendingApprovals}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    // Show a collapsed/minimal state instead of hiding completely
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-4 border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-800 dark:text-green-300 font-medium">
              No requests waiting for your approval ✓
            </span>
          </div>
          <button
            onClick={loadPendingApprovals}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Waiting for My Approval
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {bookings.length} booking request{bookings.length !== 1 ? "s" : ""} awaiting your approval
            </p>
          </div>
        </div>
        <button
          onClick={loadPendingApprovals}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10 border border-orange-200 dark:border-orange-800 rounded-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {booking.client.avatar ? (
                    <img
                      src={booking.client.avatar}
                      alt={booking.client.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {booking.client.username}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.client.email}
                    </p>
                  </div>
                </div>

                <div className="ml-13 space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {booking.event?.title || booking.service?.name || "Session Booking"}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {dayjs(booking.scheduledDate).format("MMM D, YYYY")}
                    </span>
                    {booking.scheduledTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.scheduledTime}
                      </span>
                    )}
                    {/* Pricing removed: events are free */}
                  </div>
                  {booking.clientNotes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                      "{booking.clientNotes}"
                    </p>
                  )}
                  
                  {/* Transaction code removed */}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Requested {dayjs(booking.createdAt).fromNow()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {/* Approval/Rejection buttons for pending-approval status */}
                {booking.approvalStatus === "pending" && (
                  <>
                    <button
                      onClick={() => handleApproval(booking._id, true)}
                      disabled={processing === booking._id}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-green-500/30 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(booking._id, false)}
                      disabled={processing === booking._id}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-red-500/30 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                
                {/* Payment verification removed */}
                
                {/* Show status for free events */}
                {booking.approvalStatus === "approved" && booking.pricing.amount === 0 && (
                  <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium rounded-lg text-center">
                    ✓ Confirmed (Free)
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
