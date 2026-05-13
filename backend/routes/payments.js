const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireEmailVerification } = require('../middleware/emailVerification');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Voucher = require('../models/Voucher');
const router = express.Router();

const purchaseValidation = [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  body('paymentMethod').isIn(['card', 'khalti', 'esewa']).withMessage('Invalid payment method'),
  body('selectedCategoryIndex').optional().isInt({ min: 0 }),
  body('appliedVouchers').optional().isArray({ max: 1 })
];

router.post('/purchase-ticket', authLimiter, authenticateToken, requireEmailVerification, purchaseValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { eventId, quantity, paymentMethod, selectedCategoryIndex = 0, appliedVouchers = [] } = req.body;
    if (req.user.isAdmin()) return res.status(403).json({ success: false, message: 'Admins cannot purchase tickets. This is an admin-only view.' });
    if (process.env.ENABLE_MOCK_PAYMENTS !== 'true') return res.status(503).json({ success: false, message: 'Payment provider verification is not configured yet' });

    const event = await Event.findById(eventId);
    if (!event || event.status !== 'active') return res.status(404).json({ success: false, message: 'Event not found' });
    const ticketCategory = event.ticketCategories[selectedCategoryIndex];
    if (!ticketCategory) return res.status(400).json({ success: false, message: 'Selected ticket category is invalid' });
    if (ticketCategory.available < quantity) return res.status(400).json({ success: false, message: 'Not enough tickets are available for the selected category' });

    const originalAmount = quantity * ticketCategory.price;
    let totalDiscount = 0;
    const appliedVoucherRecords = [];

    for (const voucherInput of appliedVouchers) {
      const code = typeof voucherInput === 'string' ? voucherInput : voucherInput?.code;
      if (!code) continue;
      const voucher = await Voucher.findValidVoucher(code, event.id);
      if (!voucher) return res.status(400).json({ success: false, message: `Voucher ${code} is invalid or expired` });
      if (voucher.minOrderAmount > originalAmount) return res.status(400).json({ success: false, message: `Minimum order amount of ${voucher.minOrderAmount} required for voucher ${voucher.code}` });
      if (!(await voucher.canUserUseVoucher(req.user.id))) return res.status(400).json({ success: false, message: `Voucher ${voucher.code} has reached the per-user usage limit` });
      let discountAmount = (originalAmount * voucher.discountPercentage) / 100;
      if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) discountAmount = voucher.maxDiscountAmount;
      totalDiscount += discountAmount;
      appliedVoucherRecords.push({ code: voucher.code, discountPercentage: voucher.discountPercentage, discountAmount });
      await voucher.incrementUserUsage(req.user.id);
    }

    const totalAmount = Math.max(originalAmount - totalDiscount, 0);
    ticketCategory.available -= quantity;
    await event.save();

    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const purchaseId = `PURCHASE_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const seatNumbers = Array.from({ length: quantity }, (_, i) => `A${i + 1}`);
    const qrCode = `QR_${purchaseId}_${Date.now()}`;

    const ticket = await Ticket.create({
      ticketId: `TKT_${purchaseId}`,
      userId: req.user.id,
      eventId: event.id,
      purchaseId,
      quantity,
      unitPrice: ticketCategory.price,
      totalAmount,
      originalAmount,
      discountAmount: totalDiscount,
      appliedVouchers: appliedVoucherRecords,
      currency: ticketCategory.currency,
      paymentMethod,
      transactionId,
      status: 'confirmed',
      qrCode,
      seatNumbers,
      eventDetails: { title: event.title, date: event.date, time: event.time, venue: event.location, city: event.city, country: event.country, imageUrl: event.imageUrl, organizer: event.organizer, description: event.description }
    });

    res.status(201).json({ success: true, message: 'Tickets purchased successfully', data: { purchase: { userId: req.user.id, eventId: event.id, quantity, paymentMethod, amount: totalAmount, status: 'completed', transactionId, purchaseDate: new Date(), purchaseId }, ticket, tickets: Array.from({ length: quantity }, (_, i) => ({ ticketId: `${ticket.ticketId}_${i + 1}`, eventId: event.id, userId: req.user.id, seatNumber: seatNumbers[i], qrCode: `${qrCode}_${i + 1}` })) } });
  } catch (error) {
    console.error('Ticket purchase error:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed' });
  }
});

router.get('/my-tickets', authenticateToken, requireEmailVerification, async (req, res) => {
  try {
    const tickets = await Ticket.getTicketsByUser(req.user.id);
    res.json({ success: true, data: { tickets, totalTickets: tickets.length } });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve tickets' });
  }
});

router.post('/refund-ticket', authLimiter, authenticateToken, requireEmailVerification, async (req, res) => {
  res.json({ success: true, message: 'Refund request submitted successfully', data: { refundId: `REF_${Date.now()}`, ticketId: req.body.ticketId, status: 'pending', estimatedProcessingTime: '5-7 business days' } });
});

module.exports = router;
