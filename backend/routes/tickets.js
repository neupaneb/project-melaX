const express = require('express');
const Ticket = require('../models/Ticket');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/my-tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.getTicketsByUser(req.user.id);
    res.status(200).json({ success: true, message: 'Tickets retrieved successfully', data: { tickets, count: tickets.length } });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.getTicketsByEvent(req.params.eventId);
    res.status(200).json({ success: true, message: 'Event tickets retrieved successfully', data: { tickets, count: tickets.length } });
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/purchase/:purchaseId', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.getTicketsByPurchase(req.params.purchaseId);
    res.status(200).json({ success: true, message: 'Purchase tickets retrieved successfully', data: { tickets, count: tickets.length } });
  } catch (error) {
    console.error('Error fetching purchase tickets:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { eventId, purchaseId, quantity, unitPrice, totalAmount, currency, paymentMethod, transactionId, eventDetails } = req.body;
    if (!eventId || !purchaseId || !quantity || !unitPrice || !totalAmount || !eventDetails) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const seatNumbers = Array.from({ length: quantity }, (_, i) => `A${i + 1}`);
    const qrCode = `QR-${purchaseId}-${Date.now()}`;
    const ticket = await Ticket.create({
      ticketId: `TKT-${purchaseId}-${Date.now()}`,
      userId: req.user.id,
      eventId,
      purchaseId,
      quantity,
      unitPrice,
      totalAmount,
      originalAmount: totalAmount,
      currency: currency || 'NPR',
      paymentMethod: paymentMethod || 'card',
      transactionId,
      status: 'confirmed',
      qrCode,
      seatNumbers,
      eventDetails,
    });
    res.status(201).json({ success: true, message: 'Tickets created successfully', data: { ticket } });
  } catch (error) {
    console.error('Error creating tickets:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:ticketId/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'pending', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const ticket = await Ticket.updateStatusByTicketIdAndUserId(req.params.ticketId, req.user.id, status);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.status(200).json({ success: true, message: 'Ticket status updated successfully', data: { ticket } });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
