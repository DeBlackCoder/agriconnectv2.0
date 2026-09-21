import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';

// Manually load .env.local
const envPath = join(process.cwd(), '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} catch (error) {
  console.warn('Could not load .env.local file');
}

const MONGODB_URI = process.env.MONGODB_URI || '';

async function createSuperAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    const User = (await import('../models/User')).default;
    
    const email = 'hillaryprosperwahua@gmail.com';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log('User already exists, updating to ADMIN role...');
      existingUser.role = 'ADMIN';
      existingUser.isActive = true;
      existingUser.isVerified = true;
      await existingUser.save();
      
      console.log('\nSUPER ADMIN UPDATED:');
      console.log('================');
      console.log('Name:', existingUser.name);
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
      console.log('Active:', existingUser.isActive);
      console.log('Verified:', existingUser.isVerified);
    } else {
      console.log('Creating new super admin account...');
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      
      const superAdmin = await User.create({
        name: 'Hillary Prosper Wahua',
        email: email,
        password: hashedPassword,
        phone: '08012345678',
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        location: {
          state: 'FCT',
          lga: 'Abuja',
          address: 'Abuja, Nigeria'
        },
      });
      
      console.log('\nSUPER ADMIN CREATED:');
      console.log('================');
      console.log('Name:', superAdmin.name);
      console.log('Email:', superAdmin.email);
      console.log('Role:', superAdmin.role);
      console.log('Password: Password123!');
      console.log('Active:', superAdmin.isActive);
      console.log('Verified:', superAdmin.isVerified);
    }
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

createSuperAdmin();
