import React, { useState } from "react";
import { Calendar, MapPin, Clock, Users, ShoppingCart, Heart } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Event } from "../data/mockEvents";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../contexts/AuthContext";
import { usePayment } from "../contexts/PaymentContext";
import { useWishlist } from "../contexts/WishlistContext";
import { toast } from "sonner";
import { EmailVerificationPrompt } from "./EmailVerificationPrompt";

interface EventCardProps {
  event: Event;
  onEventClick: (event: Event) => void;
}

export function EventCard({ event, onEventClick }: EventCardProps) {
  const { isAuthenticated, purchasedEvents, user, isAdmin } = useAuth();
  const { openPaymentModal, verificationRequired, verificationMessage } = usePayment();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

  // Check if user has already purchased this event
  const isAlreadyPurchased = purchasedEvents.some(
    purchasedEvent => purchasedEvent.eventId === event.id && purchasedEvent.status === 'confirmed'
  );

  // Check if event is in wishlist
  const isWishlisted = isInWishlist(event.id);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (event: Event) => {
    if (event.ticketCategories.length === 0) {
      return "No tickets available";
    }
    
    const prices = event.ticketCategories.map(cat => cat.price);
    const currencies = event.ticketCategories.map(cat => cat.currency);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const currency = currencies[0]; // Use first currency (assuming all categories use same currency)
    
    if (minPrice === 0 && maxPrice === 0) {
      return "Free";
    }
    if (minPrice === maxPrice) {
      return `${currency} ${minPrice}`;
    }
    return `${currency} ${minPrice} - ${maxPrice}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Concerts': 'bg-purple-100 text-purple-800 border-purple-200',
      'Sports': 'bg-green-100 text-green-800 border-green-200',
      'Workshops': 'bg-blue-100 text-blue-800 border-blue-200',
      'Tech': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Festivals': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to purchase tickets');
      return;
    }

    // Check if user's email is verified
    if (user && !user.isVerified) {
      // Show verification prompt but don't block payment
      setShowVerificationPrompt(true);
      // Continue with payment flow
    }

    // Use the first ticket category for pricing
    const firstCategory = event.ticketCategories[0];
    const unitPrice = firstCategory?.price || 0;
    const quantity = 1; // Default quantity
    const originalAmount = unitPrice * quantity;
    
    await openPaymentModal({
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      eventCity: event.city,
      eventCountry: event.country,
      eventImage: event.imageUrl,
      eventOrganizer: event.organizer,
      eventDescription: event.description,
      quantity: quantity,
      unitPrice: unitPrice,
      totalAmount: originalAmount,
      currency: firstCategory?.currency || 'USD',
      originalAmount: originalAmount,
      discountAmount: 0,
      appliedVouchers: [],
      ticketCategories: event.ticketCategories // Pass all ticket categories
    });
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add events to your wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(event.id);
        toast.success('Event removed from wishlist');
      } else {
        await addToWishlist(event);
        toast.success('Event added to wishlist');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update wishlist');
    }
  };

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-0">
        {/* Event Image */}
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {event.featured && (
            <Badge className="absolute top-3 left-3 bg-red-600 text-white">
              Featured
            </Badge>
          )}
          <Badge 
            className={`absolute top-3 right-12 ${getCategoryColor(event.category)}`}
            variant="outline"
          >
            {event.category}
          </Badge>
          
          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`absolute top-3 right-3 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 backdrop-blur-sm transition-all duration-200 ${
              isWishlisted ? 'text-[#12325b] hover:text-[#173f73]' : 'text-gray-500 hover:text-[#12325b]'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart 
              className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} 
            />
          </Button>
        </div>

        {/* Event Details */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-[#12325b] dark:group-hover:text-blue-300 transition-colors line-clamp-2">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {event.description}
            </p>
          </div>

          <div className="space-y-2">
            {/* Date and Time */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
              <span>{formatDate(event.date)} at {event.time}</span>
            </div>

            {/* Location */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
              <span className="truncate">{event.location}, {event.city}, {event.country}</span>
            </div>

            {/* Organizer */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
              <span className="truncate">{event.organizer}</span>
            </div>
          </div>

          {/* Price and Action */}
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-gray-700 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-base leading-tight font-semibold text-white shadow-sm"
                style={{ backgroundColor: "#12325b" }}
              >
                {formatPrice(event)}
              </span>
              {event.ticketCategories.length > 1 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {event.ticketCategories.length} ticket options
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              {isAlreadyPurchased ? (
                <Button
                  size="sm"
                  onClick={handlePurchase}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Buy More
                </Button>
              ) : isAdmin() ? (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Admin View
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={handlePurchase}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Buy Ticket
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(event);
                }}
                className="bg-[#12325b] hover:bg-[#173f73] text-white"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Email Verification Prompt */}
      <EmailVerificationPrompt
        isOpen={showVerificationPrompt}
        onClose={() => setShowVerificationPrompt(false)}
        message="Please verify your email address to purchase tickets for this event."
      />
    </Card>
  );
}