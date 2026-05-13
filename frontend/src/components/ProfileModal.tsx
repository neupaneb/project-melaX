import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, User, Mail, Phone, Calendar, Camera, Save, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: user?.preferences?.notifications?.email ?? true,
    sms: user?.preferences?.notifications?.sms ?? false,
    push: user?.preferences?.notifications?.push ?? true,
  });

  // Update form state when user changes
  React.useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setProfileImage(user.avatar || null);
      setNotificationPrefs({
        email: user.preferences?.notifications?.email ?? true,
        sms: user.preferences?.notifications?.sms ?? false,
        push: user.preferences?.notifications?.push ?? true,
      });
    }
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Unknown';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown';
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotificationPrefsUpdate = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch('/api/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(notificationPrefs)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Notification preferences updated successfully!');
        // Update user context with new preferences
        if (user) {
          const updatedUser = { ...user, preferences: data.data.preferences };
          // You might want to update the user context here
        }
      } else {
        setError(data.message || 'Failed to update notification preferences');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      setError('Failed to update notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use the updateProfile function from AuthContext
      await updateProfile({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        avatar: profileImage,
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleClose = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setProfileImage(user?.avatar || null);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Profile Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Picture Section - Compact */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative">
              <Avatar className="w-16 h-16">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt={user.name} />
                ) : null}
                <AvatarFallback className="text-lg bg-red-100 text-red-600">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-3 h-3" />
                </Button>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email || user.phone || 'No contact info'}</p>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* User Information - Compact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="h-9"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md h-9">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{user.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter your email"
                  className="h-9"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md h-9">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm truncate">{user.email || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="h-9"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md h-9">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{user.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium">Account Type</Label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md h-9">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm capitalize">{user.authProvider || 'Email/Phone'}</span>
              </div>
            </div>
          </div>

          {/* Member Since - Full Width */}
          <div className="space-y-1">
            <Label className="text-sm font-medium">Member Since</Label>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md h-9">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{formatDate(user.createdAt)}</span>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Notification Preferences</Label>
            <p className="text-xs text-gray-600 mb-3">Choose how you'd like to receive event reminders and updates:</p>
            
            {/* Notification Info */}
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 text-yellow-600 mt-0.5">ℹ️</div>
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">What notifications will you receive?</p>
                  <ul className="space-y-1 text-yellow-700">
                    <li>• Day-before event reminders</li>
                    <li>• Day-of event reminders</li>
                    <li>• Event cancellation notices</li>
                    <li>• Event update notifications</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={notificationPrefs.email}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, email: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="email-notifications" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                    <p className="text-xs text-gray-500">Receive event reminders and updates via email</p>
                  </div>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="sms-notifications"
                  checked={notificationPrefs.sms}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, sms: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="sms-notifications" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
                    <p className="text-xs text-gray-500">Receive event reminders via text message</p>
                  </div>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="push-notifications"
                  checked={notificationPrefs.push}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, push: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="push-notifications" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📱</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Push Notifications</span>
                    <p className="text-xs text-gray-500">Receive browser and mobile push notifications</p>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Active Notifications Summary */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-900">Active Notifications</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {notificationPrefs.email && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </span>
                )}
                {notificationPrefs.sms && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Phone className="w-3 h-3 mr-1" />
                    SMS
                  </span>
                )}
                {notificationPrefs.push && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <span className="text-xs mr-1">📱</span>
                    Push
                  </span>
                )}
                {!notificationPrefs.email && !notificationPrefs.sms && !notificationPrefs.push && (
                  <span className="text-xs text-gray-500">No notifications enabled</span>
                )}
              </div>
            </div>
            
            <Button
              size="sm"
              onClick={handleNotificationPrefsUpdate}
              disabled={isLoading}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Preferences...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Preferences
                </>
              )}
            </Button>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex space-x-2 pt-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  Edit Profile
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
