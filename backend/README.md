# melaX Backend API

This is the backend API server for the melaX application, built with Node.js, Express.js, and MongoDB.

## Features

- 🔐 **User Authentication**: Email/Phone and Google OAuth
- 🛡️ **Security**: JWT tokens, bcrypt password hashing, rate limiting
- 📧 **Email Verification**: Automatic email verification for new accounts
- 👤 **User Management**: Profile management, roles, and permissions
- 🚦 **Rate Limiting**: Protection against brute force attacks
- 🗄️ **MongoDB Integration**: Scalable database with Mongoose ODM

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- Email service (Gmail SMTP recommended)

## Installation

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**:
   - Copy `config.env` and update with your actual values
   - Update MongoDB connection string
   - Configure email service credentials
   - Set JWT secret key

3. **Start the server**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `config.env` file with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=melaX_users

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@melax.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# CORS Configuration
CORS_ORIGIN=*
```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /login` - User login
- `POST /signup` - User registration
- `POST /google` - Google OAuth login/signup
- `POST /verify-email` - Verify email address
- `POST /resend-verification` - Resend verification email
- `GET /me` - Get current user
- `POST /logout` - User logout

### User Routes (`/api/users`)

- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /password` - Change password
- `DELETE /account` - Delete account
- `GET /` - Get all users (Admin only)
- `PUT /:id/role` - Update user role (Admin only)

## User Schema

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (optional),
  phone: String (optional),
  password: String (hashed),
  googleId: String (optional),
  avatar: String (optional),
  authProvider: String (enum: 'email', 'phone', 'google'),
  role: String (enum: 'user', 'admin', 'moderator'),
  permissions: [String],
  isVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  preferences: {
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    language: String (enum: 'en', 'ne', 'hi'),
    currency: String (enum: 'NPR', 'USD', 'INR'),
    theme: String (enum: 'light', 'dark', 'auto')
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

### Rate Limiting
- **Login attempts**: 3 attempts per 15 minutes
- **General auth**: 5 attempts per 15 minutes
- **Email verification**: 5 attempts per hour
- **Password reset**: 3 attempts per hour

### Account Lockout
- Accounts are locked after 5 failed login attempts
- Lock duration: 2 hours
- Automatic unlock after lock period expires

### Password Security
- Minimum 6 characters
- Bcrypt hashing with salt rounds of 12
- Password not included in API responses

### JWT Tokens
- Access tokens: 24 hours expiration
- Refresh tokens: 7 days expiration
- Secure token verification middleware

## Email Verification

### Setup Gmail SMTP
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in `EMAIL_PASS`

### Email Templates
- Welcome email with verification link
- Password reset email
- Account verification confirmation

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js
│   └── rateLimiter.js
├── models/
│   └── User.js
├── routes/
│   ├── auth.js
│   └── users.js
├── utils/
│   ├── emailService.js
│   └── jwtUtils.js
├── config.env
├── package.json
├── server.js
└── README.md
```

### Testing
Test the API endpoints using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl commands

### Health Check
Visit `http://localhost:5000/health` to verify the server is running.

## Production Deployment

1. **Environment Variables**: Use production values
2. **JWT Secret**: Use a strong, random secret
3. **MongoDB**: Use production MongoDB Atlas cluster
4. **Email Service**: Configure production SMTP
5. **HTTPS**: Enable SSL/TLS
6. **Process Manager**: Use PM2 or similar
7. **Monitoring**: Set up logging and monitoring

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string
   - Verify network access in MongoDB Atlas
   - Ensure database name is correct

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check Gmail app password
   - Ensure 2FA is enabled

3. **JWT Token Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper token format

4. **Rate Limiting Issues**
   - Check rate limit configuration
   - Verify client IP detection
   - Adjust limits if needed

## Support

For issues or questions:
1. Check the logs for error details
2. Verify environment variables
3. Test API endpoints individually
4. Check MongoDB connection and data

## License

MIT License - see LICENSE file for details.
