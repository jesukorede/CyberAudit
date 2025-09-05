import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Shield, Calendar, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Audits() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: audits, isLoading: auditsLoading } = useQuery({
    queryKey: ["/api/audits"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading audits..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-cyber-green text-cyber-dark";
      case "in_progress":
        return "bg-yellow-500 text-cyber-dark";
      case "pending":
        return "bg-cyber-blue text-white";
      case "failed":
        return "bg-cyber-red text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getStatusText = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        <Header 
          title="Audits" 
          subtitle="Manage and monitor smart contract security audits" 
        />
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">All Audits</h2>
              <p className="text-gray-400">Track the progress of security audits</p>
            </div>
            <Button className="bg-gradient-to-r from-cyber-cyan to-cyber-green text-cyber-dark hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              New Audit
            </Button>
          </div>

          {auditsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="bg-cyber-dark-2 border-cyber-cyan/20">
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-full bg-cyber-dark-3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : Array.isArray(audits) && audits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(audits as any[]).map((audit: any) => (
                <Card key={audit.id} className="bg-cyber-dark-2 border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyber-cyan to-cyber-green rounded-lg flex items-center justify-center">
                          <Shield className="text-cyber-dark h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {audit.contractName || "Smart Contract"}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {audit.repository?.fullName || "Unknown repository"}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(audit.status)} text-xs font-semibold`}>
                        {getStatusText(audit.status)}
                      </Badge>
                    </div>

                    {audit.status === "in_progress" && audit.progress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{audit.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyber-cyan to-cyber-green h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${audit.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(audit.createdAt).toLocaleDateString()}</span>
                      </div>
                      {audit.auditor && (
                        <span>by {audit.auditor.firstName} {audit.auditor.lastName}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No audits found</h3>
              <p className="text-gray-400 mb-6">Start your first security audit to get started</p>
              <Button className="bg-gradient-to-r from-cyber-cyan to-cyber-green text-cyber-dark hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Create First Audit
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
