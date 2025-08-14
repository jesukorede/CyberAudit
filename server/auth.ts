import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const ADMIN_EMAIL = "info.cyberchari@gmail.com";
const ADMIN_PASSWORD = "AdminDanOmo25";

export interface AuthService {
  authenticateAdmin(email: string, password: string): Promise<User | null>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  createUser(userData: { email: string; firstName?: string; lastName?: string; role?: string }): Promise<User>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}

class AuthServiceImpl implements AuthService {
  async authenticateAdmin(email: string, password: string): Promise<User | null> {
    // Check hardcoded admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Check if admin user exists in database
      let adminUser = await storage.getUserByEmail(email);
      
      if (!adminUser) {
        // Create admin user if doesn't exist
        const hashedPassword = await this.hashPassword(password);
        adminUser = await storage.createUser({
          email,
          passwordHash: hashedPassword,
          firstName: "Admin",
          lastName: "User",
          role: "admin",
          isActive: true
        });
      }
      
      // Update last login
      await storage.updateUser(adminUser.id, {
        lastLoginAt: new Date()
      });
      
      return adminUser;
    }
    
    return null;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await storage.getUserByEmail(email);
    
    if (!user || !user.passwordHash || !user.isActive) {
      return null;
    }
    
    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      return null;
    }
    
    // Update last login
    await storage.updateUser(user.id, {
      lastLoginAt: new Date()
    });
    
    return user;
  }

  async createUser(userData: { email: string; firstName?: string; lastName?: string; role?: string }): Promise<User> {
    const user = await storage.createUser({
      email: userData.email,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      role: (userData.role as any) || "viewer",
      isActive: true
    });
    
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

export const authService = new AuthServiceImpl();
