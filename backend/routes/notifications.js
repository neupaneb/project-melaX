const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getUserUpcomingEvents, testReminders } = require('../utils/scheduler');
const { sendEventReminder, sendEventCancellation, sendEventUpdate } = require('../utils/notificationService');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const router = express.Router();

router.get('/upcoming-events', authenticateToken, async (req, res) => {
  try { const events = await getUserUpcomingEvents(req.user.id); res.json({ success: true, data: { events, count: events.length } }); }
  catch (error) { console.error('Error getting upcoming events:', error); res.status(500).json({ success: false, message: 'Failed to get upcoming events' }); }
});

router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const preferences = { ...req.user.preferences, notifications: { ...req.user.preferences.notifications, email: req.body.email ?? req.user.preferences.notifications.email, sms: req.body.sms ?? req.user.preferences.notifications.sms, push: req.body.push ?? req.user.preferences.notifications.push } };
    const user = await User.updateById(req.user.id, { preferences });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Notification preferences updated successfully', data: { preferences: user.preferences } });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification preferences' });
  }
});

router.get('/preferences', authenticateToken, async (req, res) => {
  res.json({ success: true, data: { preferences: req.user.preferences } });
});

router.post('/test-reminder', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin()) return res.status(403).json({ success: false, message: 'Admin access required' });
    const ticket = await Ticket.findById(req.body.ticketId);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    await sendEventReminder(ticket.userId, { title: ticket.eventDetails.title, date: ticket.eventDetails.date, time: ticket.eventDetails.time, venue: ticket.eventDetails.venue, city: ticket.eventDetails.city }, ticket, req.body.reminderType);
    res.json({ success: true, message: `Test reminder sent successfully (${req.body.reminderType})` });
  } catch (error) {
    console.error('Error sending test reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to send test reminder' });
  }
});

router.post('/test-scheduler', authenticateToken, async (req, res) => {
  try { if (!req.user.isAdmin()) return res.status(403).json({ success: false, message: 'Admin access required' }); await testReminders(); res.json({ success: true, message: 'Scheduler test completed' }); }
  catch (error) { console.error('Error testing scheduler:', error); res.status(500).json({ success: false, message: 'Failed to test scheduler' }); }
});

router.post('/send-cancellation', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin()) return res.status(403).json({ success: false, message: 'Admin access required' });
    const ticket = await Ticket.findById(req.body.ticketId);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    await sendEventCancellation(ticket.userId, { title: ticket.eventDetails.title, date: ticket.eventDetails.date, time: ticket.eventDetails.time, venue: ticket.eventDetails.venue, city: ticket.eventDetails.city }, ticket);
    res.json({ success: true, message: 'Cancellation notification sent successfully' });
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send cancellation notification' });
  }
});

router.post('/send-update', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin()) return res.status(403).json({ success: false, message: 'Admin access required' });
    const ticket = await Ticket.findById(req.body.ticketId);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    await sendEventUpdate(ticket.userId, { title: ticket.eventDetails.title, date: ticket.eventDetails.date, time: ticket.eventDetails.time, venue: ticket.eventDetails.venue, city: ticket.eventDetails.city }, ticket, req.body.changes);
    res.json({ success: true, message: 'Update notification sent successfully' });
  } catch (error) {
    console.error('Error sending update notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send update notification' });
  }
});

module.exports = router;
