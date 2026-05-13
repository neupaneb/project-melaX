const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  const userData = req.user.toObject();
  delete userData.password;
  res.json({ success: true, data: { user: userData } });
});

router.put('/profile', generalLimiter, authenticateToken, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('preferences.notifications.email').optional().isBoolean(),
  body('preferences.notifications.sms').optional().isBoolean(),
  body('preferences.notifications.push').optional().isBoolean(),
  body('preferences.language').optional().isIn(['en', 'ne', 'hi']),
  body('preferences.currency').optional().isIn(['NPR', 'USD', 'INR']),
  body('preferences.theme').optional().isIn(['light', 'dark', 'auto'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const updates = { ...req.body };
    ['password','email','phone','googleId','authProvider','isVerified','role','permissions','createdAt','updatedAt'].forEach((field) => delete updates[field]);

    const updatedUser = await User.updateById(req.user.id, updates);
    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Profile updated successfully', data: { user: updatedUser } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/password', generalLimiter, authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id, { includePassword: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.password) return res.status(400).json({ success: false, message: 'Password change not available for this account type' });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/account', generalLimiter, authenticateToken, async (req, res) => {
  try {
    await User.deleteById(req.user.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const users = await User.list({ limit, offset });
    const total = await User.countDocuments();
    res.json({ success: true, data: { users, pagination: { current: page, pages: Math.ceil(total / limit), total } } });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id/role', authenticateToken, authorize('admin'), [
  body('role').isIn(['user', 'admin', 'moderator']).withMessage('Role must be user, admin, or moderator')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const user = await User.updateById(req.params.id, { role: req.body.role });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User role updated successfully', data: { user } });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
