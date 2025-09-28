import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupDevAuth, requireAuth } from "./devAuth";
import { setupEmailAuth, registerUser, authenticateUser } from "./emailAuth";
import { insertCustomerSchema, insertBillSchema, insertExpenseSchema, insertEmployeeSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - use email auth in production, dev auth in development
  if (process.env.NODE_ENV === "production") {
    await setupEmailAuth(app);
  } else {
    await setupDevAuth(app);
  }

  // Email registration route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Validate input
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Register the user
      const user = await registerUser(email, password, firstName, lastName);
      
      // Create session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.status(201).json({ message: "User registered successfully", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Email login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Authenticate the user
      const user = await authenticateUser(email, password);
      
      // Create session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.json({ message: "Logged in successfully", user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error: any) {
      console.error("Error logging in:", error);
      if (error.message === "User not found" || error.message === "Invalid password") {
        res.status(401).json({ message: "Invalid email or password" });
      } else {
        res.status(500).json({ message: "Failed to log in" });
      }
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy(() => {});
    res.json({ message: "Logged out successfully" });
  });

  // Auth routes
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customer routes
  app.get('/api/customers', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const customers = await storage.getCustomers(userId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post('/api/customers', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log('Creating customer for user:', userId);
      console.log('Request body:', req.body);
      const customerData = insertCustomerSchema.parse({ ...req.body, userId });
      console.log('Parsed customer data:', customerData);
      const customer = await storage.createCustomer(customerData);
      console.log('Customer created successfully:', customer);
      res.json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", error.errors);
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create customer" });
      }
    }
  });

  app.put('/api/customers/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData, userId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update customer" });
      }
    }
  });

  app.delete('/api/customers/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await storage.deleteCustomer(id, userId);
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Bills routes
  app.get('/api/bills', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bills = await storage.getBills(userId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  // Expenses routes
  app.get('/api/expenses', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const expenses = await storage.getExpenses(userId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/expenses', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Convert string dates to Date objects
      const requestData = {
        ...req.body,
        userId,
        expenseDate: req.body.expenseDate ? new Date(req.body.expenseDate) : undefined
      };
      const expenseData = insertExpenseSchema.parse(requestData);
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  // Employees routes
  app.get('/api/employees', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const employees = await storage.getEmployees(userId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post('/api/employees', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      // Convert string dates to Date objects
      const requestData = {
        ...req.body,
        userId,
        joinDate: req.body.joinDate ? new Date(req.body.joinDate) : undefined
      };
      const employeeData = insertEmployeeSchema.parse(requestData);
      const employee = await storage.createEmployee(employeeData);
      res.json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create employee" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}