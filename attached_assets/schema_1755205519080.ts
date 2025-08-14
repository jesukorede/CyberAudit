import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"), // For email/password authentication
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("viewer"), // 'admin', 'auditor', 'viewer'
  permissions: text("permissions").array().default(sql`ARRAY['view_dashboard']`), // array of permissions
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Repository connections
export const repositories = pgTable("repositories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  url: varchar("url").notNull(),
  provider: varchar("provider").notNull(), // 'github' or 'gitlab'
  branch: varchar("branch").notNull().default("main"),
  accessToken: varchar("access_token"), // encrypted token for private repos
  isActive: boolean("is_active").notNull().default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Smart contracts detected in repositories
export const smartContracts = pgTable("smart_contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repositoryId: varchar("repository_id").notNull().references(() => repositories.id),
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(),
  contractType: varchar("contract_type").notNull(), // 'solidity' or 'vyper'
  content: text("content"), // contract source code
  lastUpdated: timestamp("last_updated"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit sessions
export const auditSessions = pgTable("audit_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => smartContracts.id),
  auditorId: varchar("auditor_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'failed'
  progress: varchar("progress").notNull().default("0"), // percentage as string
  findings: jsonb("findings"), // audit results and issues found
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OAuth providers
export const oauthAccounts = pgTable("oauth_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  provider: varchar("provider").notNull(), // 'google', 'apple', 'replit'
  providerAccountId: varchar("provider_account_id").notNull(),
  accessToken: varchar("access_token"),
  refreshToken: varchar("refresh_token"),
  expiresAt: timestamp("expires_at"),
  tokenType: varchar("token_type"),
  scope: varchar("scope"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit invitations for team collaboration
export const auditInvitations = pgTable("audit_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditSessionId: varchar("audit_session_id").notNull().references(() => auditSessions.id),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"), // 'pending', 'accepted', 'declined'
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit reports and certificates
export const auditReports = pgTable("audit_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditSessionId: varchar("audit_session_id").notNull().references(() => auditSessions.id),
  reportContent: text("report_content").notNull(),
  certificateUrl: varchar("certificate_url"),
  severityScore: varchar("severity_score"),
  issuesFound: varchar("issues_found").notNull().default("0"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertRepositorySchema = createInsertSchema(repositories);
export const insertSmartContractSchema = createInsertSchema(smartContracts);
export const insertAuditSessionSchema = createInsertSchema(auditSessions);
export const insertOAuthAccountSchema = createInsertSchema(oauthAccounts);
export const insertAuditInvitationSchema = createInsertSchema(auditInvitations);
export const insertAuditReportSchema = createInsertSchema(auditReports);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type Repository = typeof repositories.$inferSelect;
export type InsertSmartContract = z.infer<typeof insertSmartContractSchema>;
export type SmartContract = typeof smartContracts.$inferSelect;
export type InsertAuditSession = z.infer<typeof insertAuditSessionSchema>;
export type AuditSession = typeof auditSessions.$inferSelect;
export type InsertOAuthAccount = z.infer<typeof insertOAuthAccountSchema>;
export type OAuthAccount = typeof oauthAccounts.$inferSelect;
export type InsertAuditInvitation = z.infer<typeof insertAuditInvitationSchema>;
export type AuditInvitation = typeof auditInvitations.$inferSelect;
export type InsertAuditReport = z.infer<typeof insertAuditReportSchema>;
export type AuditReport = typeof auditReports.$inferSelect;
