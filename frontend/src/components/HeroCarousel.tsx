import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Event } from "../data/mockEvents";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroCarouselProps {
  featuredEvents: Event[];
  onEventClick: (event: Event) => void;
}

export function HeroCarousel({ featuredEvents, onEventClick }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredEvents.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  if (featuredEvents.length === 0) return null;

  const currentEvent = featuredEvents[currentIndex];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="relative h-64 md:h-96 overflow-hidden bg-[#081a33]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={currentEvent.imageUrl}
          alt={currentEvent.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#081a33]/72"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <Badge className="mb-3 bg-red-600 text-white">
            Featured Event
          </Badge>
          
          <h2 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
            {currentEvent.title}
          </h2>
          
          <p className="text-gray-200 mb-4 text-sm md:text-base line-clamp-2">
            {currentEvent.description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-6">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{formatDate(currentEvent.date)} at {currentEvent.time}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{currentEvent.location}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Button 
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => onEventClick(currentEvent)}
            >
              View Event Details
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => window.open(currentEvent.ticketUrl, '_blank')}
            >
              Get Tickets
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {featuredEvents.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-[#12325b]/35 hover:bg-[#12325b]/55 text-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-[#12325b]/35 hover:bg-[#12325b]/55 text-white"
            onClick={goToNext}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {featuredEvents.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {featuredEvents.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}