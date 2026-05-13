import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Event, TicketCategory, Voucher } from '../data/mockEvents';
import { apiFetch } from '../lib/api';

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  country: string;
  ticketCategories: TicketCategory[];
  category: string;
  imageUrl: string;
  organizer: string;
  featured: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface EventManagementContextType {
  userEvents: Event[];
  isLoading: boolean;
  createEvent: (eventData: CreateEventData) => Promise<string | null>;
  updateEvent: (eventId: string, eventData: Partial<CreateEventData>) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  getUserEvents: () => Event[];
  createVoucher: (eventId: string, voucherData: Partial<Voucher>) => Promise<boolean>;
  getEventVouchers: (eventId: string) => Promise<Voucher[]>;
  updateVoucher: (voucherId: string, voucherData: Partial<Voucher>) => Promise<boolean>;
  deleteVoucher: (voucherId: string) => Promise<boolean>;
}

const EventManagementContext = createContext<EventManagementContextType | undefined>(undefined);

export const useEventManagement = () => {
  const context = useContext(EventManagementContext);
  if (context === undefined) {
    throw new Error('useEventManagement must be used within an EventManagementProvider');
  }
  return context;
};

interface EventManagementProviderProps {
  children: ReactNode;
}

export const EventManagementProvider: React.FC<EventManagementProviderProps> = ({ children }) => {
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const fetchUserEvents = async () => {
      const token = localStorage.getItem('melaXAccessToken');
      if (!token) {
        setUserEvents([]);
        return;
      }

      try {
        const response = await apiFetch('/api/events/mine');
        if (!response.ok) {
          setUserEvents([]);
          return;
        }

        const data = await response.json();
        setUserEvents(data.success ? data.data.events : []);
      } catch (error) {
        console.error('Error loading user events:', error);
        setUserEvents([]);
      }
    };

    fetchUserEvents();
  }, []);

  const createEvent = async (eventData: CreateEventData): Promise<string | null> => {
    setIsLoading(true);
    
    try {
      const response = await apiFetch('/api/events', {
        method: 'POST',
        body: JSON.stringify({
          ...eventData,
          coordinates: eventData.coordinates || { lat: 27.7172, lng: 85.3240 } // Default to Kathmandu
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }

      if (data.success && data.data.event) {
        // Add the new event to local state
        const newEvent: Event = {
          ...data.data.event
        };

        const updatedEvents = [...userEvents, newEvent];
        setUserEvents(updatedEvents);
        
        return data.data.event._id;
      }
      
      return null;
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<CreateEventData>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiFetch(`/api/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return false;
      }

      const updatedEvents = userEvents.map(event => 
        event.id === eventId 
          ? data.data.event
          : event
      );
      
      setUserEvents(updatedEvents);
      
      return true;
    } catch (error) {
      console.error('Update event error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiFetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return false;
      }

      const updatedEvents = userEvents.filter(event => event.id !== eventId);
      setUserEvents(updatedEvents);
      
      return true;
    } catch (error) {
      console.error('Delete event error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserEvents = (): Event[] => {
    return userEvents;
  };

  const createVoucher = async (eventId: string, voucherData: Partial<Voucher>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/vouchers', {
        method: 'POST',
        body: JSON.stringify({
          ...voucherData,
          eventId
        })
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Create voucher error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getEventVouchers = async (eventId: string): Promise<Voucher[]> => {
    try {
      const response = await apiFetch(`/api/vouchers/event/${eventId}`);

      const data = await response.json();
      return data.success ? data.data.vouchers : [];
    } catch (error) {
      console.error('Get vouchers error:', error);
      return [];
    }
  };

  const updateVoucher = async (voucherId: string, voucherData: Partial<Voucher>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/vouchers/${voucherId}`, {
        method: 'PUT',
        body: JSON.stringify(voucherData)
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Update voucher error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVoucher = async (voucherId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/vouchers/${voucherId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Delete voucher error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: EventManagementContextType = {
    userEvents,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    getUserEvents,
    createVoucher,
    getEventVouchers,
    updateVoucher,
    deleteVoucher
  };

  return (
    <EventManagementContext.Provider value={value}>
      {children}
    </EventManagementContext.Provider>
  );
};
