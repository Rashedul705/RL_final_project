
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;




/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default dbConnect;

async function dbConnect() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering to prevent hanging
      serverSelectionTimeoutMS: 5000, // Fail fast if DB is unreachable
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts).then((mongoose) => {
      // console.log("MongoDB Connected Successfully");
      return mongoose.connection;
    }).catch((error) => {
      console.error("MongoDB Connection Failed:", error);
      cached.promise = null; // Reset promise so we can retry
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error details:', e);
    throw e; // Re-throw to caller
  }

  return cached.conn;
}
