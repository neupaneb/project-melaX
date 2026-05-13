import { Search, Menu, User, Calendar, Film, Ticket, Plus, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { AuthModal } from "./AuthModal";
import { ProfileDropdown } from "./ProfileDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useState } from "react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: 'events' | 'movies' | 'my-events' | 'wishlist';
  onTabChange: (tab: 'events' | 'movies' | 'my-events' | 'wishlist') => void;
  onMyEventsClick?: () => void;
  onAddEventClick?: () => void;
}

export function Header({ searchQuery, onSearchChange, activeTab, onTabChange, onMyEventsClick, onAddEventClick }: HeaderProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const { wishlist } = useWishlist();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-border dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center min-w-0">
            <img
              src="/melax-logo-cropped.png"
              alt="melaX logo"
              className="h-9 w-auto max-w-[140px] object-contain sm:h-10 sm:max-w-[160px]"
            />
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={activeTab === 'events' ? "Search events, locations, dates..." : "Search movies, theaters, genres..."}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="w-4 h-4" />
            </Button>

            <ThemeToggle variant="ghost" size="sm" />

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange('wishlist')}
                className={`flex items-center space-x-1 ${
                  activeTab === 'wishlist'
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                    : 'text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-300'
                }`}
                title="My Wishlist"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                    {wishlist.length}
                  </Badge>
                )}
              </Button>
            )}

            {isAuthenticated ? (
              <ProfileDropdown onMyEventsClick={onMyEventsClick} />
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}

            {isAuthenticated && isAdmin() && (
              <Button
                variant="default"
                size="sm"
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                onClick={onAddEventClick}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Event</span>
              </Button>
            )}

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            <Button
              variant={activeTab === 'events' ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange('events')}
              className={`flex items-center space-x-2 ${
                activeTab === 'events'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </Button>
            <Button
              variant={activeTab === 'movies' ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange('movies')}
              className={`flex items-center space-x-2 ${
                activeTab === 'movies'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Movies</span>
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant={activeTab === 'wishlist' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange('wishlist')}
                  className={`flex items-center space-x-2 ${
                    activeTab === 'wishlist'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Wishlist</span>
                  {wishlist.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                      {wishlist.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={activeTab === 'my-events' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange('my-events')}
                  className={`flex items-center space-x-2 ${
                    activeTab === 'my-events'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>My Events</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={activeTab === 'events' ? "Search events..." : "Search movies..."}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}
