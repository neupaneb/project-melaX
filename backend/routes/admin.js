const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAdmin, requireSuperAdmin } = require('../middleware/adminAuth');
const { authLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');

const router = express.Router();

router.get('/status', requireAdmin, (req, res) => {
  res.json({ success: true, data: { isAdmin: true, isSuperAdmin: req.user.isSuperAdminUser(), role: req.user.role, permissions: req.user.permissions } });
});

router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.list({ limit: 50, offset: 0 });
    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/admins', requireSuperAdmin, async (req, res) => {
  try {
    const admins = await User.findAdmins();
    res.json({ success: true, data: { admins } });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

const inviteAdminValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['admin', 'super_admin']).withMessage('Role must be admin or super_admin')
];

router.post('/invite', authLimiter, requireSuperAdmin, inviteAdminValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { email, role } = req.body;
    const invitedBy = req.user.id;
    const existingUser = await User.findOne({ email: email.toLowerCase() }, { includePassword: true });

    if (existingUser) {
      if (existingUser.isAdmin()) {
        return res.status(400).json({ success: false, message: 'User is already an admin' });
      }

      const updatedUser = await existingUser.promoteToAdmin(invitedBy);
      await sendEmail({
        to: email,
        subject: 'You have been promoted to Admin - melaX',
        html: '<h2>Congratulations! You are now an Admin</h2><p>You have been promoted to admin role on melaX platform.</p>'
      });
      return res.json({ success: true, message: 'User promoted to admin successfully', data: { user: updatedUser } });
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteLink = `${process.env.FRONTEND_URL}/admin-invite?token=${inviteToken}&email=${encodeURIComponent(email)}&role=${role}`;
    await sendEmail({
      to: email,
      subject: 'Admin Invitation - melaX',
      html: `<h2>You're invited to become an Admin!</h2><p><a href="${inviteLink}">Accept Admin Invitation</a></p>`
    });

    res.json({ success: true, message: 'Admin invitation sent successfully', data: { email, role, inviteToken } });
  } catch (error) {
    console.error('Error inviting admin:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/accept-invite', async (req, res) => {
  try {
    const { email, role, name, password } = req.body;
    let user = await User.createUser({ name, emailOrPhone: email, password, authProvider: 'email' });
    user = await User.updateById(user.id, { role, isSuperAdmin: role === 'super_admin' }, { includePassword: true });
    const userData = user.toObject();
    delete userData.password;
    res.json({ success: true, message: 'Admin account created successfully', data: { user: userData } });
  } catch (error) {
    console.error('Error accepting admin invite:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/revoke/:userId', requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot revoke your own admin access' });
    }

    const user = await User.updateById(userId, {
      role: 'user',
      isSuperAdmin: false,
      adminInvitedBy: null,
      adminInvitedAt: null,
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Admin access revoked successfully' });
  } catch (error) {
    console.error('Error revoking admin access:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
