import type { Express, RequestHandler } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// Set up session store using PostgreSQL
const pgStore = connectPg(session);

export const setupEmailAuth = async (app: Express) => {
  // Set up session middleware with PostgreSQL store
  app.use(
    session({
      store: new pgStore({
        conString: process.env.DATABASE_URL,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "fallback-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
      }
    })
  );

  // Middleware to add user data to request
  app.use(async (req, res, next) => {
    if (req.session && req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        (req as any).user = user;
      }
    }
    next();
  });
};

// Middleware to require authentication
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!(req as any).user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

// Register a new user
export const registerUser = async (email: string, password: string, firstName: string, lastName: string) => {
  // Hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // Create user in database
  const user = await storage.upsertUser({
    email,
    firstName,
    lastName,
    password: hashedPassword
  });
  
  return user;
};

// Authenticate a user
export const authenticateUser = async (email: string, password: string) => {
  // Find user by email
  const user = await storage.getUserByEmail(email);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Check if user has a password (might be a Replit user)
  if (!user.password) {
    throw new Error("User account not set up for email authentication");
  }
  
  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  
  return user;
};