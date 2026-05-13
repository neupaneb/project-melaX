import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { FilterState } from '../components/AdvancedFilters';
import { Event } from '../data/mockEvents';
import { Movie } from '../data/mockMovies';
import { apiUrl } from '../lib/api';

interface SearchContextType {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  filteredEvents: Event[];
  filteredMovies: Movie[];
  searchResults: {
    events: Event[];
    movies: Movie[];
  };
  isSearchActive: boolean;
  isLoading: boolean;
  fetchEvents: (filterParams?: any) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
  events: Event[];
  movies: Movie[];
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children, events, movies }) => {
  const getInitialFilters = (): FilterState => {
    return {
      searchQuery: '',
      dateRange: { from: undefined, to: undefined },
      priceRange: [0, 10000],
      categories: [],
      cities: [],
      countries: [],
      organizers: [],
      featured: null,
      timeSlots: [],
      genres: [],
      movieCities: [],
      ratings: [],
      languages: [],
      ageRatings: [],
      sortBy: 'date',
      sortOrder: 'asc',
      resultsPerPage: 12
    };
  };

  const [filters, setFilters] = useState<FilterState>(getInitialFilters);

  const [dbEvents, setDbEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = async (filterParams?: any) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filterParams) {
        if (filterParams.searchQuery) queryParams.append('search', filterParams.searchQuery);
        if (filterParams.categories?.length > 0) queryParams.append('category', filterParams.categories[0]);
             if (filterParams.cities?.length > 0) queryParams.append('city', filterParams.cities[0]);
             if (filterParams.countries?.length > 0) queryParams.append('country', filterParams.countries[0]);
        if (filterParams.featured !== null) queryParams.append('featured', filterParams.featured.toString());
        if (filterParams.priceRange) {
          queryParams.append('minPrice', filterParams.priceRange[0].toString());
          queryParams.append('maxPrice', filterParams.priceRange[1].toString());
        }
        if (filterParams.dateRange?.from) queryParams.append('dateFrom', filterParams.dateRange.from.toISOString().split('T')[0]);
        if (filterParams.dateRange?.to) queryParams.append('dateTo', filterParams.dateRange.to.toISOString().split('T')[0]);
        if (filterParams.sortBy) queryParams.append('sortBy', filterParams.sortBy);
        if (filterParams.sortOrder) queryParams.append('sortOrder', filterParams.sortOrder);
        if (filterParams.resultsPerPage) queryParams.append('limit', filterParams.resultsPerPage.toString());
      }

      const response = await fetch(apiUrl(`/api/events?${queryParams.toString()}`));
      const data = await response.json();
      
      if (data.success) {
        setDbEvents(data.data.events);
      } else {
        console.error('Failed to fetch events:', data.message);
        setDbEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setDbEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const clearFilters = () => {
    setFilters(getInitialFilters());
  };

  // Return all events without filtering
  const filteredEvents = useMemo(() => {
    return [...dbEvents];
  }, [dbEvents]);

  // Return all movies without filtering
  const filteredMovies = useMemo(() => {
    return [...movies];
  }, [movies]);

  // Combined search results
  const searchResults = useMemo(() => ({
    events: filteredEvents,
    movies: filteredMovies
  }), [filteredEvents, filteredMovies]);

  const isSearchActive = Boolean(
    filters.searchQuery ||
    filters.categories.length ||
    filters.cities.length ||
    filters.countries.length ||
    filters.organizers.length ||
    filters.timeSlots.length ||
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.featured !== null
  );

  const value: SearchContextType = {
    filters,
    setFilters,
    clearFilters,
    filteredEvents,
    filteredMovies,
    searchResults,
    isSearchActive,
    isLoading,
    fetchEvents
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
