import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { RepositoryParser } from "@/components/dashboard/repository-parser";
import { RecentAudits } from "@/components/dashboard/recent-audits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bug, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/auth/google";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar />
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Welcome Section */}
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 text-white">
                      Welcome back, {user.firstName}!
                    </h1>
                    <p className="text-slate-300">Here's your audit dashboard overview</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Last login</p>
                    <p className="text-green-400 font-medium">2 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <StatsGrid />

            {/* Repository Parser Section */}
            <RepositoryParser />

            {/* Recent Audits */}
            <RecentAudits />

            {/* Audit Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vulnerability Scanner */}
              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Bug className="h-5 w-5 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Vulnerability Scanner</h3>
                  </div>
                  <p className="text-slate-300 text-sm mb-4">
                    Automated detection of common smart contract vulnerabilities
                  </p>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Run Vulnerability Scan
                  </Button>
                </CardContent>
              </Card>

              {/* Gas Analysis */}
              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Gas Optimization</h3>
                  </div>
                  <p className="text-slate-300 text-sm mb-4">
                    Analyze and optimize smart contract gas consumption
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Analyze Gas Usage
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
