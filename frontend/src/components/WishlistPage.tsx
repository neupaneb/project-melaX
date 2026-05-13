import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Calendar, MapPin, Users, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist, isLoading } = useWishlist();
  const { isAuthenticated, purchasedEvents, user } = useAuth();
  const { openPaymentModal } = usePayment();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (event: any) => {
    if (event.price.min === 0 && event.price.max === 0) {
      return "Free";
    }
    if (event.price.min === event.price.max) {
      return `${event.price.currency} ${event.price.min}`;
    }
    return `${event.price.currency} ${event.price.min} - ${event.price.max}`;
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

  const handleRemoveFromWishlist = async (eventId: string) => {
    try {
      await removeFromWishlist(eventId);
      toast.success('Event removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove event from wishlist');
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await clearWishlist();
        toast.success('Wishlist cleared');
      } catch (error) {
        toast.error('Failed to clear wishlist');
      }
    }
  };

  const handlePurchase = async (event: any) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase tickets');
      return;
    }

    // Check if user's email is verified
    if (user && !user.isVerified) {
      toast.error('Please verify your email address to purchase tickets');
      return;
    }

    // Use the first ticket category for pricing
    const firstCategory = event.ticketCategories[0];
    const unitPrice = firstCategory?.price || 0;
    const quantity = 1;
    const originalAmount = unitPrice * quantity;
    
      await openPaymentModal({
        eventId: event.id,
        eventTitle: event.title,
        quantity,
        unitPrice,
        totalAmount: originalAmount,
        currency: firstCategory?.currency || 'USD',
        originalAmount: originalAmount,
        discountAmount: 0,
        appliedVouchers: []
      });
  };

  const isAlreadyPurchased = (eventId: string) => {
    return purchasedEvents.some(
      purchasedEvent => purchasedEvent.eventId === eventId && purchasedEvent.status === 'confirmed'
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your wishlist</p>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {wishlist.length} event{wishlist.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        
        {wishlist.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearWishlist}
            className="text-[#12325b] hover:text-[#173f73] hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Wishlist Content */}
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start adding events you're interested in by clicking the heart icon on event cards
          </p>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => window.location.href = '/#events'}
          >
            Browse Events
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            const event = item.eventDetails;
            const purchased = isAlreadyPurchased(event.id);
            
            return (
              <Card key={item._id} className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden">
                <CardContent className="p-0">
                  {/* Event Image */}
                  <div className="relative overflow-hidden">
                    <ImageWithFallback
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {event.featured && (
                      <Badge className="absolute top-3 left-3 bg-[#12325b] text-white">
                        Featured
                      </Badge>
                    )}
                    <Badge 
                      className={`absolute top-3 right-12 ${getCategoryColor(event.category)}`}
                      variant="outline"
                    >
                      {event.category}
                    </Badge>
                    
                    {/* Remove from Wishlist Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFromWishlist(event.id)}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 backdrop-blur-sm text-[#12325b] hover:text-[#173f73]"
                      title="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>

                  {/* Event Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-[#12325b] transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {/* Date and Time */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{formatDate(event.date)} at {event.time}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{event.location}, {event.city}</span>
                      </div>

                      {/* Organizer */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{event.organizer}</span>
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <span className="text-lg font-semibold text-red-600">
                          {formatPrice(event)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {purchased ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Purchased
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(event)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Buy Ticket
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
