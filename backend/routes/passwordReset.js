const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const resetRequestValidation = [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()];
const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

router.post('/request', authLimiter, resetRequestValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }, { includePassword: true });
    if (!user) return res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({ to: email, subject: 'Password Reset Request - melaX', html: `<p>Hi ${user.name}</p><p><a href="${resetUrl}">Reset Password</a></p>` });
    res.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/reset', authLimiter, resetPasswordValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { token, password } = req.body;
    const user = await User.findByPasswordResetToken(token);
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    try {
      await sendEmail({ to: user.email, subject: 'Password Reset Successful - melaX', html: `<p>Hi ${user.name}</p><p>Your password has been reset successfully.</p>` });
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
    }
    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/verify-token', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Reset token is required' });
    const user = await User.findByPasswordResetToken(token);
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    res.json({ success: true, message: 'Reset token is valid', data: { email: user.email, name: user.name } });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
