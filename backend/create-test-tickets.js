const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Ticket = require('./models/Ticket');

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

const createTestTickets = async () => {
  await connectDB();

  try {
    console.log('🎫 Creating test tickets...\n');

    // Find the user
    const user = await User.findOne({ email: 'melaxnepal@gmail.com' });
    
    if (!user) {
      console.log('❌ No user found with email melaxnepal@gmail.com');
      return;
    }
    
    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Create test tickets for different dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const testTickets = [
      {
        ticketId: `TKT_TEST_${Date.now()}_1`,
        userId: user._id,
        eventId: 'test-event-1',
        purchaseId: `PURCHASE_TEST_${Date.now()}_1`,
        quantity: 2,
        unitPrice: 1000,
        totalAmount: 2000,
        currency: 'NPR',
        paymentMethod: 'esewa',
        transactionId: `TXN_TEST_${Date.now()}_1`,
        status: 'confirmed',
        qrCode: `QR_TEST_${Date.now()}_1`,
        seatNumbers: ['A1', 'A2'],
        eventDetails: {
          title: 'Tomorrow\'s Concert - Test Event',
          date: tomorrow.toISOString().split('T')[0], // Tomorrow
          time: '19:00',
          venue: 'Test Venue',
          city: 'Kathmandu'
        },
        purchaseDate: new Date()
      },
      {
        ticketId: `TKT_TEST_${Date.now()}_2`,
        userId: user._id,
        eventId: 'test-event-2',
        purchaseId: `PURCHASE_TEST_${Date.now()}_2`,
        quantity: 1,
        unitPrice: 1500,
        totalAmount: 1500,
        currency: 'NPR',
        paymentMethod: 'khalti',
        transactionId: `TXN_TEST_${Date.now()}_2`,
        status: 'confirmed',
        qrCode: `QR_TEST_${Date.now()}_2`,
        seatNumbers: ['B1'],
        eventDetails: {
          title: 'Today\'s Movie Premiere - Test Event',
          date: today.toISOString().split('T')[0], // Today
          time: '20:30',
          venue: 'Test Cinema',
          city: 'Pokhara'
        },
        purchaseDate: new Date()
      },
      {
        ticketId: `TKT_TEST_${Date.now()}_3`,
        userId: user._id,
        eventId: 'test-event-3',
        purchaseId: `PURCHASE_TEST_${Date.now()}_3`,
        quantity: 3,
        unitPrice: 800,
        totalAmount: 2400,
        currency: 'NPR',
        paymentMethod: 'esewa',
        transactionId: `TXN_TEST_${Date.now()}_3`,
        status: 'confirmed',
        qrCode: `QR_TEST_${Date.now()}_3`,
        seatNumbers: ['C1', 'C2', 'C3'],
        eventDetails: {
          title: 'Next Week\'s Festival - Test Event',
          date: nextWeek.toISOString().split('T')[0], // Next week
          time: '18:00',
          venue: 'Test Festival Ground',
          city: 'Lalitpur'
        },
        purchaseDate: new Date()
      }
    ];

    // Create tickets
    for (const ticketData of testTickets) {
      const ticket = new Ticket(ticketData);
      await ticket.save();
      console.log(`✅ Created ticket: ${ticket.ticketId} for "${ticket.eventDetails.title}"`);
    }

    console.log(`\n🎉 Successfully created ${testTickets.length} test tickets!`);
    console.log('\n📅 Test tickets created for:');
    console.log(`   - Today: ${today.toDateString()}`);
    console.log(`   - Tomorrow: ${tomorrow.toDateString()}`);
    console.log(`   - Next Week: ${nextWeek.toDateString()}`);
    
    console.log('\n📧 The scheduler will now send:');
    console.log('   - Day-before reminders for tomorrow\'s event');
    console.log('   - Day-of reminders for today\'s event');

  } catch (error) {
    console.error('❌ Error creating test tickets:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
createTestTickets();
