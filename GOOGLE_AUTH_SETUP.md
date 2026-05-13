# Google Authentication Setup Guide

This guide will help you set up Google authentication for your melaX application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "melaX-app")
4. Click "Create"

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google Identity" and enable it

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Choose "Web application" as the application type
4. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
5. Click "Create"
6. Copy the Client ID

### 4. Configure Your Application

1. Open `src/config/google.ts`
2. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:

```typescript
export const GOOGLE_CLIENT_ID = 'your-actual-client-id-here.apps.googleusercontent.com';
```

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Open the application in your browser
3. Click on "Login" or "Sign Up"
4. Click "Continue with Google"
5. Complete the Google authentication flow

## Features Added

- ✅ Google Sign-In button on both Login and Sign-Up tabs
- ✅ Google user profile integration (name, email, avatar)
- ✅ Automatic user session management
- ✅ Google avatar display in profile dropdown
- ✅ Seamless integration with existing authentication system

## Security Notes

- Never commit your actual Google Client ID to version control
- Use environment variables for production deployments
- Ensure your authorized origins are properly configured
- Regularly rotate your OAuth credentials

## Troubleshooting

### Common Issues

1. **"Invalid client" error**: Check that your Client ID is correct
2. **"Unauthorized origin" error**: Add your domain to authorized JavaScript origins
3. **Google button not appearing**: Check browser console for JavaScript errors
4. **Authentication not working**: Verify the Google+ API is enabled

### Development vs Production

- Development: Use `http://localhost:3000` as authorized origin
- Production: Use your actual domain (e.g., `https://melaX.com`)

## Next Steps

After setting up Google authentication, you may want to:

1. Add more OAuth providers (Facebook, Twitter, etc.)
2. Implement server-side token verification
3. Add user profile management
4. Implement account linking (merge Google account with existing email/phone account)
