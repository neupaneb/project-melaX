const cron = require('node-cron');
const Ticket = require('../models/Ticket');
const { sendEventReminder } = require('./notificationService');

const initializeScheduler = () => {
  console.log('🕐 Initializing event reminder scheduler...');
  cron.schedule('0 9 * * *', async () => { await checkAndSendDayBeforeReminders(); }, { scheduled: true, timezone: 'Asia/Kathmandu' });
  cron.schedule('0 8 * * *', async () => { await checkAndSendDayOfReminders(); }, { scheduled: true, timezone: 'Asia/Kathmandu' });
  console.log('✅ Event reminder scheduler initialized');
  console.log('   - Day-before reminders: Daily at 9:00 AM');
  console.log('   - Day-of reminders: Daily at 8:00 AM');
};

const checkAndSendDayBeforeReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    const tickets = await Ticket.findReminderTickets(dateString, true);
    for (const ticket of tickets) {
      if (ticket.userId?.preferences?.notifications?.email) {
        await sendEventReminder(ticket.userId, { title: ticket.eventDetails.title, date: ticket.eventDetails.date, time: ticket.eventDetails.time, venue: ticket.eventDetails.venue, city: ticket.eventDetails.city }, ticket, 'day_before');
      }
    }
  } catch (error) {
    console.error('❌ Error in checkAndSendDayBeforeReminders:', error);
  }
};

const checkAndSendDayOfReminders = async () => {
  try {
    const dateString = new Date().toISOString().split('T')[0];
    const tickets = await Ticket.findReminderTickets(dateString, true);
    for (const ticket of tickets) {
      if (ticket.userId?.preferences?.notifications?.email) {
        await sendEventReminder(ticket.userId, { title: ticket.eventDetails.title, date: ticket.eventDetails.date, time: ticket.eventDetails.time, venue: ticket.eventDetails.venue, city: ticket.eventDetails.city }, ticket, 'day_of');
      }
    }
  } catch (error) {
    console.error('❌ Error in checkAndSendDayOfReminders:', error);
  }
};

const testReminders = async () => {
  await checkAndSendDayBeforeReminders();
  await checkAndSendDayOfReminders();
};

const getUserUpcomingEvents = async (userId) => {
  const tickets = await Ticket.getTicketsByUser(userId);
  const today = new Date().toISOString().split('T')[0];
  return tickets.filter((ticket) => ticket.status === 'confirmed' && ticket.eventDetails.date >= today).map((ticket) => ({ ticketId: ticket.ticketId, eventTitle: ticket.eventDetails.title, eventDate: ticket.eventDetails.date, eventTime: ticket.eventDetails.time, venue: ticket.eventDetails.venue, city: ticket.eventDetails.city, quantity: ticket.quantity, totalAmount: ticket.totalAmount, currency: ticket.currency }));
};

module.exports = { initializeScheduler, checkAndSendDayBeforeReminders, checkAndSendDayOfReminders, testReminders, getUserUpcomingEvents };
