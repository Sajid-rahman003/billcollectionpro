import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export const setupDevAuth = async (app: Express) => {
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-secret",
      resave: false,
      saveUninitialized: false,
    })
  );

  // Development authentication middleware
  app.use(async (req, res, next) => {
    if (!req.session.userId) {
      // Create a development user
      const devUser = await storage.upsertUser({
        id: "dev-user",
        firstName: "Development",
        lastName: "User",
        email: "dev@example.com",
      });
      req.session.userId = devUser.id;
    }
    next();
  });

  // Add user data to request
  app.use(async (req, res, next) => {
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        (req as any).user = user;
      }
    }
    next();
  });
};

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!(req as any).user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};