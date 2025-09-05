import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { UserManagement } from "@/components/admin/user-management";
import { RepositoryIntegration } from "@/components/admin/repository-integration";
import { RecentAudits } from "@/components/admin/recent-audits";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
    if (!isLoading && isAuthenticated && (user as { role?: string })?.role !== 'admin') {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading admin panel..." />
      </div>
    );
  }

  if (!isAuthenticated || !user || (user as { role?: string })?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        <Header 
          title="Admin Panel" 
          subtitle="Manage users, audits, and system settings" 
        />
        
        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <StatsGrid />

          {/* Repository Integration */}
          <RepositoryIntegration />

          {/* User Management and Recent Audits */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <UserManagement />
            <RecentAudits />
          </div>
        </div>
      </main>
    </div>
  );
}
