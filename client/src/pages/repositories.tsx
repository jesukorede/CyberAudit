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
import { GitBranch, Github, Gitlab, Plus, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Repositories() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: repositories, isLoading: repositoriesLoading } = useQuery({
    queryKey: ["/api/repositories"],
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
        <LoadingSpinner size="lg" message="Loading repositories..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "github":
        return <Github className="h-5 w-5" />;
      case "gitlab":
        return <Gitlab className="h-5 w-5 text-orange-500" />;
      default:
        return <GitBranch className="h-5 w-5" />;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-cyber-green text-cyber-dark" : "bg-gray-600 text-white";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        <Header 
          title="Repositories" 
          subtitle="Connect and manage your source code repositories" 
        />
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Connected Repositories</h2>
              <p className="text-gray-400">Monitor repositories for smart contract changes</p>
            </div>
            <Button className="bg-gradient-to-r from-cyber-cyan to-cyber-green text-cyber-dark hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Connect Repository
            </Button>
          </div>

          {repositoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="bg-cyber-dark-2 border-cyber-cyan/20">
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full bg-cyber-dark-3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : repositories && Array.isArray(repositories) && repositories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(repositories as any[]).map((repo: any) => (
                <Card key={repo.id} className="bg-cyber-dark-2 border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyber-dark-3 rounded-lg flex items-center justify-center">
                          {getProviderIcon(repo.provider)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white font-mono text-sm">
                            {repo.name}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {repo.fullName}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(repo.isActive)} text-xs font-semibold`}>
                        {getStatusText(repo.isActive)}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Contracts Detected:</span>
                        <span className="text-cyber-cyan font-semibold">
                          {repo.contractsDetected || 0}
                        </span>
                      </div>

                      {repo.lastScanAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Last Scan:</span>
                          <span className="text-gray-300">
                            {new Date(repo.lastScanAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 border-cyber-cyan/30 hover:border-cyber-cyan"
                        >
                          Scan Now
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-gray-400 hover:text-cyber-cyan"
                          onClick={() => window.open(repo.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GitBranch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No repositories connected</h3>
              <p className="text-gray-400 mb-6">Connect your GitHub or GitLab repositories to start monitoring smart contracts</p>
              <Button className="bg-gradient-to-r from-cyber-cyan to-cyber-green text-cyber-dark hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Connect First Repository
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
