import React, { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, LogOut, Settings, Calendar, Film, UserPlus, Shield, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileModal } from './ProfileModal';
import { AdminInviteModal } from './AdminInviteModal';

interface ProfileDropdownProps {
  onMyEventsClick?: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onMyEventsClick }) => {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminInviteModalOpen, setIsAdminInviteModalOpen] = useState(false);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplay = () => {
    if (user.email) return user.email;
    if (user.phone) return user.phone;
    return 'User';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Avatar className="w-6 h-6">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
            <AvatarFallback className="text-xs bg-red-100 text-red-600">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{user.name}</span>
        </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className="text-sm bg-red-100 text-red-600">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-600">{getUserDisplay()}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer" onClick={onMyEventsClick}>
            <Calendar className="w-4 h-4 mr-2" />
            My Events
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <Film className="w-4 h-4 mr-2" />
            My Movies
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          
          {/* Admin Options */}
          {isAdmin() && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Admin Panel
                </p>
              </div>
              
              {isSuperAdmin() && (
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={() => setIsAdminInviteModalOpen(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2 text-blue-600" />
                  Invite Admin
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem className="cursor-pointer">
                <Shield className="w-4 h-4 mr-2 text-green-600" />
                Manage Events
              </DropdownMenuItem>
              
              {isSuperAdmin() && (
                <DropdownMenuItem className="cursor-pointer">
                  <Crown className="w-4 h-4 mr-2 text-yellow-600" />
                  Manage Users
                </DropdownMenuItem>
              )}
            </>
          )}
          
          <DropdownMenuSeparator />
          
          <div className="p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                logout();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
      
      <AdminInviteModal 
        isOpen={isAdminInviteModalOpen} 
        onClose={() => setIsAdminInviteModalOpen(false)} 
      />
    </>
  );
};
