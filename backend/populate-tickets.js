#!/usr/bin/env node

// Script to populate tickets collection with existing purchased events data
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');

// Mock purchased events data (same as frontend)
const mockPurchasedEvents = [
  {
    id: 'purchase-1',
    eventId: '1',
    purchaseDate: "2025-01-15",
    quantity: 2,
    totalPrice: 3000,
    status: 'confirmed',
    ticketNumber: 'NM2025-001',
    transactionId: 'TXN-1758412345678',
    paymentMethod: 'card',
    receiptId: 'RCP-1758412345678',
    eventDetails: {
      title: "Nepal Music Festival 2025",
      date: "2025-03-15",
      time: "18:00",
      venue: "Tundikhel Ground",
      city: "Kathmandu"
    }
  },
  {
    id: 'purchase-2',
    eventId: '2',
    purchaseDate: "2025-01-10",
    quantity: 1,
    totalPrice: 2500,
    status: 'confirmed',
    ticketNumber: 'TS2025-002',
    transactionId: 'TXN-1758412345679',
    paymentMethod: 'khalti',
    receiptId: 'RCP-1758412345679',
    eventDetails: {
      title: "Tech Summit Kathmandu",
      date: "2025-02-28",
      time: "09:00",
      venue: "Hotel Yak & Yeti",
      city: "Kathmandu"
    }
  },
  {
    id: 'purchase-3',
    eventId: '5',
    purchaseDate: "2025-01-20",
    quantity: 3,
    totalPrice: 1500,
    status: 'confirmed',
    ticketNumber: 'HC2025-003',
    transactionId: 'TXN-1758412345680',
    paymentMethod: 'esewa',
    receiptId: 'RCP-1758412345680',
    eventDetails: {
      title: "Holi Celebration Concert",
      date: "2025-03-13",
      time: "16:00",
      venue: "Basantapur Durbar Square",
      city: "Kathmandu"
    }
  }
];

async function populateTickets() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing tickets
    console.log('🗑️ Clearing existing tickets...');
    await Ticket.deleteMany({});
    console.log('✅ Cleared existing tickets');

    // Create tickets for each purchased event
    console.log('📝 Creating tickets...');
    const createdTickets = [];

    for (const purchase of mockPurchasedEvents) {
      // Generate seat numbers
      const seatNumbers = Array.from({ length: purchase.quantity }, (_, i) => `A${i + 1}`);
      
      // Generate QR code
      const qrCode = `QR-${purchase.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const ticket = new Ticket({
        ticketId: `TKT-${purchase.id}-${Date.now()}`,
        userId: new mongoose.Types.ObjectId('68cf6350dc82a9882f83d466'), // Real user ID
        eventId: purchase.eventId,
        purchaseId: purchase.id,
        quantity: purchase.quantity,
        unitPrice: purchase.totalPrice / purchase.quantity,
        totalAmount: purchase.totalPrice,
        currency: 'NPR',
        paymentMethod: purchase.paymentMethod,
        transactionId: purchase.transactionId,
        status: purchase.status,
        qrCode,
        seatNumbers,
        eventDetails: purchase.eventDetails
      });

      await ticket.save();
      createdTickets.push(ticket);
      console.log(`✅ Created ticket for ${purchase.eventDetails.title} (${purchase.quantity} tickets)`);
    }

    console.log(`\n🎉 Successfully created ${createdTickets.length} ticket records!`);
    console.log('📊 Summary:');
    createdTickets.forEach(ticket => {
      console.log(`   - ${ticket.eventDetails.title}: ${ticket.quantity} tickets, ${ticket.currency} ${ticket.totalAmount}`);
    });

  } catch (error) {
    console.error('❌ Error populating tickets:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

populateTickets();
