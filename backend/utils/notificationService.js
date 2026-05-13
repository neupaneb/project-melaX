const { sendEmail } = require('./emailService');

/**
 * Send event reminder email to user
 * @param {Object} user - User object
 * @param {Object} event - Event object
 * @param {Object} ticket - Ticket object
 * @param {string} reminderType - 'day_before' or 'day_of'
 */
const sendEventReminder = async (user, event, ticket, reminderType) => {
  try {
    const isDayBefore = reminderType === 'day_before';
    const subject = isDayBefore 
      ? `Reminder: ${event.title} is tomorrow!` 
      : `Today's Event: ${event.title}`;
    
    const greeting = isDayBefore 
      ? `Don't forget! Your event is tomorrow.` 
      : `Today's the day! Your event is happening today.`;
    
    const actionText = isDayBefore 
      ? `Get ready for tomorrow's event` 
      : `Enjoy your event today`;
    
    const urgencyColor = isDayBefore ? '#f59e0b' : '#ef4444'; // amber for day before, red for day of
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e53e3e; margin: 0;">melaX</h1>
          <p style="color: #666; margin: 5px 0;">Your Event & Movie Ticketing Platform</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <div style="background-color: ${urgencyColor}; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 18px;">${greeting}</h2>
          </div>
          
          <h2 style="color: #333; margin-top: 0;">Event Reminder</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi ${user.name},
          </p>
          <p style="color: #666; line-height: 1.6;">
            ${isDayBefore 
              ? "This is a friendly reminder that you have an event tomorrow!" 
              : "Your event is happening today! Don't miss it."}
          </p>
          
          <!-- Event Details -->
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e53e3e;">
            <h3 style="color: #333; margin-top: 0;">${event.title}</h3>
            <div style="color: #666; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${event.time}</p>
              <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${event.venue}</p>
              <p style="margin: 5px 0;"><strong>🏙️ City:</strong> ${event.city}</p>
              <p style="margin: 5px 0;"><strong>🎫 Tickets:</strong> ${ticket.quantity} ticket${ticket.quantity > 1 ? 's' : ''}</p>
              <p style="margin: 5px 0;"><strong>🎫 Ticket ID:</strong> ${ticket.ticketId}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #e53e3e; color: white; padding: 12px 30px; border-radius: 5px; display: inline-block; font-weight: bold;">
              ${actionText}
            </div>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">📱 Important Reminders:</h4>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Bring a valid ID for entry</li>
              <li>Arrive 15-30 minutes early</li>
              <li>Check the venue's parking situation</li>
              <li>Keep your ticket details handy</li>
              ${isDayBefore ? '<li>Plan your route and transportation</li>' : ''}
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If you have any questions or need to make changes to your booking, please contact our support team.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>This email was sent from melaX. Please do not reply to this email.</p>
          <p>For support, contact <a href="mailto:support@melax.com" style="color: #e53e3e;">support@melax.com</a></p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: user.email,
      subject: subject,
      html: html
    });

    console.log(`Event reminder sent to ${user.email} for event "${event.title}" (${reminderType})`);
    return result;

  } catch (error) {
    console.error('Error sending event reminder:', error);
    throw error;
  }
};

/**
 * Send event cancellation notification
 * @param {Object} user - User object
 * @param {Object} event - Event object
 * @param {Object} ticket - Ticket object
 */
const sendEventCancellation = async (user, event, ticket) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e53e3e; margin: 0;">melaX</h1>
          <p style="color: #666; margin: 5px 0;">Your Event & Movie Ticketing Platform</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <div style="background-color: #ef4444; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 18px;">Event Cancelled</h2>
          </div>
          
          <h2 style="color: #333; margin-top: 0;">Important Notice</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi ${user.name},
          </p>
          <p style="color: #666; line-height: 1.6;">
            We regret to inform you that the following event has been cancelled:
          </p>
          
          <!-- Event Details -->
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #333; margin-top: 0;">${event.title}</h3>
            <div style="color: #666; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${event.time}</p>
              <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${event.venue}</p>
              <p style="margin: 5px 0;"><strong>🎫 Tickets:</strong> ${ticket.quantity} ticket${ticket.quantity > 1 ? 's' : ''}</p>
              <p style="margin: 5px 0;"><strong>💰 Amount:</strong> ${ticket.totalAmount} ${ticket.currency}</p>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">💳 Refund Information</h4>
            <p style="color: #666; margin: 0;">
              Your refund will be processed within 3-5 business days to your original payment method. 
              You will receive a separate email confirmation once the refund is processed.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            We apologize for any inconvenience this may cause. If you have any questions or concerns, 
            please don't hesitate to contact our support team.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>This email was sent from melaX. Please do not reply to this email.</p>
          <p>For support, contact <a href="mailto:support@melax.com" style="color: #e53e3e;">support@melax.com</a></p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: user.email,
      subject: `Event Cancelled: ${event.title}`,
      html: html
    });

    console.log(`Event cancellation notification sent to ${user.email} for event "${event.title}"`);
    return result;

  } catch (error) {
    console.error('Error sending event cancellation notification:', error);
    throw error;
  }
};

/**
 * Send event update notification
 * @param {Object} user - User object
 * @param {Object} event - Event object
 * @param {Object} ticket - Ticket object
 * @param {Object} changes - Object containing what changed
 */
const sendEventUpdate = async (user, event, ticket, changes) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e53e3e; margin: 0;">melaX</h1>
          <p style="color: #666; margin: 5px 0;">Your Event & Movie Ticketing Platform</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <div style="background-color: #3b82f6; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 18px;">Event Updated</h2>
          </div>
          
          <h2 style="color: #333; margin-top: 0;">Important Update</h2>
          <p style="color: #666; line-height: 1.6;">
            Hi ${user.name},
          </p>
          <p style="color: #666; line-height: 1.6;">
            We wanted to inform you about some changes to your upcoming event:
          </p>
          
          <!-- Event Details -->
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #333; margin-top: 0;">${event.title}</h3>
            <div style="color: #666; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${event.time}</p>
              <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${event.venue}</p>
              <p style="margin: 5px 0;"><strong>🏙️ City:</strong> ${event.city}</p>
            </div>
          </div>
          
          <!-- Changes -->
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">📝 Changes Made:</h4>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              ${Object.entries(changes).map(([key, value]) => 
                `<li><strong>${key}:</strong> ${value}</li>`
              ).join('')}
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Please make note of these changes. If you have any questions or concerns, 
            please contact our support team.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>This email was sent from melaX. Please do not reply to this email.</p>
          <p>For support, contact <a href="mailto:support@melax.com" style="color: #e53e3e;">support@melax.com</a></p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: user.email,
      subject: `Event Updated: ${event.title}`,
      html: html
    });

    console.log(`Event update notification sent to ${user.email} for event "${event.title}"`);
    return result;

  } catch (error) {
    console.error('Error sending event update notification:', error);
    throw error;
  }
};

module.exports = {
  sendEventReminder,
  sendEventCancellation,
  sendEventUpdate
};
