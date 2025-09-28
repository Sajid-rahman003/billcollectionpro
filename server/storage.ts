import {
  users,
  customers,
  bills,
  expenses,
  employees,
  type User,
  type UpsertUser,
  type Customer,
  type InsertCustomer,
  type Bill,
  type InsertBill,
  type Expense,
  type InsertExpense,
  type Employee,
  type InsertEmployee,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;

  // Customer operations
  getCustomers(userId: string): Promise<Customer[]>;
  getCustomer(id: string, userId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>, userId: string): Promise<Customer>;
  deleteCustomer(id: string, userId: string): Promise<void>;

  // Bill operations
  getBills(userId: string): Promise<(Bill & { customerName: string })[]>;
  createBill(bill: InsertBill): Promise<Bill>;

  // Expense operations
  getExpenses(userId: string): Promise<(Expense & { employeeName: string })[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;

  // Employee operations
  getEmployees(userId: string): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;

  // Dashboard operations
  getDashboardStats(userId: string): Promise<{
    totalCollections: number;
    totalExpenses: number;
    activeCustomers: number;
    pendingBills: number;
    customerStatusCounts: { paid: number; due: number; overdue: number };
    lastCollectedBill: { customerName: string; amount: number; billNumber: string } | null;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Customer operations
  async getCustomers(userId: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.userId, userId))
      .orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string, userId: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.userId, userId)));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>, userId: string): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.userId, userId)))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string, userId: string): Promise<void> {
    await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.userId, userId)));
  }

  // Bill operations
  async getBills(userId: string): Promise<(Bill & { customerName: string })[]> {
    return await db
      .select({
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
        customerName: sql<string>`COALESCE(${customers.name}, 'Unknown')`,
      })
      .from(bills)
      .leftJoin(customers, eq(bills.customerId, customers.id))
      .where(eq(bills.userId, userId))
      .orderBy(desc(bills.createdAt));
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db
      .insert(bills)
      .values(bill)
      .returning();
    return newBill;
  }

  // Expense operations
  async getExpenses(userId: string): Promise<(Expense & { employeeName: string })[]> {
    return await db
      .select({
        id: expenses.id,
        expenseNumber: expenses.expenseNumber,
        description: expenses.description,
        category: expenses.category,
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        employeeId: expenses.employeeId,
        userId: expenses.userId,
        createdAt: expenses.createdAt,
        employeeName: sql<string>`COALESCE(${employees.name}, 'Admin')`,
      })
      .from(expenses)
      .leftJoin(employees, eq(expenses.employeeId, employees.id))
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.createdAt));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values(expense)
      .returning();
    return newExpense;
  }

  // Employee operations
  async getEmployees(userId: string): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(eq(employees.userId, userId))
      .orderBy(desc(employees.createdAt));
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db
      .insert(employees)
      .values(employee)
      .returning();
    return newEmployee;
  }

  // Dashboard operations
  async getDashboardStats(userId: string): Promise<{
    totalCollections: number;
    totalExpenses: number;
    activeCustomers: number;
    pendingBills: number;
    customerStatusCounts: { paid: number; due: number; overdue: number };
    lastCollectedBill: { customerName: string; amount: number; billNumber: string } | null;
  }> {
    // Get total collections from paid bills
    const [collectionsResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(${bills.amount}), 0)` })
      .from(bills)
      .where(and(eq(bills.userId, userId), eq(bills.status, "paid")));

    // Get total expenses
    const [expensesResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses)
      .where(eq(expenses.userId, userId));

    // Get active customers count
    const [customersResult] = await db
      .select({ count: sql<string>`COUNT(*)` })
      .from(customers)
      .where(eq(customers.userId, userId));

    // Get pending bills count
    const [pendingBillsResult] = await db
      .select({ count: sql<string>`COUNT(*)` })
      .from(bills)
      .where(and(eq(bills.userId, userId), sql`${bills.status} IN ('due', 'overdue')`));

    // Get customer status counts
    const customerStatusCounts = await db
      .select({
        status: customers.status,
        count: sql<string>`COUNT(*)`,
      })
      .from(customers)
      .where(eq(customers.userId, userId))
      .groupBy(customers.status);

    const statusCounts = { paid: 0, due: 0, overdue: 0 };
    customerStatusCounts.forEach(({ status, count }) => {
      if (status && status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts] = parseInt(count);
      }
    });

    // Get last collected bill
    const [lastBillResult] = await db
      .select({
        customerName: customers.name,
        amount: bills.amount,
        billNumber: bills.billNumber,
      })
      .from(bills)
      .leftJoin(customers, eq(bills.customerId, customers.id))
      .where(and(eq(bills.userId, userId), eq(bills.status, "paid")))
      .orderBy(desc(bills.paidDate))
      .limit(1);

    return {
      totalCollections: parseFloat(collectionsResult.total || "0"),
      totalExpenses: parseFloat(expensesResult.total || "0"),
      activeCustomers: parseInt(customersResult.count || "0"),
      pendingBills: parseInt(pendingBillsResult.count || "0"),
      customerStatusCounts: statusCounts,
      lastCollectedBill: lastBillResult ? {
        customerName: lastBillResult.customerName || "Unknown",
        amount: parseFloat(lastBillResult.amount || "0"),
        billNumber: lastBillResult.billNumber || "",
      } : null,
    };
  }
}

export const storage = new DatabaseStorage();
