var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bills: () => bills,
  billsRelations: () => billsRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
  employees: () => employees,
  employeesRelations: () => employeesRelations,
  expenses: () => expenses,
  expensesRelations: () => expensesRelations,
  insertBillSchema: () => insertBillSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertEmployeeSchema: () => insertEmployeeSchema,
  insertExpenseSchema: () => insertExpenseSchema,
  sessions: () => sessions,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  package: decimal("package", { precision: 10, scale: 2 }).default("0"),
  phone: varchar("phone"),
  address: text("address"),
  status: varchar("status", { enum: ["paid", "due", "overdue"] }).notNull().default("due"),
  totalBills: decimal("total_bills", { precision: 10, scale: 2 }).default("0"),
  outstanding: decimal("outstanding", { precision: 10, scale: 2 }).default("0"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var bills = pgTable("bills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  billNumber: varchar("bill_number").notNull().unique(),
  customerId: varchar("customer_id").references(() => customers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["paid", "due", "overdue"] }).notNull().default("due"),
  billDate: timestamp("bill_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseNumber: varchar("expense_number").notNull().unique(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expenseDate: timestamp("expense_date").notNull(),
  employeeId: varchar("employee_id").references(() => employees.id),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});
var employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeNumber: varchar("employee_number").notNull().unique(),
  name: varchar("name").notNull(),
  position: varchar("position").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  joinDate: timestamp("join_date").notNull(),
  status: varchar("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  customers: many(customers),
  bills: many(bills),
  expenses: many(expenses),
  employees: many(employees)
}));
var customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, { fields: [customers.userId], references: [users.id] }),
  bills: many(bills)
}));
var billsRelations = relations(bills, ({ one }) => ({
  user: one(users, { fields: [bills.userId], references: [users.id] }),
  customer: one(customers, { fields: [bills.customerId], references: [customers.id] })
}));
var expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, { fields: [expenses.userId], references: [users.id] }),
  employee: one(employees, { fields: [expenses.employeeId], references: [employees.id] })
}));
var employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, { fields: [employees.userId], references: [users.id] }),
  expenses: many(expenses)
}));
var insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true
});
var insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Customer operations
  async getCustomers(userId) {
    return await db.select().from(customers).where(eq(customers.userId, userId)).orderBy(desc(customers.createdAt));
  }
  async getCustomer(id, userId) {
    const [customer] = await db.select().from(customers).where(and(eq(customers.id, id), eq(customers.userId, userId)));
    return customer;
  }
  async createCustomer(customer) {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }
  async updateCustomer(id, customer, userId) {
    const [updatedCustomer] = await db.update(customers).set({ ...customer, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(customers.id, id), eq(customers.userId, userId))).returning();
    return updatedCustomer;
  }
  async deleteCustomer(id, userId) {
    await db.delete(customers).where(and(eq(customers.id, id), eq(customers.userId, userId)));
  }
  // Bill operations
  async getBills(userId) {
    return await db.select({
      id: bills.id,
      billNumber: bills.billNumber,
      customerId: bills.customerId,
      amount: bills.amount,
      status: bills.status,
      billDate: bills.billDate,
      dueDate: bills.dueDate,
      paidDate: bills.paidDate,
      userId: bills.userId,
      createdAt: bills.createdAt,
      updatedAt: bills.updatedAt,
      customerName: sql2`COALESCE(${customers.name}, 'Unknown')`
    }).from(bills).leftJoin(customers, eq(bills.customerId, customers.id)).where(eq(bills.userId, userId)).orderBy(desc(bills.createdAt));
  }
  async createBill(bill) {
    const [newBill] = await db.insert(bills).values(bill).returning();
    return newBill;
  }
  // Expense operations
  async getExpenses(userId) {
    return await db.select({
      id: expenses.id,
      expenseNumber: expenses.expenseNumber,
      description: expenses.description,
      category: expenses.category,
      amount: expenses.amount,
      expenseDate: expenses.expenseDate,
      employeeId: expenses.employeeId,
      userId: expenses.userId,
      createdAt: expenses.createdAt,
      employeeName: sql2`COALESCE(${employees.name}, 'Admin')`
    }).from(expenses).leftJoin(employees, eq(expenses.employeeId, employees.id)).where(eq(expenses.userId, userId)).orderBy(desc(expenses.createdAt));
  }
  async createExpense(expense) {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }
  // Employee operations
  async getEmployees(userId) {
    return await db.select().from(employees).where(eq(employees.userId, userId)).orderBy(desc(employees.createdAt));
  }
  async createEmployee(employee) {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }
  // Dashboard operations
  async getDashboardStats(userId) {
    const [collectionsResult] = await db.select({ total: sql2`COALESCE(SUM(${bills.amount}), 0)` }).from(bills).where(and(eq(bills.userId, userId), eq(bills.status, "paid")));
    const [expensesResult] = await db.select({ total: sql2`COALESCE(SUM(${expenses.amount}), 0)` }).from(expenses).where(eq(expenses.userId, userId));
    const [customersResult] = await db.select({ count: sql2`COUNT(*)` }).from(customers).where(eq(customers.userId, userId));
    const [pendingBillsResult] = await db.select({ count: sql2`COUNT(*)` }).from(bills).where(and(eq(bills.userId, userId), sql2`${bills.status} IN ('due', 'overdue')`));
    const customerStatusCounts = await db.select({
      status: customers.status,
      count: sql2`COUNT(*)`
    }).from(customers).where(eq(customers.userId, userId)).groupBy(customers.status);
    const statusCounts = { paid: 0, due: 0, overdue: 0 };
    customerStatusCounts.forEach(({ status, count }) => {
      if (status && status in statusCounts) {
        statusCounts[status] = parseInt(count);
      }
    });
    const [lastBillResult] = await db.select({
      customerName: customers.name,
      amount: bills.amount,
      billNumber: bills.billNumber
    }).from(bills).leftJoin(customers, eq(bills.customerId, customers.id)).where(and(eq(bills.userId, userId), eq(bills.status, "paid"))).orderBy(desc(bills.paidDate)).limit(1);
    return {
      totalCollections: parseFloat(collectionsResult.total || "0"),
      totalExpenses: parseFloat(expensesResult.total || "0"),
      activeCustomers: parseInt(customersResult.count || "0"),
      pendingBills: parseInt(pendingBillsResult.count || "0"),
      customerStatusCounts: statusCounts,
      lastCollectedBill: lastBillResult ? {
        customerName: lastBillResult.customerName || "Unknown",
        amount: parseFloat(lastBillResult.amount || "0"),
        billNumber: lastBillResult.billNumber || ""
      } : null
    };
  }
};
var storage = new DatabaseStorage();

