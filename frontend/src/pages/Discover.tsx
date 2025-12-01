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
import BookingModal from "../components/BookingModal";

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
  
  // Booking modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [token, selectedSport]);

  async function loadData() {
    if (!token) return;
    
    try {
      setLoading(true);
      
      // Load coaches
      const coachParams = new URLSearchParams();
      if (selectedSport) coachParams.append('sport', selectedSport);
      if (searchQuery) coachParams.append('search', searchQuery);
      coachParams.append('limit', '6');
      coachParams.append('featured', 'true');
      
      const coachRes = await axios.get(`${API}/api/coaches?${coachParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Transform coach data to match expected format
      const transformedCoaches = (coachRes.data.coaches || []).map((coach: any) => ({
        _id: coach._id,
        username: coach.userId?.username || 'Coach',
        avatar: coach.userId?.avatar,
        sport: coach.sports?.[0] || 'Coach',
        location: coach.location?.city || '',
        rating: coach.rating?.average || 0,
        hourlyRate: coach.pricing?.hourlyRate || 0,
        verified: coach.verified,
      }));
      
      setCoaches(transformedCoaches);
      
      // Load events
      const eventParams = new URLSearchParams();
      if (selectedSport) eventParams.append('sport', selectedSport);
      eventParams.append('limit', '4');
      eventParams.append('status', 'published');
      
      const eventRes = await axios.get(`${API}/api/events?${eventParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Transform event data
      const transformedEvents = (eventRes.data.events || []).map((event: any) => ({
        _id: event._id,
        title: event.title,
        date: new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: event.time || new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        location: event.location?.name || event.location?.city || 'TBD',
        participants: event.capacity?.current || 0,
        maxParticipants: event.capacity?.max || 0,
      }));
      
      setEvents(transformedEvents);
      
      // Load services
      const serviceParams = new URLSearchParams();
      if (selectedSport) serviceParams.append('sport', selectedSport);
      serviceParams.append('limit', '4');
      serviceParams.append('active', 'true');
      serviceParams.append('featured', 'true');
      
      const serviceRes = await axios.get(`${API}/api/services?${serviceParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Transform service data
      const transformedServices = (serviceRes.data.services || []).map((service: any) => ({
        _id: service._id,
        name: service.name,
        description: service.description,
        price: service.pricing?.amount || 0,
        provider: service.provider?.username || 'Provider',
      }));
      
      setServices(transformedServices);
      
    } catch (err) {
      console.error("Error loading discover data:", err);
    } finally {
      setLoading(false);
    }
  }

  const openBookingModal = (type: string, item: any) => {
    setBookingData({ type, ...item });
    setBookingModalOpen(true);
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await axios.post(`${API}/api/events/${eventId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Reload events to update participant count
      loadData();
    } catch (err: any) {
      console.error("Join event error:", err);
      alert(err.response?.data?.error || "Failed to join event");
    }
  };

  const filteredCoaches = coaches.filter(coach =>
    coach.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.sport?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#071029] dark:via-[#0a1435] dark:to-[#071029]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-600 dark:via-cyan-600 dark:to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Discover Your Next Sport
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Find expert coaches, join exciting events, and book personalized training sessions
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Explore
            </h2>
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
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SPORTS.map((sport) => (
              <button
                key={sport.name}
                onClick={() => setSelectedSport(selectedSport === sport.name ? null : sport.name)}
                className={`
                  relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300
                  ${selectedSport === sport.name 
                    ? 'ring-4 ring-teal-500 scale-105 shadow-2xl shadow-teal-500/50' 
                    : 'hover:scale-105 hover:shadow-xl'
                  }
                `}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${sport.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-2 transform transition-transform duration-300 hover:scale-110">{sport.icon}</div>
                  <div className="text-sm font-semibold text-white">{sport.name}</div>
                </div>
                {selectedSport === sport.name && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
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
              <EventCard key={event._id} event={event} onJoin={handleJoinEvent} />
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
              <ServiceCard key={service._id} service={service} onBook={openBookingModal} />
            ))}
          </div>
        </section>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && bookingData && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          bookingType={bookingData.type}
          itemId={bookingData._id}
          itemName={bookingData.name || bookingData.title}
          providerId={bookingData.provider}
          providerName={bookingData.provider}
          price={bookingData.price}
          token={token}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
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

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 gap-3">
        {coach.hourlyRate && (
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${coach.hourlyRate}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/hr</span>
          </div>
        )}
        <button
          onClick={() => onViewProfile && onViewProfile(coach)}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 whitespace-nowrap"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({ event, onJoin }: { event: Event; onJoin: (id: string) => void }) {
  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-teal-500/30">
          <Calendar className="w-6 h-6 mb-1" />
          <div className="text-xs font-medium">
            {event.date.split(' ')[0]}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
            {event.title}
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="truncate">{event.date} · {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 shrink-0" />
              <span>{event.participants}/{event.maxParticipants} joined</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onJoin(event._id)}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50"
        >
          Join Event
        </button>
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, onBook }: { service: Service; onBook: (type: string, item: any) => void }) {
  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {service.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            by {service.provider}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
          <div className="text-left sm:text-right flex-1 sm:flex-initial">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${service.price}
            </div>
            <div className="text-xs text-gray-500">per session</div>
          </div>
          <button 
            onClick={() => onBook('service', service)}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
