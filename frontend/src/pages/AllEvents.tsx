// All Events - Organized view of all user events
import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { 
  Calendar, Clock, MapPin, Users, ArrowLeft, 
  Filter, CheckCircle, XCircle, AlertCircle, 
  Loader, Star, Trophy, DollarSign
} from "lucide-react";

dayjs.extend(relativeTime);

const API = (import.meta as any).env?.VITE_API_URL || "";

type FilterType = "all" | "participating" | "organizing" | "upcoming" | "past";

export default function AllEvents({ token, onBack, onNavigate, onViewEvent }: any) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");
      
      // Load all events (both created and participating)
      const [createdRes, participatingRes] = await Promise.all([
        axios.get(`${API}/api/events/my/created`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/events?status=published`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const created = (createdRes.data.events || []).map((e: any) => ({ ...e, role: "organizing" }));
      const all = participatingRes.data.events || [];
      
      // Get user ID from token
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      
      const participating = all
        .filter((e: any) => e.participants?.some((p: any) => p._id === userId || p === userId))
        .map((e: any) => ({ ...e, role: "participating" }));

      // Combine and deduplicate
      const combined = [...created];
      participating.forEach((p: any) => {
        if (!combined.find((c: any) => c._id === p._id)) {
          combined.push(p);
        }
      });

      setEvents(combined);
    } catch (err: any) {
      console.error("Load events error:", err);
      setError(err.response?.data?.error || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  const getFilteredEvents = () => {
    const now = new Date();
    
    switch (filter) {
      case "organizing":
        return events.filter(e => e.role === "organizing");
      case "participating":
        return events.filter(e => e.role === "participating");
      case "upcoming":
        return events.filter(e => new Date(e.startDate) >= now);
      case "past":
        return events.filter(e => new Date(e.startDate) < now);
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  const stats = {
    all: events.length,
    organizing: events.filter(e => e.role === "organizing").length,
    participating: events.filter(e => e.role === "participating").length,
    upcoming: events.filter(e => new Date(e.startDate) >= new Date()).length,
    past: events.filter(e => new Date(e.startDate) < new Date()).length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                All Events
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all your events in one place
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`p-4 rounded-xl transition-all ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 hover:border-blue-500"
            }`}
          >
            <p className={`text-sm mb-1 ${filter === "all" ? "text-blue-100" : "text-gray-600 dark:text-gray-400"}`}>
              All Events
            </p>
            <p className="text-2xl font-bold">{stats.all}</p>
          </button>

          <button
            onClick={() => setFilter("organizing")}
            className={`p-4 rounded-xl transition-all ${
              filter === "organizing"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                : "bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 hover:border-purple-500"
            }`}
          >
            <p className={`text-sm mb-1 ${filter === "organizing" ? "text-purple-100" : "text-gray-600 dark:text-gray-400"}`}>
              Organizing
            </p>
            <p className="text-2xl font-bold">{stats.organizing}</p>
          </button>

          <button
            onClick={() => setFilter("participating")}
            className={`p-4 rounded-xl transition-all ${
              filter === "participating"
                ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                : "bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 hover:border-green-500"
            }`}
          >
            <p className={`text-sm mb-1 ${filter === "participating" ? "text-green-100" : "text-gray-600 dark:text-gray-400"}`}>
              Participating
            </p>
            <p className="text-2xl font-bold">{stats.participating}</p>
          </button>

          <button
            onClick={() => setFilter("upcoming")}
            className={`p-4 rounded-xl transition-all ${
              filter === "upcoming"
                ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                : "bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 hover:border-orange-500"
            }`}
          >
            <p className={`text-sm mb-1 ${filter === "upcoming" ? "text-orange-100" : "text-gray-600 dark:text-gray-400"}`}>
              Upcoming
            </p>
            <p className="text-2xl font-bold">{stats.upcoming}</p>
          </button>

          <button
            onClick={() => setFilter("past")}
            className={`p-4 rounded-xl transition-all ${
              filter === "past"
                ? "bg-gray-600 text-white shadow-lg shadow-gray-500/30"
                : "bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-800 hover:border-gray-500"
            }`}
          >
            <p className={`text-sm mb-1 ${filter === "past" ? "text-gray-100" : "text-gray-600 dark:text-gray-400"}`}>
              Past
            </p>
            <p className="text-2xl font-bold">{stats.past}</p>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
            {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No {filter !== "all" ? filter : ""} events
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === "organizing" 
                ? "You haven't created any events yet"
                : filter === "participating"
                ? "You're not participating in any events"
                : filter === "upcoming"
                ? "No upcoming events"
                : filter === "past"
                ? "No past events"
                : "No events found"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isPast = new Date(event.startDate) < new Date();
              
              return (
                <div
                  key={event._id}
                  onClick={() => onViewEvent && onViewEvent(event._id)}
                  className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                >
                  {/* Role Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {event.role === "organizing" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Organizing
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Participating
                      </span>
                    )}
                  </div>

                  {/* Past Event Overlay */}
                  {isPast && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                        Past
                      </span>
                    </div>
                  )}

                  <div className={`space-y-4 ${isPast ? 'opacity-60' : ''}`}>
                    {/* Sport Badge */}
                    {event.sport && (
                      <div className="flex items-center gap-2 mt-8">
                        <Trophy className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {event.sport}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>

                    {/* Details */}
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{dayjs(event.startDate).format("MMM D, YYYY")}</span>
                        {event.time && <span>at {event.time}</span>}
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span>
                            {event.location.city || event.location.name}
                            {event.location.state && `, ${event.location.state}`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span>
                          {event.participants?.length || 0} / {event.capacity?.max || 0} participants
                        </span>
                      </div>

                      {event.pricing && event.pricing.amount > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-semibold">
                            {event.pricing.currency} {event.pricing.amount}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Organizer */}
                    {event.organizer && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          By {event.organizer.username}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