// server/devAuth.ts
import session from "express-session";
var setupDevAuth = async (app2) => {
  app2.use(
    session({
      secret: process.env.SESSION_SECRET || "dev-secret",
      resave: false,
      saveUninitialized: false
    })
  );
  app2.use(async (req, res, next) => {
    if (!req.session.userId) {
      const devUser = await storage.upsertUser({
        id: "dev-user",
        firstName: "Development",
        lastName: "User",
        email: "dev@example.com"
      });
      req.session.userId = devUser.id;
    }
    next();
  });
  app2.use(async (req, res, next) => {
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  });
};
var requireAuth = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  await setupDevAuth(app2);
  app2.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/customers", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const customers2 = await storage.getCustomers(userId);
      res.json(customers2);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.post("/api/customers", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const customerData = insertCustomerSchema.parse({ ...req.body, userId });
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create customer" });
      }
    }
  });
  app2.put("/api/customers/:id", requireAuth, async (req, res) => {
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
  app2.delete("/api/customers/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/bills", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const bills2 = await storage.getBills(userId);
      res.json(bills2);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });
  app2.get("/api/expenses", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const expenses2 = await storage.getExpenses(userId);
      res.json(expenses2);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  app2.get("/api/employees", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const employees2 = await storage.getEmployees(userId);
      res.json(employees2);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    port: 5173,
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  let httpServer;
  try {
    console.log("Starting server setup...");
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });
    httpServer = await registerRoutes(app);
    console.log("Routes registered");
    if (process.env.NODE_ENV === "development") {
      console.log("Setting up Vite...");
      await setupVite(app, httpServer);
      console.log("Vite setup complete");
    } else {
      console.log("Setting up static server...");
      serveStatic(app);
      console.log("Static server setup complete");
    }
    httpServer.listen(3e3, () => {
      log(`serving on port 3000`);
    });
    process.on("SIGINT", () => {
      httpServer.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
