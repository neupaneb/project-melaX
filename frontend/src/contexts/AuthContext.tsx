import React, { createContext, useContext, useState, useEffect } from 'react';
import { PurchasedEvent } from '../data/mockPurchasedEvents';
import { mockEvents } from '../data/mockEvents';
import { apiFetch } from '../lib/api';

export interface User {
  _id: string;
  id?: string; // For backward compatibility
  email?: string;
  phone?: string;
  name: string;
  createdAt: Date;
  googleId?: string;
  avatar?: string;
  authProvider: 'email' | 'phone' | 'google';
  role: 'user' | 'admin' | 'super_admin';
  isSuperAdmin?: boolean;
  adminInvitedBy?: string;
  adminInvitedAt?: string;
  permissions: string[];
  isVerified: boolean;
  lastLogin?: Date;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: 'en' | 'ne' | 'hi';
    currency: 'NPR' | 'USD' | 'INR';
    theme: 'light' | 'dark' | 'auto';
  };
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  purchasedEvents: PurchasedEvent[];
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  signup: (name: string, emailOrPhone: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  logout: () => void;
  purchaseEvent: (eventId: string, quantity: number, totalPrice: number, transactionId?: string, paymentGateway?: string) => Promise<boolean>;
  cancelEvent: (purchaseId: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: any;
}

const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<any>> => {
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasedEvents, setPurchasedEvents] = useState([]);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('melaXAccessToken');
      const savedPurchasedEvents = localStorage.getItem('melaXPurchasedEvents');
      
      if (token) {
        try {
          // Verify token and get current user
          const response = await apiRequest('/auth/me');
          if (response.success && response.data) {
            const userData = response.data.user;
            // Ensure backward compatibility
            userData.id = userData._id;
            setUser(userData);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Clear invalid tokens
          localStorage.removeItem('melaXAccessToken');
          localStorage.removeItem('melaXRefreshToken');
          localStorage.removeItem('melaXUser');
        }
      }
      
      // Only load from localStorage if no user is authenticated
      // When user is authenticated, we'll fetch fresh data from database
      if (savedPurchasedEvents && !token) {
        try {
          const eventsData = JSON.parse(savedPurchasedEvents);
          setPurchasedEvents(eventsData);
        } catch (error) {
          console.error('Error parsing saved purchased events:', error);
          localStorage.removeItem('melaXPurchasedEvents');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Function to fetch tickets from database
  const fetchTickets = async () => {
    if (!user) return;
    
    try {
      const response = await apiFetch('/api/tickets/my-tickets');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data.tickets) {
          // Convert tickets to PurchasedEvent format using actual database data
          const events = data.data.tickets.map((ticket: any) => ({
            id: ticket.purchaseId,
            eventId: ticket.eventId,
            event: {
              id: ticket.eventId,
              title: ticket.eventDetails.title,
              date: ticket.eventDetails.date,
              time: ticket.eventDetails.time,
              location: ticket.eventDetails.venue,
              city: ticket.eventDetails.city,
              country: ticket.eventDetails.country,
              price: { min: ticket.unitPrice, max: ticket.unitPrice, currency: ticket.currency },
              category: 'Event',
              imageUrl: ticket.eventDetails.imageUrl,
              organizer: ticket.eventDetails.organizer,
              description: ticket.eventDetails.description,
              ticketUrl: '#',
              featured: false,
              coordinates: { lat: 0, lng: 0 }
            },
            purchaseDate: ticket.purchaseDate,
            quantity: ticket.quantity,
            totalPrice: ticket.totalAmount,
            originalAmount: ticket.originalAmount || ticket.totalAmount,
            discountAmount: ticket.discountAmount || 0,
            appliedVouchers: ticket.appliedVouchers || [],
            status: ticket.status,
            ticketNumber: ticket.ticketId,
            transactionId: ticket.transactionId,
            paymentMethod: ticket.paymentMethod,
            receiptId: ticket.ticketId,
            currency: ticket.currency
          }));
          
          setPurchasedEvents(events);
          localStorage.setItem('melaXPurchasedEvents', JSON.stringify(events));
        }
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  // Fetch tickets when user is authenticated
  useEffect(() => {
    if (user) {
      fetchTickets();
    } else {
      setPurchasedEvents([]);
    }
  }, [user]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Nepal phone number validation (supports both formats)
    const phoneRegex = /^(\+977|977)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const isEmailOrPhone = (input: string): 'email' | 'phone' | 'invalid' => {
    if (validateEmail(input)) return 'email';
    if (validatePhone(input)) return 'phone';
    return 'invalid';
  };

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const inputType = isEmailOrPhone(emailOrPhone);
      if (inputType === 'invalid') {
        throw new Error('Please enter a valid email address or phone number');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Call the real API
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ emailOrPhone, password }),
      });

      if (response.success && response.data) {
        const { user: userData, tokens } = response.data;
        
        // Store tokens
        localStorage.setItem('melaXAccessToken', tokens.accessToken);
        localStorage.setItem('melaXRefreshToken', tokens.refreshToken);
        
        // Ensure backward compatibility
        userData.id = userData._id;
        
        setUser(userData);
        localStorage.setItem('melaXUser', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, emailOrPhone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (!name.trim()) {
        throw new Error('Name is required');
      }

      const inputType = isEmailOrPhone(emailOrPhone);
      if (inputType === 'invalid') {
        throw new Error('Please enter a valid email address or phone number');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Call the real API
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), emailOrPhone, password }),
      });

      if (response.success && response.data) {
        const { user: userData, tokens, emailVerificationRequired } = response.data;
        
        // Store tokens
        localStorage.setItem('melaXAccessToken', tokens.accessToken);
        localStorage.setItem('melaXRefreshToken', tokens.refreshToken);
        
        // Ensure backward compatibility
        userData.id = userData._id;
        
        setUser(userData);
        localStorage.setItem('melaXUser', JSON.stringify(userData));
        
        // Show verification message if needed
        if (emailVerificationRequired) {
          console.log('Email verification required. Please check your email.');
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          idToken,
        }),
      });

      if (response.success && response.data) {
        const { user: userData, tokens } = response.data;
        
        // Store tokens
        localStorage.setItem('melaXAccessToken', tokens.accessToken);
        localStorage.setItem('melaXRefreshToken', tokens.refreshToken);
        
        // Ensure backward compatibility
        userData.id = userData._id;
        
        setUser(userData);
        localStorage.setItem('melaXUser', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setIsLoading(true);
    
    try {
      // Call the real API
      const response = await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (response.success && response.data) {
        const updatedUser = response.data.user;
        // Ensure backward compatibility
        updatedUser.id = updatedUser._id;
        
        setUser(updatedUser);
        localStorage.setItem('melaXUser', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logout function called');
    
    try {
      // Call logout API endpoint
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    }
    
    setUser(null);
    setPurchasedEvents([]);
    localStorage.removeItem('melaXUser');
    localStorage.removeItem('melaXAccessToken');
    localStorage.removeItem('melaXRefreshToken');
    localStorage.removeItem('melaXPurchasedEvents');
    console.log('User logged out successfully');
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      if (response.success) {
        // Refresh user data to get updated verification status
        const userResponse = await apiRequest('/auth/me');
        if (userResponse.success && userResponse.data) {
          const userData = userResponse.data.user;
          userData.id = userData._id;
          setUser(userData);
          localStorage.setItem('melaXUser', JSON.stringify(userData));
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return response.success;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseEvent = async (eventId: string, quantity: number, totalPrice: number, transactionId?: string, paymentGateway?: string): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be logged in to purchase events');
    }

    try {
      // After a successful purchase, refresh tickets from database
      // This will automatically update the purchasedEvents with the new ticket
      await fetchTickets();
      
      return true;
    } catch (error) {
      console.error('Purchase error:', error);
      throw error;
    }
  };

  const cancelEvent = async (purchaseId: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedEvents = purchasedEvents.map(event => 
        event.id === purchaseId 
          ? { ...event, status: 'cancelled' as const }
          : event
      );
      
      setPurchasedEvents(updatedEvents);
      localStorage.setItem('melaXPurchasedEvents', JSON.stringify(updatedEvents));
      
      return true;
    } catch (error) {
      console.error('Cancel event error:', error);
      throw error;
    }
  };

  // Admin helper functions
  const isAdmin = (): boolean => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'super_admin' || user.isSuperAdmin === true;
  };

  const isSuperAdmin = (): boolean => {
    if (!user) return false;
    return user.role === 'super_admin' || user.isSuperAdmin === true;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    purchasedEvents,
    login,
    signup,
    loginWithGoogle,
    updateProfile,
    logout,
    purchaseEvent,
    cancelEvent,
    verifyEmail,
    resendVerification,
    isAdmin,
    isSuperAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
