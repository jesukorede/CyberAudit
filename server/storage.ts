import { 
  users, repositories, audits, vulnerabilities, reports,
  type User, type InsertUser, 
  type Repository, type InsertRepository,
  type Audit, type InsertAudit,
  type Vulnerability, type InsertVulnerability,
  type Report, type InsertReport
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Repository operations
  getRepository(id: number): Promise<Repository | undefined>;
  getRepositoriesByOwner(ownerId: number): Promise<Repository[]>;
  createRepository(insertRepository: InsertRepository): Promise<Repository>;
  updateRepository(id: number, updates: Partial<InsertRepository>): Promise<Repository | undefined>;
  getAllRepositories(): Promise<Repository[]>;
  
  // Audit operations
  getAudit(id: number): Promise<Audit | undefined>;
  getAuditsByRepository(repositoryId: number): Promise<Audit[]>;
  getAuditsByAuditor(auditorId: number): Promise<Audit[]>;
  createAudit(insertAudit: InsertAudit): Promise<Audit>;
  updateAudit(id: number, updates: Partial<InsertAudit>): Promise<Audit | undefined>;
  getRecentAudits(limit?: number): Promise<Audit[]>;
  
  // Vulnerability operations
  getVulnerabilitiesByAudit(auditId: number): Promise<Vulnerability[]>;
  createVulnerability(insertVulnerability: InsertVulnerability): Promise<Vulnerability>;
  updateVulnerability(id: number, updates: Partial<InsertVulnerability>): Promise<Vulnerability | undefined>;
  
  // Report operations
  getReport(id: number): Promise<Report | undefined>;
  getReportsByAudit(auditId: number): Promise<Report[]>;
  createReport(insertReport: InsertReport): Promise<Report>;
  getAllReports(): Promise<Report[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalUsers: number;
    activeAudits: number;
    completedAudits: number;
    totalRepositories: number;
    criticalIssues: number;
    totalReports: number;
    certificates: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values([insertUser]).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getRepository(id: number): Promise<Repository | undefined> {
    const [repository] = await db.select().from(repositories).where(eq(repositories.id, id));
    return repository || undefined;
  }

  async getRepositoriesByOwner(ownerId: number): Promise<Repository[]> {
    return await db.select().from(repositories).where(eq(repositories.ownerId, ownerId));
  }

  async createRepository(insertRepository: InsertRepository): Promise<Repository> {
    const [repository] = await db.insert(repositories).values([insertRepository]).returning();
    return repository;
  }

  async updateRepository(id: number, updates: Partial<InsertRepository>): Promise<Repository | undefined> {
    const [repository] = await db.update(repositories).set(updates).where(eq(repositories.id, id)).returning();
    return repository || undefined;
  }

  async getAllRepositories(): Promise<Repository[]> {
    return await db.select().from(repositories).orderBy(desc(repositories.createdAt));
  }

  async getAudit(id: number): Promise<Audit | undefined> {
    const [audit] = await db.select().from(audits).where(eq(audits.id, id));
    return audit || undefined;
  }

  async getAuditsByRepository(repositoryId: number): Promise<Audit[]> {
    return await db.select().from(audits).where(eq(audits.repositoryId, repositoryId));
  }

  async getAuditsByAuditor(auditorId: number): Promise<Audit[]> {
    return await db.select().from(audits).where(eq(audits.auditorId, auditorId));
  }

  async createAudit(insertAudit: InsertAudit): Promise<Audit> {
    const [audit] = await db.insert(audits).values([insertAudit]).returning();
    return audit;
  }

  async updateAudit(id: number, updates: Partial<InsertAudit>): Promise<Audit | undefined> {
    const [audit] = await db.update(audits).set(updates).where(eq(audits.id, id)).returning();
    return audit || undefined;
  }

  async getRecentAudits(limit: number = 10): Promise<Audit[]> {
    return await db.select().from(audits).orderBy(desc(audits.createdAt)).limit(limit);
  }

  async getVulnerabilitiesByAudit(auditId: number): Promise<Vulnerability[]> {
    return await db.select().from(vulnerabilities).where(eq(vulnerabilities.auditId, auditId));
  }

  async createVulnerability(insertVulnerability: InsertVulnerability): Promise<Vulnerability> {
    const [vulnerability] = await db.insert(vulnerabilities).values([insertVulnerability]).returning();
    return vulnerability;
  }

  async updateVulnerability(id: number, updates: Partial<InsertVulnerability>): Promise<Vulnerability | undefined> {
    const [vulnerability] = await db.update(vulnerabilities).set(updates).where(eq(vulnerabilities.id, id)).returning();
    return vulnerability || undefined;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async getReportsByAudit(auditId: number): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.auditId, auditId));
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values([insertReport]).returning();
    return report;
  }

  async getAllReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async getDashboardStats() {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [activeAuditsResult] = await db.select({ count: count() }).from(audits).where(eq(audits.status, 'in_progress'));
    const [completedAuditsResult] = await db.select({ count: count() }).from(audits).where(eq(audits.status, 'completed'));
    const [totalRepositoriesResult] = await db.select({ count: count() }).from(repositories);
    const [criticalIssuesResult] = await db.select({ count: count() }).from(vulnerabilities).where(eq(vulnerabilities.severity, 'critical'));
    const [totalReportsResult] = await db.select({ count: count() }).from(reports);
    const [certificatesResult] = await db.select({ count: count() }).from(reports).where(eq(reports.certificateUrl, ''));

    return {
      totalUsers: totalUsersResult.count,
      activeAudits: activeAuditsResult.count,
      completedAudits: completedAuditsResult.count,
      totalRepositories: totalRepositoriesResult.count,
      criticalIssues: criticalIssuesResult.count,
      totalReports: totalReportsResult.count,
      certificates: certificatesResult.count
    };
  }
}

export const storage = new DatabaseStorage();
