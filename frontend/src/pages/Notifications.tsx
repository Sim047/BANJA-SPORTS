// Notifications Page - View all notifications
import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Bell, ArrowLeft, Calendar, CheckCircle, AlertCircle, Loader, Trash2 } from "lucide-react";

dayjs.extend(relativeTime);

const API = (import.meta as any).env?.VITE_API_URL || "";

export default function Notifications({ token, onBack }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      
      // Load bookings and events to generate notifications
      const [bookingsRes, eventsRes] = await Promise.all([
        axios.get(`${API}/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/events?status=published&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const bookings = bookingsRes.data.bookings || [];
      const events = (eventsRes.data.events || []).filter((event: any) => {
        const eventDate = new Date(event.startDate);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        return eventDate >= now && eventDate <= thirtyDaysFromNow;
      });

      // Create notifications for upcoming bookings
      const upcomingBookings = bookings.filter((booking: any) => {
        if (!booking.scheduledDate) return false;
        const bookingDate = new Date(booking.scheduledDate);
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);
        return bookingDate >= now && bookingDate <= threeDaysFromNow && booking.status === 'confirmed';
      });

      const eventNotifications = events.map((event: any) => ({
        id: event._id,
        type: 'event',
        title: `Upcoming: ${event.title}`,
        message: `${dayjs(event.startDate).format('MMM D')} at ${event.location?.city || 'TBD'}`,
        time: dayjs(event.startDate).fromNow(),
        date: event.startDate,
      }));

      const bookingNotifications = upcomingBookings.map((booking: any) => ({
        id: booking._id,
        type: 'booking',
        title: `Booking reminder`,
        message: `${booking.bookingType} on ${dayjs(booking.scheduledDate).format('MMM D')}`,
        time: dayjs(booking.scheduledDate).fromNow(),
        date: booking.scheduledDate,
      }));

      const allNotifications = [...bookingNotifications, ...eventNotifications]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setNotifications(allNotifications);
    } catch (err) {
      console.error("Load notifications error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with your bookings and events
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'event' 
                      ? 'bg-purple-100 dark:bg-purple-900/30' 
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {notif.type === 'event' ? (
                      <Calendar className={`w-6 h-6 ${
                        notif.type === 'event' 
                          ? 'text-purple-600 dark:text-purple-400' 
                          : 'text-blue-600 dark:text-blue-400'
                      }`} />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {notif.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        notif.type === 'event'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {notif.type === 'event' ? 'Event' : 'Booking'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {notif.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
