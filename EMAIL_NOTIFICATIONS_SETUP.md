# Email Notification System Setup

## Overview

The melaX application now includes a comprehensive email notification system that automatically sends reminders to users about their upcoming events. Users receive notifications a day before and on the day of their events.

## Features

### 🎯 Automatic Reminders
- **Day-before reminders**: Sent daily at 9:00 AM for events happening tomorrow
- **Day-of reminders**: Sent daily at 8:00 AM for events happening today
- **Timezone**: Asia/Kathmandu (Nepal timezone)

### 📧 Email Types
1. **Event Reminders** - Day before and day of event notifications
2. **Event Cancellations** - When events are cancelled
3. **Event Updates** - When event details change

### ⚙️ User Preferences
- Email notifications (enabled by default)
- SMS notifications (disabled by default)
- Push notifications (enabled by default)

## Technical Implementation

### Backend Components

#### 1. Notification Service (`utils/notificationService.js`)
- `sendEventReminder()` - Sends day-before and day-of reminders
- `sendEventCancellation()` - Sends cancellation notifications
- `sendEventUpdate()` - Sends update notifications

#### 2. Scheduler (`utils/scheduler.js`)
- `initializeScheduler()` - Sets up cron jobs
- `checkAndSendDayBeforeReminders()` - Processes tomorrow's events
- `checkAndSendDayOfReminders()` - Processes today's events
- `getUserUpcomingEvents()` - Gets user's upcoming events

#### 3. API Routes (`routes/notifications.js`)
- `GET /api/notifications/upcoming-events` - Get user's upcoming events
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences
- `POST /api/notifications/test-reminder` - Test reminder (admin only)
- `POST /api/notifications/test-scheduler` - Test scheduler (admin only)
- `POST /api/notifications/send-cancellation` - Send cancellation (admin only)
- `POST /api/notifications/send-update` - Send update (admin only)

### Frontend Components

#### Profile Modal Updates
- Added notification preferences section
- Toggle switches for email, SMS, and push notifications
- Real-time preference updates

## Email Templates

### Day-Before Reminder
- **Subject**: "Reminder: [Event Title] is tomorrow!"
- **Color**: Amber (#f59e0b)
- **Content**: Event details, preparation tips, arrival reminders

### Day-of Reminder
- **Subject**: "Today's Event: [Event Title]"
- **Color**: Red (#ef4444)
- **Content**: Event details, final reminders, important notes

### Event Cancellation
- **Subject**: "Event Cancelled: [Event Title]"
- **Color**: Red (#ef4444)
- **Content**: Cancellation notice, refund information

### Event Update
- **Subject**: "Event Updated: [Event Title]"
- **Color**: Blue (#3b82f6)
- **Content**: Updated details, change summary

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install node-cron
```

### 2. Environment Variables
Ensure these are set in `config.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=melaX <your-email@gmail.com>
```

### 3. Database Schema
The User model already includes notification preferences:
```javascript
preferences: {
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  }
}
```

### 4. Server Integration
The scheduler is automatically initialized when the server starts:
```javascript
// In server.js
const { initializeScheduler } = require('./utils/scheduler');

const server = app.listen(PORT, () => {
  // ... other initialization
  initializeScheduler();
});
```

## Testing

### Manual Testing
```bash
# Test the notification system
node test-notifications.js

# Create test tickets
node create-test-tickets.js
```

### API Testing
```bash
# Test scheduler (admin only)
curl -X POST http://localhost:3002/api/notifications/test-scheduler \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Test specific reminder
curl -X POST http://localhost:3002/api/notifications/test-reminder \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "TKT_ID", "reminderType": "day_before"}'
```

## Cron Schedule

The system uses Nepal timezone (Asia/Kathmandu):

- **9:00 AM daily**: Day-before reminders for tomorrow's events
- **8:00 AM daily**: Day-of reminders for today's events

## User Experience

### Profile Settings
Users can manage their notification preferences in their profile:
1. Go to Profile → Notification Preferences
2. Toggle email, SMS, and push notifications
3. Changes are saved immediately

### Email Content
- Professional HTML templates
- Responsive design
- Clear event information
- Action-oriented content
- Branded with melaX styling

## Admin Features

### Testing Tools
- Test individual reminders
- Test scheduler system
- Send manual notifications
- Monitor notification status

### Management
- Send event cancellations
- Send event updates
- Bulk notification management

## Monitoring

### Logs
The system provides detailed logging:
```
📅 Running day-before event reminder check...
📧 Found 5 tickets for tomorrow's events
✅ Day-before reminders completed: 5 sent, 0 errors
```

### Error Handling
- Graceful error handling for failed emails
- Retry mechanisms for temporary failures
- Detailed error logging

## Security

### Access Control
- Admin-only endpoints for testing
- User authentication required
- Rate limiting on API endpoints

### Data Privacy
- Respects user notification preferences
- No spam or unsolicited emails
- GDPR-compliant email handling

## Future Enhancements

### Planned Features
- SMS notifications integration
- Push notification service
- Advanced scheduling options
- Email analytics and tracking
- Custom notification templates
- Multi-language support

### Integration Opportunities
- WhatsApp notifications
- Telegram bot integration
- Slack notifications for admins
- Calendar integration (Google, Outlook)

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check email credentials in `config.env`
   - Verify Gmail app password
   - Check server logs for errors

2. **Scheduler not running**
   - Ensure server is running
   - Check timezone settings
   - Verify cron job initialization

3. **User preferences not saving**
   - Check API endpoint authentication
   - Verify database connection
   - Check frontend API calls

### Debug Commands
```bash
# Check scheduler status
node -e "console.log('Scheduler test:', require('./utils/scheduler').testReminders())"

# Test email service
node test-email.js

# Check user preferences
node -e "require('./models/User').findOne({email: 'user@example.com'}).then(u => console.log(u.preferences))"
```

## Support

For issues or questions about the notification system:
- Check server logs for detailed error messages
- Verify email configuration
- Test with the provided test scripts
- Contact support with specific error details

---

**Note**: This notification system is designed to enhance user experience by keeping them informed about their events. All notifications respect user preferences and include unsubscribe options.
