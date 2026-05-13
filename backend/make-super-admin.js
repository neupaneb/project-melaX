#!/usr/bin/env node

// Script to make a user super admin
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function makeSuperAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME });
    console.log('✅ Connected to MongoDB');

    // Get email from command line argument or use default
    const email = process.argv[2] || 'nabin@gmail.com'; // Your email
    
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ User with email ${email} not found.`);
      console.log('Available users:');
      const allUsers = await User.find({}, 'name email role');
      allUsers.forEach(u => {
        console.log(`   - ${u.name} (${u.email}) - Role: ${u.role}`);
      });
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);
    console.log(`📊 Current role: ${user.role}`);

    // Make user super admin
    user.role = 'super_admin';
    user.isSuperAdmin = true;
    await user.save();

    console.log('🎉 User promoted to Super Admin successfully!');
    console.log('✅ The user can now:');
    console.log('   - See the "Add Event" button');
    console.log('   - Invite other admins');
    console.log('   - Manage all users');
    console.log('   - Access admin panel');

    // Show current admins
    console.log('\n📋 Current admins:');
    const admins = await User.findAdmins().select('name email role isSuperAdmin');
    admins.forEach(admin => {
      const role = admin.isSuperAdmin ? 'Super Admin' : 'Admin';
      console.log(`   - ${admin.name} (${admin.email}) - ${role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Usage instructions
if (process.argv.length < 3) {
  console.log('📖 Usage: node make-super-admin.js <email>');
  console.log('📖 Example: node make-super-admin.js nabin@gmail.com');
  console.log('📖 If no email provided, will use: nabin@gmail.com');
  console.log('');
}

makeSuperAdmin();
