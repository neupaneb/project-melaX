import { Calendar, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { movieGenres, movieCities } from "../data/mockMovies";

interface MovieFiltersProps {
  selectedGenre: string;
  selectedCity: string;
  selectedStatus: string;
  onGenreChange: (genre: string) => void;
  onCityChange: (city: string) => void;
  onStatusChange: (status: string) => void;
}

export function MovieFilters({
  selectedGenre,
  selectedCity,
  selectedStatus,
  onGenreChange,
  onCityChange,
  onStatusChange
}: MovieFiltersProps) {
  const statusOptions = [
    { value: "all", label: "All Movies" },
    { value: "now-showing", label: "Now Showing" },
    { value: "coming-soon", label: "Coming Soon" }
  ];

  return (
    <div className="bg-white border-b border-border">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Filters */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Movie Filters:</span>
          </div>

          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedGenre} onValueChange={onGenreChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              {movieGenres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCity} onValueChange={onCityChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {movieCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Movie Filters</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <Select value={selectedGenre} onValueChange={onGenreChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  {movieGenres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCity} onValueChange={onCityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {movieCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}