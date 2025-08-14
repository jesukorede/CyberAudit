import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { contractParserService } from "./services/contractParser";
import { insertRepositorySchema, insertAuditSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Repository routes
  app.post('/api/repositories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const repoData = insertRepositorySchema.parse({
        ...req.body,
        userId,
      });

      // Validate repository URL
      const isValid = await contractParserService.validateRepository(
        repoData.url, 
        repoData.accessToken || undefined
      );

      if (!isValid) {
        return res.status(400).json({ message: "Invalid repository URL or access denied" });
      }

      const repository = await storage.createRepository(repoData);
      res.json(repository);
    } catch (error) {
      console.error("Error creating repository:", error);
      res.status(500).json({ message: "Failed to create repository" });
    }
  });

  app.get('/api/repositories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const repositories = await storage.getRepositoriesByUser(userId);
      res.json(repositories);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      res.status(500).json({ message: "Failed to fetch repositories" });
    }
  });

  // Repository parsing
  app.post('/api/repositories/:id/parse', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const repository = await storage.getRepository(id);
      
      if (!repository || repository.userId !== req.user.id) {
        return res.status(404).json({ message: "Repository not found" });
      }

      const parseResult = await contractParserService.parseRepository(
        repository.url,
        repository.branch,
        repository.accessToken || undefined
      );

      if (parseResult.error) {
        return res.status(400).json({ message: parseResult.error });
      }

      // Store parsed contracts
      const contracts = [];
      for (const contract of parseResult.contracts) {
        const storedContract = await storage.createSmartContract({
          repositoryId: repository.id,
          fileName: contract.fileName,
          filePath: contract.filePath,
          contractType: contract.type,
          content: contract.content,
          lastUpdated: new Date(),
        });
        contracts.push(storedContract);
      }

      // Update repository sync time
      await storage.updateRepository(repository.id, {
        lastSyncAt: new Date(),
      });

      res.json({ contracts });
    } catch (error) {
      console.error("Error parsing repository:", error);
      res.status(500).json({ message: "Failed to parse repository" });
    }
  });

  // Smart contract routes
  app.get('/api/repositories/:id/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const repository = await storage.getRepository(id);
      
      if (!repository || repository.userId !== req.user.id) {
        return res.status(404).json({ message: "Repository not found" });
      }

      const contracts = await storage.getContractsByRepository(id);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  // Audit routes
  app.post('/api/audits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const auditData = insertAuditSessionSchema.parse({
        ...req.body,
        auditorId: userId,
      });

      const audit = await storage.createAuditSession(auditData);
      res.json(audit);
    } catch (error) {
      console.error("Error creating audit:", error);
      res.status(500).json({ message: "Failed to create audit" });
    }
  });

  app.get('/api/audits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const audits = await storage.getAuditsByUser(userId);
      res.json(audits);
    } catch (error) {
      console.error("Error fetching audits:", error);
      res.status(500).json({ message: "Failed to fetch audits" });
    }
  });

  app.get('/api/audits/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const audits = await storage.getActiveAuditsByUser(userId);
      res.json(audits);
    } catch (error) {
      console.error("Error fetching active audits:", error);
      res.status(500).json({ message: "Failed to fetch active audits" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
