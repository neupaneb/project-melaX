import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event } from '../data/mockEvents';
import { apiFetch } from '../lib/api';

interface WishlistItem {
  _id: string;
  userId: string;
  eventId: string;
  eventDetails: Event;
  addedAt: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (event: Event) => Promise<boolean>;
  removeFromWishlist: (eventId: string) => Promise<boolean>;
  isInWishlist: (eventId: string) => boolean;
  clearWishlist: () => Promise<boolean>;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: React.ReactNode;
}

const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    const response = await apiFetch(`/api${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch wishlist from API
  const fetchWishlist = async () => {
    const token = localStorage.getItem('melaXAccessToken');
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await apiRequest('/wishlist');
      if (response.success) {
        setWishlist(response.data.wishlist);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add event to wishlist
  const addToWishlist = async (event: Event): Promise<boolean> => {
    const token = localStorage.getItem('melaXAccessToken');
    if (!token) {
      throw new Error('Please log in to add events to your wishlist');
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/wishlist/add', {
        method: 'POST',
        body: JSON.stringify({
          eventId: event.id,
          eventDetails: event
        }),
      });

      if (response.success) {
        // Refresh wishlist
        await fetchWishlist();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove event from wishlist
  const removeFromWishlist = async (eventId: string): Promise<boolean> => {
    const token = localStorage.getItem('melaXAccessToken');
    if (!token) {
      throw new Error('Please log in to manage your wishlist');
    }

    setIsLoading(true);
    try {
      const response = await apiRequest(`/wishlist/remove/${eventId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        // Update local state immediately for better UX
        setWishlist(prev => prev.filter(item => item.eventId !== eventId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if event is in wishlist
  const isInWishlist = (eventId: string): boolean => {
    return wishlist.some(item => item.eventId === eventId);
  };

  // Clear entire wishlist
  const clearWishlist = async (): Promise<boolean> => {
    const token = localStorage.getItem('melaXAccessToken');
    if (!token) {
      throw new Error('Please log in to manage your wishlist');
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/wishlist/clear', {
        method: 'DELETE',
      });

      if (response.success) {
        setWishlist([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch wishlist when component mounts
  useEffect(() => {
    const token = localStorage.getItem('melaXAccessToken');
    if (token) {
      fetchWishlist();
    }
  }, []);

  const value: WishlistContextType = {
    wishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
