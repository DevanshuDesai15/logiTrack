import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

// Connect to database
connectDB();

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@logitrack.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@logitrack.com',
      password: 'admin123',
      role: 'admin',
    });
    
    console.log('Admin user created:');
    console.log({
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createAdminUser(); 