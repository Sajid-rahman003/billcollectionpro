import express, { type Request, Response, NextFunction } from "express";
import { type Server } from "http";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  let httpServer: Server;

  try {
    console.log('Starting server setup...');
    
    // Set up error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    // Register routes and get HTTP server instance
    httpServer = await registerRoutes(app);
    console.log('Routes registered');

    // Set up development environment with Vite
    if (process.env.NODE_ENV === "development") {
      console.log('Setting up Vite...');
      await setupVite(app, httpServer);
      console.log('Vite setup complete');
    } else {
      console.log('Setting up static server...');
      serveStatic(app);
      console.log('Static server setup complete');
    }

    // Start listening
    httpServer.listen(3000, () => {
      log(`serving on port 3000`);
    });

    // Handle cleanup on exit
    process.on('SIGINT', () => {
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
