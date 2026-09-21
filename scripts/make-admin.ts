import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// User schema (minimal for this script)
const UserSchema = new mongoose.Schema({
  email: String,
  role: String,
  emailVerified: Boolean,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function makeAdmin(email: string) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.email}`);
    console.log(`Current role: ${user.role}`);

    // Update to ADMIN role and verify email
    user.role = 'ADMIN';
    user.emailVerified = true;
    await user.save();

    console.log(`✅ Successfully promoted ${email} to ADMIN role!`);
    console.log(`✅ Email verified: true`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'hillaryprosperwahua@gmail.com';
makeAdmin(email);
