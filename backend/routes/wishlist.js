const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const Wishlist = require('../models/Wishlist');
const router = express.Router();

router.get('/', authLimiter, authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findByUserId(req.user.id);
    res.json({ success: true, message: 'Wishlist retrieved successfully', data: { wishlist, count: wishlist.length } });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve wishlist', error: error.message });
  }
});

router.post('/add', authLimiter, authenticateToken, async (req, res) => {
  try {
    const { eventId, eventDetails } = req.body;
    if (!eventId || !eventDetails) return res.status(400).json({ success: false, message: 'Event ID and details are required' });
    const existing = await Wishlist.isInWishlist(req.user.id, eventId);
    if (existing) return res.status(409).json({ success: false, message: 'Event is already in your wishlist' });
    const wishlistItem = await Wishlist.addToWishlist(req.user.id, eventId, eventDetails);
    res.status(201).json({ success: true, message: 'Event added to wishlist successfully', data: { wishlistItem } });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to add event to wishlist', error: error.message });
  }
});

router.delete('/remove/:eventId', authLimiter, authenticateToken, async (req, res) => {
  try {
    const removedItem = await Wishlist.removeFromWishlist(req.user.id, req.params.eventId);
    if (!removedItem) return res.status(404).json({ success: false, message: 'Event not found in wishlist' });
    res.json({ success: true, message: 'Event removed from wishlist successfully', data: { removedItem } });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove event from wishlist', error: error.message });
  }
});

router.get('/check/:eventId', authLimiter, authenticateToken, async (req, res) => {
  try {
    const item = await Wishlist.isInWishlist(req.user.id, req.params.eventId);
    res.json({ success: true, message: 'Wishlist status checked successfully', data: { isInWishlist: !!item, wishlistItem: item } });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to check wishlist status', error: error.message });
  }
});

router.delete('/clear', authLimiter, authenticateToken, async (req, res) => {
  try {
    const result = await Wishlist.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: 'Wishlist cleared successfully', data: { deletedCount: result.deletedCount } });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear wishlist', error: error.message });
  }
});

module.exports = router;
