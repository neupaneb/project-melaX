# 📧 Email Verification Setup Guide

This guide will help you configure email verification for your melaX application.

## 🔧 Configuration Steps

### 1. **Update Email Settings in config.env**

Edit `/melaX/backend/config.env` and update the email configuration:

```env
# Email Configuration (for email verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=melaxnepal@gmail.com
EMAIL_PASS=dzsrndxxyrjpfnlj
EMAIL_FROM=melaxnepal@gmail.com

# Frontend URL for email verification links
FRONTEND_URL=http://localhost:3000
```

### 2. **Gmail Setup (Recommended)**

#### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already enabled

#### Step 2: Generate App Password
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Enter "melaX Backend" as the name
4. Copy the generated 16-character password
5. Use this password as `EMAIL_PASS` in your config.env

#### Step 3: Update Configuration
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### 3. **Alternative Email Services**

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### Custom SMTP Server
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

## 🧪 Testing Email Verification

### 1. **Start Your Backend**
```bash
cd /Users/nabinnyaupane/Desktop/Mela-X/melaX/backend
npm run dev
```

### 2. **Test Signup with Email**
1. Go to your frontend application
2. Sign up with a valid email address
3. Check your email inbox for verification email
4. Click the verification link

### 3. **Test API Directly**
```bash
cd /Users/nabinnyaupane/Desktop/Mela-X/melaX/backend
node test-api.js
```

## 📱 Frontend Integration

The email verification is now integrated into your frontend:

### **Verification URLs**
- `http://localhost:3000/?token=VERIFICATION_TOKEN`
- `http://localhost:3000/verify-email?token=VERIFICATION_TOKEN`

### **Features**
- ✅ Automatic token detection from URL
- ✅ Email verification status display
- ✅ Resend verification email functionality
- ✅ Success/error handling
- ✅ User-friendly interface

## 🔍 Troubleshooting

### **Common Issues**

#### 1. **"Failed to send email" Error**
- Check your email credentials in config.env
- Ensure 2FA is enabled for Gmail
- Verify app password is correct

#### 2. **"Invalid token" Error**
- Token may be expired (24-hour limit)
- Check if token is properly URL-encoded
- Try resending verification email

#### 3. **Email not received**
- Check spam/junk folder
- Verify email address is correct
- Check email service provider settings

#### 4. **CORS Issues**
- Ensure `CORS_ORIGIN=*` in config.env
- Check frontend URL matches FRONTEND_URL

### **Debug Mode**
Add this to your config.env for detailed email logs:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 🚀 Production Setup

### **Security Considerations**
1. **Change JWT Secret**: Update `JWT_SECRET` to a secure random string
2. **Restrict CORS**: Set `CORS_ORIGIN` to your production domain
3. **Use Environment Variables**: Don't commit sensitive data to version control
4. **Email Service**: Consider using professional email services like SendGrid, Mailgun, or AWS SES

### **Production Email Service Example**
```env
# Using SendGrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

## 📞 Support

If you encounter issues:
1. Check the backend console for error messages
2. Verify all configuration values
3. Test with a simple email first
4. Check your email service provider's documentation

---

**Note**: Email verification is now fully integrated and ready to use! 🎉
