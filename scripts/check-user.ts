import mongoose from 'mongoose';
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

async function checkUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    const User = (await import('../models/User')).default;
    
    const user = await User.findOne({ email: 'hillaryprosperwahua@gmail.com' }).select('-password');
    
    if (user) {
      console.log('USER FOUND:');
      console.log('================');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
      console.log('Verified:', user.isVerified);
      console.log('Phone:', user.phone || 'N/A');
      console.log('Created:', user.createdAt);
    } else {
      console.log('USER NOT FOUND');
      console.log('Email: hillaryprosperwahua@gmail.com does not exist in database');
    }
    
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();
