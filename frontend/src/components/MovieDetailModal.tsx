import { X, Calendar, Clock, Star, Play, MapPin, ExternalLink } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Movie, Showtime } from "../data/mockMovies";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";
import { useState } from "react";

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovieDetailModal({ movie, isOpen, onClose }: MovieDetailModalProps) {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  if (!movie) return null;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRatingColor = (rating: string) => {
    const colors = {
      'U': 'bg-green-100 text-green-800 border-green-200',
      'PG': 'bg-blue-100 text-blue-800 border-blue-200',
      'PG-13': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'R': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[rating as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    return status === 'now-showing' 
      ? 'bg-green-600 text-white' 
      : 'bg-orange-600 text-white';
  };

  const getStatusText = (status: string) => {
    return status === 'now-showing' ? 'Now Showing' : 'Coming Soon';
  };

  // Get available cities and dates
  const availableCities = Object.keys(movie.showtimes);
  const availableDates = selectedCity ? Object.keys(movie.showtimes[selectedCity] || {}) : [];
  const availableShowtimes = (selectedCity && selectedDate) ? movie.showtimes[selectedCity]?.[selectedDate] || [] : [];

  const handleBookTicket = (showtime: Showtime) => {
    window.open(showtime.ticketUrl, '_blank');
    toast.success(`Opening booking for ${showtime.theater} - ${showtime.time}`);
  };

  const formatShowtimeDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Header Image */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <ImageWithFallback
              src={movie.imageUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Movie Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center space-x-2 mb-3">
                <Badge className={getStatusColor(movie.status)}>
                  {getStatusText(movie.status)}
                </Badge>
                <Badge 
                  className={`${getRatingColor(movie.rating)}`}
                  variant="outline"
                >
                  {movie.rating}
                </Badge>
                {movie.featured && (
                  <Badge className="bg-red-600 text-white">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{movie.title}</h1>
              <div className="flex items-center space-x-4 text-sm">
                <span>{movie.genre.join(", ")}</span>
                <span>•</span>
                <span>{formatDuration(movie.duration)}</span>
                <span>•</span>
                <span>{formatReleaseDate(movie.releaseDate)}</span>
              </div>
            </div>

            {/* Play Trailer Button */}
            <Button
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16"
              onClick={() => {
                window.open(movie.trailerUrl, '_blank');
                toast.success("Opening trailer...");
              }}
            >
              <Play className="w-8 h-8 ml-1" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Movie Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {movie.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-900">Director:</span>
                    <span className="text-gray-600 ml-2">{movie.director}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-900">Cast:</span>
                    <span className="text-gray-600 ml-2">{movie.cast.join(", ")}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-900">Genre:</span>
                    <span className="text-gray-600 ml-2">{movie.genre.join(", ")}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-900">Duration:</span>
                    <span className="text-gray-600 ml-2">{formatDuration(movie.duration)}</span>
                  </div>
                </div>
              </div>

              {/* Showtimes Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {movie.status === 'now-showing' ? 'Book Tickets' : 'Coming Soon'}
                </h3>
                
                {movie.status === 'now-showing' && availableCities.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select 
                        value={selectedDate} 
                        onValueChange={setSelectedDate}
                        disabled={!selectedCity}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Date" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDates.map((date) => (
                            <SelectItem key={date} value={date}>
                              {formatShowtimeDate(date)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Showtimes Grid */}
                    {availableShowtimes.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Available Showtimes</h4>
                        <div className="space-y-3">
                          {availableShowtimes.reduce((acc: { [theater: string]: Showtime[] }, showtime) => {
                            if (!acc[showtime.theater]) acc[showtime.theater] = [];
                            acc[showtime.theater].push(showtime);
                            return acc;
                          }, {}).map ? Object.entries(availableShowtimes.reduce((acc: { [theater: string]: Showtime[] }, showtime) => {
                            if (!acc[showtime.theater]) acc[showtime.theater] = [];
                            acc[showtime.theater].push(showtime);
                            return acc;
                          }, {})).map(([theater, showtimes]) => (
                            <div key={theater} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center mb-2">
                                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="font-medium text-sm text-gray-900">{theater}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {(showtimes as Showtime[]).map((showtime, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="justify-between"
                                    onClick={() => handleBookTicket(showtime)}
                                  >
                                    <span>{showtime.time}</span>
                                    <span className="text-red-600">{showtime.currency} {showtime.price}</span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )) : null}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <Calendar className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                    <p className="font-medium text-gray-900">Coming Soon</p>
                    <p className="text-sm text-gray-600 mt-1">
                      This movie will be released on {formatReleaseDate(movie.releaseDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {movie.status === 'now-showing' && availableCities.length === 0 && (
              <>
                <Separator />
                <div className="text-center py-4">
                  <p className="text-gray-600">No showtimes available at the moment. Please check back later.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}