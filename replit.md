# CyberChari - Smart Contract Audit Platform

## Overview

CyberChari is a comprehensive smart contract audit platform that integrates with GitHub and GitLab repositories to provide automated vulnerability detection and security analysis for blockchain applications. The application enables users to connect their code repositories, parse smart contracts (Solidity and Vyper), conduct security audits, and generate detailed reports. It supports OAuth authentication through Google and Apple, with role-based access control for admins, auditors, and viewers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library providing a consistent cyber-themed design system
- **State Management**: TanStack Query (React Query) for server state management, caching, and API interactions
- **Routing**: Wouter for lightweight client-side routing with role-based route protection
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Design System**: Custom cyber aesthetic with cyan/green color scheme, Orbitron/Space Age fonts, and dark theme

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using TypeScript and ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store using connect-pg-simple
- **Authentication**: Passport.js with multiple strategies (Google OAuth, Apple OAuth, and local email/password)
- **API Design**: RESTful endpoints with TypeScript interfaces and error handling middleware

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting for scalability
- **Schema Management**: Drizzle migrations for version-controlled database changes
- **Key Tables**:
  - Users: Store user profiles, roles, and permissions
  - Sessions: Manage authentication sessions
  - Repositories: Track connected GitHub/GitLab repositories
  - Smart Contracts: Store parsed contract information and metadata
  - Audit Sessions: Manage audit processes and results
  - OAuth Accounts: Link external authentication providers

### Authentication & Authorization
- **Multi-Provider OAuth**: Google and Apple OAuth integration with fallback to email/password
- **Role-Based Access Control**: Three-tier system (admin, auditor, viewer) with granular permissions
- **Session Security**: HTTP-only cookies with secure flags and configurable TTL
- **Route Protection**: Client and server-side authentication checks with automatic redirects

### Repository Integration Services
- **GitHub Integration**: API service for repository validation, tree parsing, and file content retrieval
- **GitLab Integration**: Dedicated service for GitLab API interactions with similar functionality
- **Contract Parser**: Service layer for detecting and parsing Solidity (.sol) and Vyper (.vy) contracts
- **Access Token Management**: Secure storage and handling of private repository access tokens

## External Dependencies

### Cloud Services
- **Neon Database**: PostgreSQL hosting with serverless architecture
- **Replit Hosting**: Development and deployment platform with integrated tooling

### Authentication Providers
- **Google OAuth 2.0**: Primary authentication method for user sign-in
- **Apple Sign-In**: Secondary authentication option for iOS/macOS users

### Repository Services
- **GitHub API**: Integration for public and private repository access, file parsing, and validation
- **GitLab API**: Support for GitLab repositories with similar functionality to GitHub integration

### Frontend Libraries
- **Radix UI**: Comprehensive component primitives for accessible UI elements
- **Lucide React**: Icon library for consistent iconography
- **TanStack Query**: Advanced data fetching, caching, and synchronization
- **React Hook Form**: Performance-focused form management with validation

### Backend Dependencies
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **Passport.js**: Authentication middleware with strategy-based approach
- **Express Session**: Session management with PostgreSQL store persistence
- **Crypto Module**: Password hashing and security utilities for local authentication