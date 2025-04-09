import { MongoClient } from "mongodb";
import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true,
  // Add heartbeat to detect connection issues
  heartbeatFrequencyMS: 10000,
  // Add connection monitoring
  monitorCommands: true,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let mongooseConnection: typeof mongoose | null = null;

async function connectToDatabase() {
  try {
    // Check if we already have a connection
    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return mongoose.connection;
    }

    // If we have a cached connection, return it
    if (mongooseConnection) {
      return mongooseConnection.connection;
    }

    console.log("Connecting to MongoDB...");

    // Connect to MongoDB using Mongoose
    mongooseConnection = await mongoose.connect(uri, options);

    // Set up connection event handlers
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected from MongoDB");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("Mongoose connection closed through app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error closing mongoose connection:", err);
        process.exit(1);
      }
    });

    console.log("Successfully connected to MongoDB");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to database");
  }
}

// Initialize MongoDB native client for NextAuth
if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export { connectToDatabase, clientPromise };
