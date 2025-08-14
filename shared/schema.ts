import { pgTable, text, integer, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'auditor', 'viewer']);
export const auditStatusEnum = pgEnum('audit_status', ['pending', 'in_progress', 'completed', 'failed']);
export const repositoryProviderEnum = pgEnum('repository_provider', ['github', 'gitlab']);
export const vulnerabilitySeverityEnum = pgEnum('vulnerability_severity', ['low', 'medium', 'high', 'critical']);

// Users table
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: userRoleEnum('role').default('viewer').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  googleId: text('google_id'),
  githubId: text('github_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Repositories table
export const repositories = pgTable('repositories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  provider: repositoryProviderEnum('provider').notNull(),
  url: text('url').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastScanAt: timestamp('last_scan_at'),
  contractsDetected: integer('contracts_detected').default(0),
  ownerId: integer('owner_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Audits table
export const audits = pgTable('audits', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  contractName: text('contract_name').notNull(),
  repositoryId: integer('repository_id').references(() => repositories.id),
  auditorId: integer('auditor_id').references(() => users.id),
  status: auditStatusEnum('status').default('pending').notNull(),
  progress: integer('progress').default(0),
  contractPath: text('contract_path'),
  contractCode: text('contract_code'),
  findings: jsonb('findings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at')
});

// Vulnerabilities table
export const vulnerabilities = pgTable('vulnerabilities', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  auditId: integer('audit_id').references(() => audits.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: vulnerabilitySeverityEnum('severity').notNull(),
  lineNumber: integer('line_number'),
  codeSnippet: text('code_snippet'),
  recommendation: text('recommendation'),
  isResolved: boolean('is_resolved').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Reports table
export const reports = pgTable('reports', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  auditId: integer('audit_id').references(() => audits.id).notNull(),
  title: text('title').notNull(),
  summary: text('summary'),
  issuesFound: integer('issues_found').default(0),
  severityScore: integer('severity_score'),
  certificateUrl: text('certificate_url'),
  reportData: jsonb('report_data'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  repositories: many(repositories),
  audits: many(audits)
}));

export const repositoriesRelations = relations(repositories, ({ one, many }) => ({
  owner: one(users, {
    fields: [repositories.ownerId],
    references: [users.id]
  }),
  audits: many(audits)
}));

export const auditsRelations = relations(audits, ({ one, many }) => ({
  repository: one(repositories, {
    fields: [audits.repositoryId],
    references: [repositories.id]
  }),
  auditor: one(users, {
    fields: [audits.auditorId],
    references: [users.id]
  }),
  vulnerabilities: many(vulnerabilities),
  reports: many(reports)
}));

export const vulnerabilitiesRelations = relations(vulnerabilities, ({ one }) => ({
  audit: one(audits, {
    fields: [vulnerabilities.auditId],
    references: [audits.id]
  })
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  audit: one(audits, {
    fields: [reports.auditId],
    references: [audits.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users, {
  role: z.enum(['admin', 'auditor', 'viewer']).default('viewer'),
  isActive: z.boolean().default(true)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertRepositorySchema = createInsertSchema(repositories, {
  provider: z.enum(['github', 'gitlab']),
  isActive: z.boolean().default(true),
  contractsDetected: z.number().default(0)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAuditSchema = createInsertSchema(audits, {
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
  progress: z.number().default(0)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities, {
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  isResolved: z.boolean().default(false)
}).omit({
  id: true,
  createdAt: true
});

export const insertReportSchema = createInsertSchema(reports, {
  issuesFound: z.number().default(0)
}).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Repository = typeof repositories.$inferSelect;
export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
