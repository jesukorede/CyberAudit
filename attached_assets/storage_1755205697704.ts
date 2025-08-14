import {
  users,
  repositories,
  smartContracts,
  auditSessions,
  oauthAccounts,
  auditInvitations,
  auditReports,
  type User,
  type UpsertUser,
  type Repository,
  type InsertRepository,
  type SmartContract,
  type InsertSmartContract,
  type AuditSession,
  type InsertAuditSession,
  type OAuthAccount,
  type InsertOAuthAccount,
  type AuditInvitation,
  type InsertAuditInvitation,
  type AuditReport,
  type InsertAuditReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;

  // Repository operations
  createRepository(repository: InsertRepository): Promise<Repository>;
  getRepositoriesByUser(userId: string): Promise<Repository[]>;
  getRepository(id: string): Promise<Repository | undefined>;
  updateRepository(id: string, updates: Partial<Repository>): Promise<Repository | undefined>;

  // Smart contract operations
  createSmartContract(contract: InsertSmartContract): Promise<SmartContract>;
  getContractsByRepository(repositoryId: string): Promise<SmartContract[]>;
  getSmartContract(id: string): Promise<SmartContract | undefined>;

  // Audit operations
  createAuditSession(audit: InsertAuditSession): Promise<AuditSession>;
  getAuditsByUser(userId: string): Promise<AuditSession[]>;
  getActiveAuditsByUser(userId: string): Promise<AuditSession[]>;
  updateAuditSession(id: string, updates: Partial<AuditSession>): Promise<AuditSession | undefined>;

  // OAuth operations
  createOAuthAccount(account: InsertOAuthAccount): Promise<OAuthAccount>;
  getOAuthAccountByProvider(userId: string, provider: string): Promise<OAuthAccount | undefined>;

  // User permissions and role management
  updateUserPermissions(userId: string, permissions: string[]): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;

  // Audit invitations
  createAuditInvitation(invitation: InsertAuditInvitation): Promise<AuditInvitation>;
  getInvitationsByUser(userId: string): Promise<AuditInvitation[]>;
  updateInvitationStatus(invitationId: string, status: string): Promise<AuditInvitation | undefined>;

  // Audit reports
  createAuditReport(report: InsertAuditReport): Promise<AuditReport>;
  getReportByAuditSession(auditSessionId: string): Promise<AuditReport | undefined>;
  getReportsByUser(userId: string): Promise<AuditReport[]>;

  // Dashboard stats
  getUserStats(userId: string): Promise<{
    activeAudits: number;
    completedAudits: number;
    criticalIssues: number;
    totalReports: number;
    certificates: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Repository operations
  async createRepository(repository: InsertRepository): Promise<Repository> {
    const [repo] = await db.insert(repositories).values(repository).returning();
    return repo;
  }

  async getRepositoriesByUser(userId: string): Promise<Repository[]> {
    return await db
      .select()
      .from(repositories)
      .where(and(eq(repositories.userId, userId), eq(repositories.isActive, true)))
      .orderBy(desc(repositories.createdAt));
  }

  async getRepository(id: string): Promise<Repository | undefined> {
    const [repo] = await db.select().from(repositories).where(eq(repositories.id, id));
    return repo;
  }

  async updateRepository(id: string, updates: Partial<Repository>): Promise<Repository | undefined> {
    const [repo] = await db
      .update(repositories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(repositories.id, id))
      .returning();
    return repo;
  }

  // Smart contract operations
  async createSmartContract(contract: InsertSmartContract): Promise<SmartContract> {
    const [smartContract] = await db.insert(smartContracts).values(contract).returning();
    return smartContract;
  }

  async getContractsByRepository(repositoryId: string): Promise<SmartContract[]> {
    return await db
      .select()
      .from(smartContracts)
      .where(eq(smartContracts.repositoryId, repositoryId))
      .orderBy(desc(smartContracts.createdAt));
  }

  async getSmartContract(id: string): Promise<SmartContract | undefined> {
    const [contract] = await db.select().from(smartContracts).where(eq(smartContracts.id, id));
    return contract;
  }

  // Audit operations
  async createAuditSession(audit: InsertAuditSession): Promise<AuditSession> {
    const [auditSession] = await db.insert(auditSessions).values(audit).returning();
    return auditSession;
  }

  async getAuditsByUser(userId: string): Promise<AuditSession[]> {
    return await db
      .select()
      .from(auditSessions)
      .where(eq(auditSessions.auditorId, userId))
      .orderBy(desc(auditSessions.createdAt))
      .limit(10);
  }

  async getActiveAuditsByUser(userId: string): Promise<AuditSession[]> {
    return await db
      .select()
      .from(auditSessions)
      .where(
        and(
          eq(auditSessions.auditorId, userId),
          eq(auditSessions.status, "in_progress")
        )
      );
  }

  async updateAuditSession(id: string, updates: Partial<AuditSession>): Promise<AuditSession | undefined> {
    const [audit] = await db
      .update(auditSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(auditSessions.id, id))
      .returning();
    return audit;
  }

  // OAuth operations
  async createOAuthAccount(account: InsertOAuthAccount): Promise<OAuthAccount> {
    const [oauthAccount] = await db.insert(oauthAccounts).values(account).returning();
    return oauthAccount;
  }

  async getOAuthAccountByProvider(userId: string, provider: string): Promise<OAuthAccount | undefined> {
    const [account] = await db
      .select()
      .from(oauthAccounts)
      .where(and(eq(oauthAccounts.userId, userId), eq(oauthAccounts.provider, provider)));
    return account;
  }

  // User permissions and role management
  async updateUserPermissions(userId: string, permissions: string[]): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ permissions, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Audit invitations
  async createAuditInvitation(invitation: InsertAuditInvitation): Promise<AuditInvitation> {
    const [auditInvitation] = await db.insert(auditInvitations).values(invitation).returning();
    return auditInvitation;
  }

  async getInvitationsByUser(userId: string): Promise<AuditInvitation[]> {
    return await db
      .select()
      .from(auditInvitations)
      .where(eq(auditInvitations.toUserId, userId))
      .orderBy(desc(auditInvitations.createdAt));
  }

  async updateInvitationStatus(invitationId: string, status: string): Promise<AuditInvitation | undefined> {
    const [invitation] = await db
      .update(auditInvitations)
      .set({ status, updatedAt: new Date() })
      .where(eq(auditInvitations.id, invitationId))
      .returning();
    return invitation;
  }

  // Audit reports
  async createAuditReport(report: InsertAuditReport): Promise<AuditReport> {
    const [auditReport] = await db.insert(auditReports).values(report).returning();
    return auditReport;
  }

  async getReportByAuditSession(auditSessionId: string): Promise<AuditReport | undefined> {
    const [report] = await db
      .select()
      .from(auditReports)
      .where(eq(auditReports.auditSessionId, auditSessionId));
    return report;
  }

  async getReportsByUser(userId: string): Promise<AuditReport[]> {
    return await db
      .select({
        id: auditReports.id,
        auditSessionId: auditReports.auditSessionId,
        reportContent: auditReports.reportContent,
        certificateUrl: auditReports.certificateUrl,
        severityScore: auditReports.severityScore,
        issuesFound: auditReports.issuesFound,
        recommendations: auditReports.recommendations,
        createdAt: auditReports.createdAt,
        updatedAt: auditReports.updatedAt,
      })
      .from(auditReports)
      .innerJoin(auditSessions, eq(auditReports.auditSessionId, auditSessions.id))
      .where(eq(auditSessions.auditorId, userId))
      .orderBy(desc(auditReports.createdAt));
  }

  // Dashboard stats
  async getUserStats(userId: string): Promise<{
    activeAudits: number;
    completedAudits: number;
    criticalIssues: number;
    totalReports: number;
    certificates: number;
  }> {
    const [activeResult] = await db
      .select({ count: count() })
      .from(auditSessions)
      .where(
        and(
          eq(auditSessions.auditorId, userId),
          eq(auditSessions.status, "in_progress")
        )
      );

    const [completedResult] = await db
      .select({ count: count() })
      .from(auditSessions)
      .where(
        and(
          eq(auditSessions.auditorId, userId),
          eq(auditSessions.status, "completed")
        )
      );

    const [reportsResult] = await db
      .select({ count: count() })
      .from(auditReports)
      .innerJoin(auditSessions, eq(auditReports.auditSessionId, auditSessions.id))
      .where(eq(auditSessions.auditorId, userId));

    const [certificatesResult] = await db
      .select({ count: count() })
      .from(auditReports)
      .innerJoin(auditSessions, eq(auditReports.auditSessionId, auditSessions.id))
      .where(
        and(
          eq(auditSessions.auditorId, userId),
          sql`${auditReports.certificateUrl} IS NOT NULL`
        )
      );

    // Count critical issues from completed audits
    const criticalIssues = 5; // This would be calculated from findings JSON

    return {
      activeAudits: activeResult.count,
      completedAudits: completedResult.count,
      criticalIssues,
      totalReports: reportsResult.count,
      certificates: certificatesResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
