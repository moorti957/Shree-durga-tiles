import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AdminUser } from '../models/AdminUser';

dotenv.config();

const getCredentials = () => {
  const identifier = (process.env.ADMIN_EMAIL || process.env.ADMIN_IDENTIFIER || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!identifier || !password) {
    throw new Error('Set ADMIN_EMAIL (or ADMIN_IDENTIFIER) and ADMIN_PASSWORD in the backend environment.');
  }
  if (password.length < 10 || password.length > 200) {
    throw new Error('ADMIN_PASSWORD must be between 10 and 200 characters.');
  }
  return { identifier, password };
};

const run = async () => {
  const action = process.argv[2] || 'bootstrap';
  if (action !== 'bootstrap' && action !== 'reset-password') {
    throw new Error('Use "bootstrap" or "reset-password".');
  }
  if (action === 'reset-password' && process.env.NODE_ENV !== 'development') {
    throw new Error('Password reset is available only when NODE_ENV=development.');
  }

  const { identifier, password } = getCredentials();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Set MONGODB_URI in the backend environment before running this command.');
  }
  try {
    await mongoose.connect(uri);
  } catch {
    throw new Error('Could not connect to MongoDB. Check the backend database configuration.');
  }

  try {
    const admin = await AdminUser.findOne({ identifier });
    if (action === 'bootstrap') {
      if (admin) {
        console.info('Owner account already exists; credentials were not changed.');
        return;
      }

      await AdminUser.create({
        name: process.env.ADMIN_NAME?.trim() || 'Store Owner',
        identifier,
        passwordHash: await bcrypt.hash(password, 12),
        role: 'owner',
      });
      console.info('Created the owner account using the configured admin environment variables.');
      return;
    }

    if (!admin) throw new Error('No owner account exists for the configured identifier.');
    await AdminUser.updateOne(
      { _id: admin._id },
      {
        $set: {
          passwordHash: await bcrypt.hash(password, 12),
          failedAttempts: 0,
          lockedUntil: null,
        },
        $unset: { refreshTokenHash: 1 },
      }
    );
    console.info('Updated the development owner password and cleared existing sessions.');
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Admin account command failed.');
  process.exitCode = 1;
});
