#!/usr/bin/env node

// Script to make a user super admin
require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function makeUserSuperAdmin() {
  try {
    console.log('👑 Making User Super Admin...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database: ${dbName}\n`);

    // Get email from command line argument or prompt
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node make-user-super-admin.js <email>');
      console.log('Example: node make-user-super-admin.js user@example.com');
      return;
    }

    console.log(`🔍 Looking for user: ${email}`);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      console.log('Available users in database:');
      const allUsers = await User.find({}, 'name email role isSuperAdmin');
      allUsers.forEach(u => {
        console.log(`   - ${u.name} (${u.email}) - Role: ${u.role}, Super Admin: ${u.isSuperAdmin}`);
      });
      return;
    }

    console.log('✅ User found:');
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Current Role: ${user.role}`);
    console.log(`   - Current Super Admin: ${user.isSuperAdmin}`);
    console.log(`   - Verified: ${user.isVerified}`);

    // Check if already super admin
    if (user.isSuperAdminUser()) {
      console.log('\n✅ User is already a super admin!');
      return;
    }

    // Promote to super admin
    console.log('\n🚀 Promoting user to super admin...');
    await user.promoteToSuperAdmin();
    
    console.log('✅ User promoted to super admin successfully!');
    
    // Verify the change
    const updatedUser = await User.findOne({ email: email.toLowerCase() });
    console.log('\n📋 Updated user details:');
    console.log(`   - Name: ${updatedUser.name}`);
    console.log(`   - Email: ${updatedUser.email}`);
    console.log(`   - Role: ${updatedUser.role}`);
    console.log(`   - Super Admin: ${updatedUser.isSuperAdmin}`);
    console.log(`   - Verified: ${updatedUser.isVerified}`);

    console.log('\n🎉 Super admin promotion complete!');
    console.log('\n💡 The user now has:');
    console.log('   ✅ Super admin privileges');
    console.log('   ✅ Access to admin panel');
    console.log('   ✅ Ability to invite other admins');
    console.log('   ✅ Full system access');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

makeUserSuperAdmin();
