import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { CyberChariLogo } from "@/components/ui/cyberchari-logo";
import { Settings, LogOut, Users, Shield, Search, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-slate-800 border-b border-slate-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Company Name */}
          <div className="flex items-center space-x-3">
            <CyberChariLogo className="w-8 h-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent font-spaceage">
              CyberChari
            </h1>
          </div>

          {/* Navigation Based on Role */}
          <nav className="hidden md:flex space-x-6">
            {user.role === "admin" && (
              <>
                <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/admin" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
                <Link href="/audits" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <Search className="h-4 w-4" />
                  <span>Audits</span>
                </Link>
              </>
            )}
            {user.role === "auditor" && (
              <>
                <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <Search className="h-4 w-4" />
                  <span>Audits</span>
                </Link>
                <Link href="/dashboard" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Reports</span>
                </Link>
              </>
            )}
            {user.role === "viewer" && (
              <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-1">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <img 
                src={user.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=100&h=100&fit=crop&crop=face`} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-400"
              />
              <div className="text-sm">
                <p className="font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-cyan-400 text-xs capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-300 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}