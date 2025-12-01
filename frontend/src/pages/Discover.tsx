// frontend/src/pages/Discover.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  Clock,
  ChevronRight,
  Filter,
  X
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

type Coach = {
  _id: string;
  username: string;
  avatar?: string;
  sport?: string;
  location?: string;
  rating?: number;
  hourlyRate?: number;
  verified?: boolean;
};

type Event = {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
};

type Service = {
  _id: string;
  name: string;
  description: string;
  price: number;
  provider: string;
};

const SPORTS = [
  { name: "Football", icon: "⚽", color: "from-emerald-500 to-teal-500" },
  { name: "Hockey", icon: "🏒", color: "from-blue-500 to-cyan-500" },
  { name: "Basketball", icon: "🏀", color: "from-orange-500 to-red-500" },
  { name: "Tennis", icon: "🎾", color: "from-yellow-500 to-amber-500" },
  { name: "Yoga", icon: "🧘", color: "from-purple-500 to-pink-500" },
  { name: "Swimming", icon: "🏊", color: "from-cyan-500 to-blue-500" },
];

export default function Discover({ token, onViewProfile }: any) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [token, selectedSport]);

  async function loadData() {
    if (!token) return;
    
    try {
      setLoading(true);
      
      // Load coaches
      const coachRes = await axios.get(`${API}/api/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { sport: selectedSport }
      });
      
      // Mock data for now - replace with actual API calls
      setCoaches(coachRes.data || []);
      
      setEvents([
        {
          _id: "1",
          title: "5v5 Football Clinic",
          date: "May 18-22",
          time: "4:00 PM",
          location: "Central Park",
          participants: 12,
          maxParticipants: 20
        },
        {
          _id: "2",
          title: "Evening Bootcamp",
          date: "June 10-15",
          time: "6:00 PM",
          location: "Fitness Studio A",
          participants: 8,
          maxParticipants: 15
        }
      ]);

      setServices([
        {
          _id: "1",
          name: "Personalized Training",
          description: "One-on-one coaching session",
          price: 200,
          provider: "Elite Coaches"
        },
        {
          _id: "2",
          name: "Group Fitness Classes",
          description: "Fun group workout sessions",
          price: 50,
          provider: "Fitness Hub"
        }
      ]);
      
    } catch (err) {
      console.error("Error loading discover data:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredCoaches = coaches.filter(coach =>
    coach.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.sport?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#071029]">
      {/* Header */}
      <div className="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Discover
            </h1>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search coaches, sports, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-teal-500 dark:text-white placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Browse by Sport */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Browse by Sport
            </h2>
            <button className="text-teal-500 hover:text-teal-600 text-sm font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SPORTS.map((sport) => (
              <button
                key={sport.name}
                onClick={() => setSelectedSport(selectedSport === sport.name ? null : sport.name)}
                className={`
                  relative overflow-hidden rounded-2xl p-6 text-center transition-all
                  ${selectedSport === sport.name 
                    ? 'ring-2 ring-teal-500 scale-105' 
                    : 'hover:scale-105'
                  }
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${sport.color} opacity-90`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-2">{sport.icon}</div>
                  <div className="text-sm font-medium text-white">{sport.name}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Find a Coach */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Find a Coach
            </h2>
            <button className="text-teal-500 hover:text-teal-600 text-sm font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCoaches.slice(0, 6).map((coach) => (
                <CoachCard
                  key={coach._id}
                  coach={coach}
                  onViewProfile={onViewProfile}
                />
              ))}
            </div>
          )}
        </section>

        {/* Events */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Events
            </h2>
            <button className="text-teal-500 hover:text-teal-600 text-sm font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>

        {/* Services */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Services
            </h2>
            <button className="text-teal-500 hover:text-teal-600 text-sm font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Coach Card Component
function CoachCard({ coach, onViewProfile }: { coach: Coach; onViewProfile: any }) {
  const avatarUrl = coach.avatar?.startsWith('http') 
    ? coach.avatar 
    : `https://ui-avatars.com/api/?name=${coach.username}&background=0D8ABC&color=fff`;

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={avatarUrl}
          alt={coach.username}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/20"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {coach.username}
            </h3>
            {coach.verified && (
              <svg className="w-4 h-4 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {coach.sport || "Coach"}
          </p>
        </div>
      </div>

      {coach.location && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4" />
          <span>{coach.location}</span>
        </div>
      )}

      {coach.rating && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {coach.rating}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        {coach.hourlyRate && (
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${coach.hourlyRate}
            <span className="text-sm font-normal text-gray-500">/hr</span>
          </div>
        )}
        <button
          onClick={() => onViewProfile && onViewProfile(coach)}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition group-hover:scale-105"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex flex-col items-center justify-center text-white shrink-0">
          <Calendar className="w-6 h-6 mb-1" />
          <div className="text-xs font-medium">
            {event.date.split('-')[0]}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {event.title}
          </h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{event.date} · {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{event.participants}/{event.maxParticipants} joined</span>
            </div>
          </div>
        </div>

        <button className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition">
          Join
        </button>
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {service.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {service.provider}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${service.price}
            </div>
            <div className="text-xs text-gray-500">per session</div>
          </div>
          <button className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition whitespace-nowrap">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
