import { Request, Response, type Express } from "express";
import { storage } from "./storage";
import { authService } from "./auth";
import { insertUserSchema, insertRepositorySchema, insertAuditSchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

declare module "express-session" {
  interface SessionData {
    user?: any;
  }
}

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      // Try admin authentication first
      let user = await authService.authenticateAdmin(email, password);
      
      if (!user) {
        // Try regular user authentication
        user = await authService.authenticateUser(email, password);
      }
      
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid credentials' });
      }
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth strategy (if environment variables are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || "");
      
      if (!user) {
        user = await authService.createUser({
          email: profile.emails?.[0]?.value || "",
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          role: "viewer"
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

function requireAuth(req: Request, res: Response, next: any) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

function requireRole(role: string) {
  return (req: Request, res: Response, next: any) => {
    if (!req.user || (req.user as any).role !== role) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export function registerRoutes(app: Express) {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "cyber-chari-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication routes
  app.post("/api/auth/login", passport.authenticate('local'), (req, res) => {
    res.json({ user: req.user, message: "Login successful" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.json({ message: "Logout successful" });
      });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Google OAuth routes
  app.get("/api/auth/google", 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // User management routes
  app.get("/api/users", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, updates);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Repository routes
  app.get("/api/repositories", requireAuth, async (req, res) => {
    try {
      const repositories = await storage.getAllRepositories();
      res.json(repositories);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      res.status(500).json({ error: "Failed to fetch repositories" });
    }
  });

  app.post("/api/repositories", requireAuth, async (req, res) => {
    try {
      const repositoryData = insertRepositorySchema.parse(req.body);
      const repository = await storage.createRepository(repositoryData);
      res.json(repository);
    } catch (error) {
      console.error("Error creating repository:", error);
      res.status(500).json({ error: "Failed to create repository" });
    }
  });

  // Audit routes
  app.get("/api/audits", requireAuth, async (req, res) => {
    try {
      const audits = await storage.getRecentAudits(50);
      res.json(audits);
    } catch (error) {
      console.error("Error fetching audits:", error);
      res.status(500).json({ error: "Failed to fetch audits" });
    }
  });

  app.get("/api/audits/recent", requireAuth, async (req, res) => {
    try {
      const audits = await storage.getRecentAudits(10);
      res.json(audits);
    } catch (error) {
      console.error("Error fetching recent audits:", error);
      res.status(500).json({ error: "Failed to fetch recent audits" });
    }
  });

  app.post("/api/audits", requireAuth, async (req, res) => {
    try {
      const auditData = insertAuditSchema.parse(req.body);
      const audit = await storage.createAudit(auditData);
      res.json(audit);
    } catch (error) {
      console.error("Error creating audit:", error);
      res.status(500).json({ error: "Failed to create audit" });
    }
  });

  app.put("/api/audits/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertAuditSchema.partial().parse(req.body);
      const audit = await storage.updateAudit(id, updates);
      
      if (!audit) {
        return res.status(404).json({ error: "Audit not found" });
      }
      
      res.json(audit);
    } catch (error) {
      console.error("Error updating audit:", error);
      res.status(500).json({ error: "Failed to update audit" });
    }
  });

  // Report routes
  app.get("/api/reports", requireAuth, async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // Vulnerability routes
  app.get("/api/audits/:id/vulnerabilities", requireAuth, async (req, res) => {
    try {
      const auditId = parseInt(req.params.id);
      const vulnerabilities = await storage.getVulnerabilitiesByAudit(auditId);
      res.json(vulnerabilities);
    } catch (error) {
      console.error("Error fetching vulnerabilities:", error);
      res.status(500).json({ error: "Failed to fetch vulnerabilities" });
    }
  });
}
