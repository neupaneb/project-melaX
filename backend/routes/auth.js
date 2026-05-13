const express = require('express');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { loginLimiter, authLimiter, emailVerificationLimiter } = require('../middleware/rateLimiter');
const { generateTokenPair } = require('../utils/jwtUtils');
const { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const loginValidation = [
  body('emailOrPhone').notEmpty().withMessage('Email or phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const signupValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('emailOrPhone').notEmpty().withMessage('Email or phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const isEmailOrPhone = (input) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRegex = /^(\+977|977)?[0-9]{10}$/;
  if (emailRegex.test(input)) return 'email';
  if (phoneRegex.test(input.replace(/\s/g, ''))) return 'phone';
  return 'invalid';
};

router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { emailOrPhone, password } = req.body;
    const inputType = isEmailOrPhone(emailOrPhone);
    if (inputType === 'invalid') {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address or phone number' });
    }

    const user = await User.findByEmailOrPhone(emailOrPhone);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.isLocked) {
      return res.status(423).json({ success: false, message: 'Account is temporarily locked due to too many failed login attempts' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await user.resetLoginAttempts();
    await User.updateById(user.id, { lastLogin: new Date() }, { includePassword: true });

    const tokens = generateTokenPair(user.id);
    const userData = user.toObject();
    delete userData.password;

    res.json({ success: true, message: 'Login successful', data: { user: userData, tokens } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/signup', authLimiter, signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, emailOrPhone, password } = req.body;
    const inputType = isEmailOrPhone(emailOrPhone);
    if (inputType === 'invalid') {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address or phone number' });
    }

    const existingUser = await User.findByEmailOrPhone(emailOrPhone);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists with this email or phone number' });
    }

    let user = await User.createUser({ name: name.trim(), emailOrPhone, password, authProvider: inputType });

    if (inputType === 'email') {
      const verificationToken = generateVerificationToken();
      user = await User.updateById(user.id, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }, { includePassword: true });
      await sendVerificationEmail(user.email, user.name, verificationToken);
    }

    const tokens = generateTokenPair(user.id);
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: inputType === 'email' ? 'Account created successfully. Please check your email to verify your account.' : 'Account created successfully',
      data: { user: userData, tokens, emailVerificationRequired: inputType === 'email' }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/google', authLimiter, async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'Google ID token is required' });
    if (!googleClient) return res.status(503).json({ success: false, message: 'Google sign-in is not configured on the server' });

    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const googleId = payload?.sub;
    const email = payload?.email?.toLowerCase();
    const name = payload?.name;
    const avatar = payload?.picture || null;

    if (!googleId || !email || !name || !payload?.email_verified) {
      return res.status(400).json({ success: false, message: 'Invalid Google account information' });
    }

    let user = await User.findOne({ googleId }, { includePassword: true });
    if (user) {
      user = await User.updateById(user.id, { lastLogin: new Date() }, { includePassword: true });
    } else {
      const existingUser = await User.findOne({ email }, { includePassword: true });
      if (existingUser) {
        user = await User.updateById(existingUser.id, {
          googleId,
          authProvider: 'google',
          avatar,
          isVerified: true,
          lastLogin: new Date(),
        }, { includePassword: true });
      } else {
        user = await User.create({
          name,
          email,
          googleId,
          avatar,
          authProvider: 'google',
          isVerified: true,
          lastLogin: new Date(),
        });
      }
    }

    const tokens = generateTokenPair(user.id);
    const userData = user.toObject();
    delete userData.password;
    res.json({ success: true, message: 'Google authentication successful', data: { user: userData, tokens } });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/verify-email', emailVerificationLimiter, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Verification token is required' });

    const user = await User.findOne({ emailVerificationToken: token }, { includePassword: true });
    if (!user || !user.emailVerificationExpires || new Date(user.emailVerificationExpires) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    await User.updateById(user.id, {
      isVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    }, { includePassword: true });
    await sendWelcomeEmail(user.email, user.name);
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/resend-verification', emailVerificationLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() }, { includePassword: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email is already verified' });

    const verificationToken = generateVerificationToken();
    await User.updateById(user.id, {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }, { includePassword: true });

    await sendVerificationEmail(user.email, user.name, verificationToken);
    res.json({ success: true, message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userData = req.user.toObject();
    delete userData.password;
    res.json({ success: true, data: { user: userData } });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/logout', authenticateToken, async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
