const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const { sendEventReminder, sendEventCancellation, sendEventUpdate } = require('./utils/notificationService');
const { testReminders, getUserUpcomingEvents } = require('./utils/scheduler');

dotenv.config({ path: './config.env' });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log(`✅ Connected to MongoDB`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

const testNotificationSystem = async () => {
  await connectDB();

  try {
    console.log('🧪 Testing Notification System...\n');

    // Test 1: Find a user with tickets
    console.log('1️⃣ Finding user with tickets...');
    const user = await User.findOne({ email: 'melaxnepal@gmail.com' });
    
    if (!user) {
      console.log('❌ No user found with email melaxnepal@gmail.com');
      return;
    }
    
    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`   - Email notifications: ${user.preferences?.notifications?.email}`);
    console.log(`   - SMS notifications: ${user.preferences?.notifications?.sms}`);
    console.log(`   - Push notifications: ${user.preferences?.notifications?.push}\n`);

    // Test 2: Find tickets for this user
    console.log('2️⃣ Finding tickets for user...');
    const tickets = await Ticket.find({ userId: user._id }).limit(3);
    
    if (tickets.length === 0) {
      console.log('❌ No tickets found for this user');
      return;
    }
    
    console.log(`✅ Found ${tickets.length} tickets for user\n`);

    // Test 3: Test event reminder (day before)
    console.log('3️⃣ Testing day-before reminder...');
    const ticket = tickets[0];
    const eventData = {
      title: ticket.eventDetails.title,
      date: ticket.eventDetails.date,
      time: ticket.eventDetails.time,
      venue: ticket.eventDetails.venue,
      city: ticket.eventDetails.city
    };
    
    try {
      await sendEventReminder(user, eventData, ticket, 'day_before');
      console.log('✅ Day-before reminder sent successfully\n');
    } catch (error) {
      console.log(`❌ Day-before reminder failed: ${error.message}\n`);
    }

    // Test 4: Test event reminder (day of)
    console.log('4️⃣ Testing day-of reminder...');
    try {
      await sendEventReminder(user, eventData, ticket, 'day_of');
      console.log('✅ Day-of reminder sent successfully\n');
    } catch (error) {
      console.log(`❌ Day-of reminder failed: ${error.message}\n`);
    }

    // Test 5: Test event cancellation
    console.log('5️⃣ Testing event cancellation notification...');
    try {
      await sendEventCancellation(user, eventData, ticket);
      console.log('✅ Event cancellation notification sent successfully\n');
    } catch (error) {
      console.log(`❌ Event cancellation notification failed: ${error.message}\n`);
    }

    // Test 6: Test event update
    console.log('6️⃣ Testing event update notification...');
    const changes = {
      'Time': 'Changed from 7:00 PM to 8:00 PM',
      'Venue': 'Changed from Old Venue to New Venue'
    };
    
    try {
      await sendEventUpdate(user, eventData, ticket, changes);
      console.log('✅ Event update notification sent successfully\n');
    } catch (error) {
      console.log(`❌ Event update notification failed: ${error.message}\n`);
    }

    // Test 7: Test scheduler functions
    console.log('7️⃣ Testing scheduler functions...');
    try {
      const upcomingEvents = await getUserUpcomingEvents(user._id);
      console.log(`✅ Found ${upcomingEvents.length} upcoming events for user`);
      
      if (upcomingEvents.length > 0) {
        console.log('   Upcoming events:');
        upcomingEvents.forEach((event, index) => {
          console.log(`   ${index + 1}. ${event.eventTitle} - ${event.eventDate} at ${event.eventTime}`);
        });
      }
      console.log('');
    } catch (error) {
      console.log(`❌ Scheduler test failed: ${error.message}\n`);
    }

    // Test 8: Test notification preferences update
    console.log('8️⃣ Testing notification preferences update...');
    try {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { 
          $set: { 
            'preferences.notifications.email': true,
            'preferences.notifications.sms': false,
            'preferences.notifications.push': true
          }
        },
        { new: true }
      );
      
      console.log('✅ Notification preferences updated successfully');
      console.log(`   - Email: ${updatedUser.preferences.notifications.email}`);
      console.log(`   - SMS: ${updatedUser.preferences.notifications.sms}`);
      console.log(`   - Push: ${updatedUser.preferences.notifications.push}\n`);
    } catch (error) {
      console.log(`❌ Notification preferences update failed: ${error.message}\n`);
    }

    console.log('🎉 Notification system test completed!');
    console.log('\n📧 Check your email for the test notifications.');
    console.log('📅 The scheduler will run automatically at:');
    console.log('   - 9:00 AM daily (day-before reminders)');
    console.log('   - 8:00 AM daily (day-of reminders)');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
testNotificationSystem();
