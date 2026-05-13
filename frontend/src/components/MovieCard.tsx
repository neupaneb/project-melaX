import { Calendar, Clock, Star, Play } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Movie } from "../data/mockMovies";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MovieCardProps {
  movie: Movie;
  onMovieClick: (movie: Movie) => void;
}

export function MovieCard({ movie, onMovieClick }: MovieCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
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

  // Get available showtimes count
  const showtimeCount = Object.values(movie.showtimes).reduce((total, cityShowtimes) => {
    return total + Object.values(cityShowtimes).reduce((cityTotal, dayShowtimes) => {
      return cityTotal + dayShowtimes.length;
    }, 0);
  }, 0);

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Movie Poster */}
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={movie.imageUrl}
            alt={movie.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Overlay Badges */}
          <div className="absolute top-3 left-3 space-y-2">
            <Badge className={getStatusColor(movie.status)}>
              {getStatusText(movie.status)}
            </Badge>
            {movie.featured && (
              <Badge className="bg-red-600 text-white block w-fit">
                Featured
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <Badge 
              className={`${getRatingColor(movie.rating)}`}
              variant="outline"
            >
              {movie.rating}
            </Badge>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <Button
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/20 hover:bg-white/30 text-white"
            >
              <Play className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Movie Details */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#12325b] transition-colors line-clamp-1">
              {movie.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {movie.description}
            </p>
          </div>

          <div className="space-y-2">
            {/* Genre */}
            <div className="flex items-center text-sm text-gray-600">
              <span className="truncate">{movie.genre.join(", ")}</span>
            </div>

            {/* Duration and Release Date */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                <span>{formatReleaseDate(movie.releaseDate)}</span>
              </div>
            </div>

            {/* Director */}
            <div className="text-sm text-gray-600">
              <span className="font-medium">Director:</span> {movie.director}
            </div>

            {/* Cast */}
            <div className="text-sm text-gray-600">
              <span className="font-medium">Cast:</span> {movie.cast.slice(0, 2).join(", ")}
              {movie.cast.length > 2 && ", ..."}
            </div>
          </div>

          {/* Showtimes and Action */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              {movie.status === 'now-showing' && showtimeCount > 0 ? (
                <span>{showtimeCount} showtime{showtimeCount !== 1 ? 's' : ''} available</span>
              ) : (
                <span>Coming Soon</span>
              )}
            </div>
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onMovieClick(movie);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {movie.status === 'now-showing' ? 'Book Tickets' : 'View Details'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}