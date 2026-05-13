import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Calendar, MapPin, Clock, Users, Ticket, X, CheckCircle, AlertCircle, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PurchasedEvent } from '../data/mockPurchasedEvents';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EventDetailModal } from './EventDetailModal';
import { toast } from 'sonner';

export const MyEvents: React.FC = () => {
  const { purchasedEvents, cancelEvent, isLoading } = useAuth();
  const [cancellingEvent, setCancellingEvent] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PurchasedEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      case 'refunded':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleCancelEvent = async (purchaseId: string) => {
    setCancellingEvent(purchaseId);
    try {
      await cancelEvent(purchaseId);
      toast.success('Event cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel event');
    } finally {
      setCancellingEvent(null);
    }
  };

  const handleViewEventDetails = (purchasedEvent: PurchasedEvent) => {
    setSelectedEvent(purchasedEvent);
    setIsModalOpen(true);
  };


  const upcomingEvents = purchasedEvents.filter(event => {
    const eventDate = new Date(event.event.date);
    const now = new Date();
    return eventDate >= now && event.status === 'confirmed';
  });

  const pastEvents = purchasedEvents.filter(event => {
    const eventDate = new Date(event.event.date);
    const now = new Date();
    return eventDate < now || event.status !== 'confirmed';
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
        <p className="text-gray-600">Manage your purchased event tickets</p>
      </div>

      {purchasedEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Ticket className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events purchased yet</h3>
          <p className="text-gray-600">
            Browse events and purchase tickets to see them here.
          </p>
        </div>
      ) : (
        <>
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((purchasedEvent) => (
                  <Card key={purchasedEvent.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <ImageWithFallback
                        src={purchasedEvent.event.imageUrl}
                        alt={purchasedEvent.event.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className={`absolute top-3 right-3 ${getStatusColor(purchasedEvent.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(purchasedEvent.status)}
                          <span className="capitalize">{purchasedEvent.status}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg">{purchasedEvent.event.title}</CardTitle>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(purchasedEvent.event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(purchasedEvent.event.time)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{purchasedEvent.event.location}, {purchasedEvent.event.city}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{purchasedEvent.quantity} ticket{purchasedEvent.quantity !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="font-semibold">
                            {purchasedEvent.currency || purchasedEvent.event.price.currency} {purchasedEvent.totalPrice}
                            {purchasedEvent.discountAmount && purchasedEvent.discountAmount > 0 && (
                              <div className="text-xs text-green-600">
                                (Saved {purchasedEvent.currency || purchasedEvent.event.price.currency} {purchasedEvent.discountAmount})
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <strong>Ticket Number:</strong> {purchasedEvent.ticketNumber}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <strong>Purchased:</strong> {formatDate(purchasedEvent.purchaseDate)}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleViewEventDetails(purchasedEvent)}
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          View Receipt
                        </Button>
                        
                        {purchasedEvent.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancelEvent(purchasedEvent.id)}
                            disabled={cancellingEvent === purchasedEvent.id}
                          >
                            {cancellingEvent === purchasedEvent.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                Cancelling...
                              </>
                            ) : (
                              'Cancel Event'
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((purchasedEvent) => (
                  <Card key={purchasedEvent.id} className="overflow-hidden opacity-75">
                    <div className="relative">
                      <ImageWithFallback
                        src={purchasedEvent.event.imageUrl}
                        alt={purchasedEvent.event.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className={`absolute top-3 right-3 ${getStatusColor(purchasedEvent.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(purchasedEvent.status)}
                          <span className="capitalize">{purchasedEvent.status}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-lg">{purchasedEvent.event.title}</CardTitle>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(purchasedEvent.event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(purchasedEvent.event.time)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{purchasedEvent.event.location}, {purchasedEvent.event.city}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{purchasedEvent.quantity} ticket{purchasedEvent.quantity !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="font-semibold">
                            {purchasedEvent.currency || purchasedEvent.event.price.currency} {purchasedEvent.totalPrice}
                            {purchasedEvent.discountAmount && purchasedEvent.discountAmount > 0 && (
                              <div className="text-xs text-green-600">
                                (Saved {purchasedEvent.currency || purchasedEvent.event.price.currency} {purchasedEvent.discountAmount})
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <strong>Ticket Number:</strong> {purchasedEvent.ticketNumber}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <strong>Purchased:</strong> {formatDate(purchasedEvent.purchaseDate)}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleViewEventDetails(purchasedEvent)}
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          View Receipt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent?.event || null}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        receiptOnly={true}
      />
    </div>
  );
};
