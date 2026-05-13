const express = require('express');
const { requireAdmin } = require('../middleware/adminAuth');
const Voucher = require('../models/Voucher');
const Event = require('../models/Event');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { code, eventId, discountPercentage, description, maxUses, validFrom, validUntil, minOrderAmount, maxDiscountAmount, maxUsesPerUser } = req.body;
    if (!code || !eventId || !discountPercentage || !maxUses || !validFrom || !validUntil) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy?.id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'You can only create vouchers for your own events' });
    }
    const voucher = await Voucher.create({ code, event: eventId, discountPercentage, description, maxUses, validFrom, validUntil, minOrderAmount, maxDiscountAmount, maxUsesPerUser, createdBy: req.user.id });
    res.status(201).json({ success: true, message: 'Voucher created successfully', data: { voucher } });
  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/event/:eventId', requireAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.createdBy?.id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'You can only view vouchers for your own events' });
    }
    const vouchers = await Voucher.findByEvent(req.params.eventId);
    res.json({ success: true, data: { vouchers } });
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    const event = await Event.findById(voucher.event.id || voucher.event);
    if (event.createdBy?.id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'You can only view vouchers for your own events' });
    }
    res.json({ success: true, data: { voucher } });
  } catch (error) {
    console.error('Get voucher error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    const event = await Event.findById(voucher.event.id || voucher.event);
    if (event.createdBy?.id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'You can only update vouchers for your own events' });
    }
    const updated = await Voucher.updateById(req.params.id, req.body);
    res.json({ success: true, message: 'Voucher updated successfully', data: { voucher: updated } });
  } catch (error) {
    console.error('Update voucher error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    const event = await Event.findById(voucher.event.id || voucher.event);
    if (event.createdBy?.id !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'You can only delete vouchers for your own events' });
    }
    await Voucher.deleteById(req.params.id);
    res.json({ success: true, message: 'Voucher deleted successfully' });
  } catch (error) {
    console.error('Delete voucher error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { code, eventId, orderAmount, userId } = req.body;
    if (!code || !eventId) return res.status(400).json({ success: false, message: 'Voucher code and event ID are required' });
    const voucher = await Voucher.findValidVoucher(code, eventId);
    if (!voucher) return res.status(404).json({ success: false, message: 'Invalid or expired voucher code' });
    if (orderAmount && voucher.minOrderAmount > Number(orderAmount)) {
      return res.status(400).json({ success: false, message: `Minimum order amount of ${voucher.minOrderAmount} required for this voucher` });
    }
    let usageCount = 0;
    if (userId) {
      usageCount = await voucher.getUserUsageCount(userId);
      if (!(await voucher.canUserUseVoucher(userId))) {
        return res.status(400).json({ success: false, message: `You have already used this voucher ${usageCount} times. Maximum allowed: ${voucher.maxUsesPerUser}` });
      }
    }
    let discountAmount = (Number(orderAmount || 0) * voucher.discountPercentage) / 100;
    if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) discountAmount = voucher.maxDiscountAmount;
    res.json({ success: true, data: { voucher: { id: voucher.id, code: voucher.code, discountPercentage: voucher.discountPercentage, description: voucher.description, discountAmount, remainingUses: voucher.remainingUses, maxUsesPerUser: voucher.maxUsesPerUser, userUsageCount: usageCount } } });
  } catch (error) {
    console.error('Validate voucher error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/apply', authenticateToken, async (req, res) => {
  try {
    const { voucherId } = req.body;
    if (!voucherId) return res.status(400).json({ success: false, message: 'Voucher ID is required' });
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    if (!(await voucher.canUserUseVoucher(req.user.id))) {
      const count = await voucher.getUserUsageCount(req.user.id);
      return res.status(400).json({ success: false, message: `You have already used this voucher ${count} times. Maximum allowed: ${voucher.maxUsesPerUser}` });
    }
    await voucher.incrementUserUsage(req.user.id);
    res.json({ success: true, message: 'Voucher applied successfully', data: { voucher } });
  } catch (error) {
    console.error('Apply voucher error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
