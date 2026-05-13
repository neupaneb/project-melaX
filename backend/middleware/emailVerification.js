const { authenticateToken } = require('./auth');
const User = require('../models/User');

/**
 * Middleware to check if user's email is verified
 * Prevents unverified users from accessing protected features
 */
const requireEmailVerification = async (req, res, next) => {
  try {
    // First authenticate the user
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user exists and is verified
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check email verification status
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED',
        data: {
          email: req.user.email,
          requiresVerification: true,
          verificationMessage: 'Please verify your email address to purchase tickets and access premium features.'
        }
      });
    }

    // User is verified, proceed to next middleware
    next();
  } catch (error) {
    console.error('Email verification middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware to check verification status without blocking
 * Returns verification status in response
 */
const checkVerificationStatus = async (req, res, next) => {
  try {
    // First authenticate the user
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (req.user) {
      req.userVerificationStatus = {
        isVerified: req.user.isVerified,
        email: req.user.email,
        authProvider: req.user.authProvider
      };
    }

    next();
  } catch (error) {
    console.error('Verification status check error:', error);
    next(); // Continue even if check fails
  }
};

module.exports = {
  requireEmailVerification,
  checkVerificationStatus
};
