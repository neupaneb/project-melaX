import { X, Calendar, MapPin, Clock, Users, ExternalLink, Bell, Share2, Plus, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Event } from "../data/mockEvents";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { PaymentReceipt, PaymentReceiptData } from "./PaymentReceipt";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner@2.0.3";
import { useState } from "react";

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  receiptOnly?: boolean; // New prop to show only receipt
}

export function EventDetailModal({ event, isOpen, onClose, receiptOnly = false }: EventDetailModalProps) {
  const { purchasedEvents, user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(receiptOnly ? 'receipt' : 'details');

  if (!event) return null;

  // Check if user has purchased this event
  const purchasedEvent = purchasedEvents.find(
    purchasedEvent => purchasedEvent.eventId === event.id && purchasedEvent.status === 'confirmed'
  );

  // Generate receipt data from actual ticket/purchase data
  const generateReceiptData = (): PaymentReceiptData | null => {
    if (!purchasedEvent || !user) return null;

    return {
      receiptId: purchasedEvent.receiptId || `RCP-${Date.now()}`,
      transactionId: purchasedEvent.transactionId || `TXN-${Date.now()}`,
      purchaseDate: purchasedEvent.purchaseDate || new Date().toISOString(),
      eventTitle: purchasedEvent.event.title,
      eventDate: purchasedEvent.event.date,
      eventTime: purchasedEvent.event.time,
      venue: purchasedEvent.event.location,
      quantity: purchasedEvent.quantity || 1,
      unitPrice: purchasedEvent.event.price.min || purchasedEvent.event.price.max || 0,
      totalAmount: purchasedEvent.totalPrice,
      originalAmount: purchasedEvent.originalAmount || purchasedEvent.totalPrice,
      discountAmount: purchasedEvent.discountAmount || 0,
      currency: purchasedEvent.currency || purchasedEvent.event.price.currency,
      paymentMethod: purchasedEvent.paymentMethod || 'card',
      status: purchasedEvent.status as 'confirmed' | 'pending' | 'cancelled',
      appliedVouchers: purchasedEvent.appliedVouchers || [],
      tickets: Array.from({ length: purchasedEvent.quantity || 1 }, (_, i) => {
        const ticketId = purchasedEvent.ticketNumber || `TKT-${purchasedEvent.id}-${i + 1}`;
        const qrCode = `QR-${purchasedEvent.id}-${i + 1}-${Date.now()}`;
        return {
          ticketId,
          seatNumber: `A${i + 1}`,
          qrCode
        };
      }),
      user: {
        name: user.name,
        email: user.email
      }
    };
  };

  const receiptData = generateReceiptData();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (event: Event) => {
    if (event.price.min === 0 && event.price.max === 0) {
      return "Free Entry";
    }
    if (event.price.min === event.price.max) {
      return `${event.price.currency} ${event.price.min}`;
    }
    return `${event.price.currency} ${event.price.min} - ${event.price.max}`;
  };

  const handleAddToCalendar = () => {
    // Create calendar event
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(calendarUrl, '_blank');
    toast.success("Opening Google Calendar...");
  };

  const handleSetReminder = () => {
    toast.success("Reminder set! You'll be notified before the event.");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Header Image */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <ImageWithFallback
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Event Title Overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <Badge 
                  className={`${getCategoryColor(event.category)}`}
                  variant="outline"
                >
                  {event.category}
                </Badge>
                {event.featured && (
                  <Badge className="bg-red-600 text-white">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {receiptOnly ? (
              // Receipt-only mode - show only receipt content
              <div className="mt-6">
                {purchasedEvent && receiptData && (
                  <PaymentReceipt 
                    receipt={receiptData}
                    showEventDetails={false}
                    onDownload={() => {
                      toast.success("Downloading receipt...");
                      // Implement PDF download functionality
                    }}
                    onShare={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Receipt for ${event.title}`,
                          text: `Payment receipt for ${event.title}`,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Receipt link copied to clipboard!");
                      }
                    }}
                  />
                )}
              </div>
            ) : (
              // Normal mode - show tabs
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Event Details</TabsTrigger>
                  {purchasedEvent && (
                    <TabsTrigger value="receipt" className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Payment Receipt
                    </TabsTrigger>
                  )}
                </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
            {/* Event Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">{formatDate(event.date)}</div>
                    <div className="text-sm">{event.time}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">{event.location}</div>
                    <div className="text-sm">{event.city}</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">Organized by</div>
                    <div className="text-sm">{event.organizer}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Ticket Pricing</h3>
                  <div className="text-2xl font-bold text-red-600 mb-3">
                    {formatPrice(event)}
                  </div>
                  
                  {isAdmin() ? (
                    <div className="w-full bg-blue-100 text-blue-800 text-center py-3 px-4 rounded-md font-medium">
                      Admin View - No Purchase Required
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => window.open(event.ticketUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Buy Tickets
                    </Button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddToCalendar}
                    className="flex flex-col items-center p-3 h-auto"
                  >
                    <Plus className="w-4 h-4 mb-1" />
                    <span className="text-xs">Add to Calendar</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSetReminder}
                    className="flex flex-col items-center p-3 h-auto"
                  >
                    <Bell className="w-4 h-4 mb-1" />
                    <span className="text-xs">Set Reminder</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleShare}
                    className="flex flex-col items-center p-3 h-auto"
                  >
                    <Share2 className="w-4 h-4 mb-1" />
                    <span className="text-xs">Share</span>
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Event</h3>
              <p className="text-gray-600 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Map Section */}
            {event.coordinates && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <MapPin className="w-8 h-8 mx-auto text-red-600 mb-2" />
                    <p className="font-medium text-gray-900">{event.location}</p>
                    <p className="text-sm text-gray-600">{event.city}</p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Get Directions
                    </Button>
                  </div>
                </div>
              </>
            )}
              </TabsContent>

              {purchasedEvent && receiptData && (
                <TabsContent value="receipt" className="mt-6">
                  <PaymentReceipt 
                    receipt={receiptData}
                    showEventDetails={true}
                    onDownload={() => {
                      toast.success("Downloading receipt...");
                      // Implement PDF download functionality
                    }}
                    onShare={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Receipt for ${event.title}`,
                          text: `Payment receipt for ${event.title}`,
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Receipt link copied to clipboard!");
                      }
                    }}
                  />
                </TabsContent>
              )}
            </Tabs>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}