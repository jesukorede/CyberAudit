import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        <Header 
          title="Dashboard" 
          subtitle="Welcome to your smart contract audit platform" 
        />
        
        <div className="p-8 space-y-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-gray-400">
              Here's an overview of your security audits and reports
            </p>
          </div>

          {/* Stats Grid */}
          <StatsGrid />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-cyber-dark-2 border border-cyber-cyan/20 rounded-xl p-6 hover:border-cyber-cyan/40 transition-colors cursor-pointer">
              <h3 className="font-semibold text-lg mb-2">Start New Audit</h3>
              <p className="text-gray-400 text-sm">Begin a comprehensive security audit for your smart contracts</p>
            </div>
            
            <div className="bg-cyber-dark-2 border border-cyber-cyan/20 rounded-xl p-6 hover:border-cyber-cyan/40 transition-colors cursor-pointer">
              <h3 className="font-semibold text-lg mb-2">View Reports</h3>
              <p className="text-gray-400 text-sm">Access detailed audit reports and vulnerability assessments</p>
            </div>
            
            <div className="bg-cyber-dark-2 border border-cyber-cyan/20 rounded-xl p-6 hover:border-cyber-cyan/40 transition-colors cursor-pointer">
              <h3 className="font-semibold text-lg mb-2">Manage Repositories</h3>
              <p className="text-gray-400 text-sm">Connect and monitor your GitHub/GitLab repositories</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
