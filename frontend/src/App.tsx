import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { HeroCarousel } from "./components/HeroCarousel";
import { EventCard } from "./components/EventCard";
import { MovieCard } from "./components/MovieCard";
import { EventDetailModal } from "./components/EventDetailModal";
import { MovieDetailModal } from "./components/MovieDetailModal";
import { MyEvents } from "./components/MyEvents";
import { PaymentModal } from "./components/PaymentModal";
import { AddEventModal } from "./components/AddEventModal";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { mockEvents, Event } from "./data/mockEvents";
import { mockMovies, Movie } from "./data/mockMovies";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { PaymentProvider } from "./contexts/PaymentContext";
import { EventManagementProvider, useEventManagement } from "./contexts/EventManagementContext";
import { useSearch } from "./contexts/SearchContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SearchProvider } from "./contexts/SearchContext";
import { EmailVerificationHandler } from "./components/EmailVerificationHandler";
import { WishlistPage } from "./components/WishlistPage";
import { Filters } from "./components/Filters";

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PaymentProvider>
            <EventManagementProvider>
              <WishlistProvider>
                <SearchProvider events={[]} movies={mockMovies}>
                  <AppContent />
                </SearchProvider>
              </WishlistProvider>
            </EventManagementProvider>
          </PaymentProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  
  // Check if this is a password reset page
  if (location.pathname === '/reset-password') {
    return <ResetPasswordPage />;
  }

  // Check if this is an email verification page
  const urlParams = new URLSearchParams(window.location.search);
  const isEmailVerification = urlParams.get('token') || window.location.pathname.includes('verify-email');
  
  // If this is an email verification page, show the verification handler
  if (isEmailVerification) {
    return <EmailVerificationHandler />;
  }

  // Navigation state
  const [activeTab, setActiveTab] = useState<'events' | 'movies' | 'my-events' | 'wishlist'>('events');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedDate, setSelectedDate] = useState("all");
  
  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  // Event management
  const { userEvents } = useEventManagement();
  
  // Advanced search context
  const { filteredEvents: advancedFilteredEvents, filteredMovies: advancedFilteredMovies, isSearchActive, filters, setFilters, fetchEvents } = useSearch();

  // Filter events based on search and filters
  const filteredEvents = useMemo(() => {
    // Always use advanced search results (which now come from database)
    return advancedFilteredEvents;
  }, [advancedFilteredEvents]);

  // Filter movies based on search and filters
  const filteredMovies = useMemo(() => {
    // Use advanced search results if search is active, otherwise show all movies
    if (isSearchActive) {
      return advancedFilteredMovies;
    }
    
    // Simple search filter when advanced filters are not active
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return mockMovies.filter((movie) => 
        movie.title.toLowerCase().includes(query) ||
        movie.description.toLowerCase().includes(query) ||
        movie.genre.some(g => g.toLowerCase().includes(query)) ||
        movie.director.toLowerCase().includes(query) ||
        movie.cast.some(c => c.toLowerCase().includes(query))
      );
    }
    
    return mockMovies;
  }, [searchQuery, advancedFilteredMovies, isSearchActive]);

  const featuredEvents = useMemo(() => {
    // Use database events for featured events
    return advancedFilteredEvents.filter(event => event.featured);
  }, [advancedFilteredEvents]);
  const featuredMovies = mockMovies.filter(movie => movie.featured);

  const buildDateRange = (dateFilter: string) => {
    if (dateFilter === 'all') {
      return { from: undefined, to: undefined };
    }

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);

    if (dateFilter === 'today') {
      end.setDate(start.getDate() + 1);
    } else if (dateFilter === 'weekend') {
      const day = start.getDay();
      const daysUntilSaturday = (6 - day + 7) % 7;
      start.setDate(start.getDate() + daysUntilSaturday);
      end.setTime(start.getTime());
      end.setDate(start.getDate() + 2);
    } else if (dateFilter === 'week') {
      end.setDate(start.getDate() + 7);
    } else if (dateFilter === 'month') {
      end.setMonth(start.getMonth() + 1);
    }

    return { from: start, to: end };
  };

  useEffect(() => {
    if (activeTab !== 'events') {
      return;
    }

    const dateRange = buildDateRange(selectedDate);
    const nextFilters = {
      ...filters,
      searchQuery,
      categories: selectedCategory !== 'All' ? [selectedCategory] : [],
      cities: selectedCity !== 'All Cities' ? [selectedCity] : [],
      dateRange,
      countries: [],
      organizers: [],
      timeSlots: [],
      featured: null,
    };

    setFilters(nextFilters);
    fetchEvents(nextFilters);
  }, [activeTab, searchQuery, selectedCategory, selectedCity, selectedDate]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsMovieModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCloseMovieModal = () => {
    setIsMovieModalOpen(false);
    setSelectedMovie(null);
  };

  const handleTabChange = (tab: 'events' | 'movies' | 'my-events' | 'wishlist') => {
    setActiveTab(tab);
    setSearchQuery(""); // Clear search when switching tabs
  };

  const handleMyEventsClick = () => {
    setActiveTab('my-events');
  };

  const handleAddEventClick = () => {
    setIsAddEventModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onMyEventsClick={handleMyEventsClick}
        onAddEventClick={handleAddEventClick}
      />

      {activeTab === 'events' && (
        <Filters
          selectedCategory={selectedCategory}
          selectedCity={selectedCity}
          selectedDate={selectedDate}
          onCategoryChange={setSelectedCategory}
          onCityChange={setSelectedCity}
          onDateChange={setSelectedDate}
        />
      )}

      <main>
        {activeTab === 'my-events' ? (
          <MyEvents />
        ) : activeTab === 'wishlist' ? (
          <WishlistPage />
        ) : activeTab === 'events' ? (
          <>
            {/* Hero Section - Only show when no advanced filters are applied */}
            {!isSearchActive && (
              <HeroCarousel 
                featuredEvents={featuredEvents}
                onEventClick={handleEventClick}
              />
            )}

            {/* Events Section */}
            <section className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#12325b] dark:text-blue-300">
                    {isSearchActive ? `Filtered Results` : searchQuery ? `Search Results` : 'Upcoming Events'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>
              </div>

              {/* Events Grid */}
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEventClick={handleEventClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search criteria or check back later for new events.
                  </p>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* Featured Movies Hero - Only show when no advanced filters are applied */}
            {!isSearchActive && (
              <section className="py-12" style={{ backgroundColor: "#081a33" }}>
                <div className="container mx-auto px-4">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Featured Movies</h2>
                    <p className="mb-0" style={{ color: "#d9e6f5" }}>Don't miss these amazing films</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredMovies.slice(0, 3).map((movie) => (
                      <div key={movie.id} className="relative group cursor-pointer" onClick={() => handleMovieClick(movie)}>
                        <div className="relative overflow-hidden rounded-lg">
                          <ImageWithFallback
                            src={movie.imageUrl}
                            alt={movie.title}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 transition-all duration-300" style={{ backgroundColor: "rgba(8, 26, 51, 0.55)" }}></div>
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <h3 className="text-lg font-semibold mb-1">{movie.title}</h3>
                            <p className="text-sm text-gray-200">{movie.genre.join(", ")}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Movies Section */}
            <section className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#12325b] dark:text-blue-300">
                    {isSearchActive ? `Filtered Results` : searchQuery ? `Search Results` : 'Movies'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} found
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>
              </div>

              {/* Movies Grid */}
              {filteredMovies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onMovieClick={handleMovieClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M7 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2V4zM9 12a2 2 0 000 4h6a2 2 0 000-4H9z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No movies found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search criteria or check back later for new movies.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={handleCloseEventModal}
      />

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={isMovieModalOpen}
        onClose={handleCloseMovieModal}
      />

      {/* Toast Notifications */}
      <Toaster position="top-right" />
      
      {/* Payment Modal */}
      <PaymentModal />
      
      {/* Add Event Modal */}
      <AddEventModal 
        isOpen={isAddEventModalOpen} 
        onClose={() => setIsAddEventModalOpen(false)} 
      />
    </div>
  );
}