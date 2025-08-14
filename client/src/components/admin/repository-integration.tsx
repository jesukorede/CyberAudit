import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, GitlabIcon as Gitlab, Plus } from "lucide-react";

export function RepositoryIntegration() {
  const { data: repositories, isLoading } = useQuery({
    queryKey: ["/api/repositories"],
  });

  const githubRepos = repositories?.filter((repo: any) => repo.provider === 'github') || [];
  const gitlabRepos = repositories?.filter((repo: any) => repo.provider === 'gitlab') || [];

  const getStatusColor = (isActive: boolean) => {
    if (isActive) return "bg-cyber-green text-cyber-dark";
    return "bg-yellow-500 text-cyber-dark";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Scanning";
  };

  return (
    <Card className="bg-cyber-dark-2 border-cyber-cyan/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-orbitron font-bold">Repository Integration</CardTitle>
          <Button className="bg-gradient-to-r from-cyber-cyan to-cyber-green text-cyber-dark hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add Repository
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GitHub Integration */}
          <div className="bg-cyber-dark border border-gray-600 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <Github className="text-2xl" />
              <h3 className="font-semibold">GitHub Integration</h3>
              <Badge className="bg-cyber-green text-cyber-dark text-xs font-semibold">
                Connected
              </Badge>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Automatically scan repositories for smart contracts
            </p>
            <div className="space-y-2">
              {githubRepos.length > 0 ? (
                githubRepos.map((repo: any) => (
                  <div key={repo.id} className="flex items-center justify-between p-2 bg-cyber-dark-3 rounded">
                    <span className="text-sm font-mono">{repo.fullName}</span>
                    <Badge className={`${getStatusColor(repo.isActive)} text-xs`}>
                      {getStatusText(repo.isActive)}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">
                  No GitHub repositories connected
                </div>
              )}
            </div>
          </div>

          {/* GitLab Integration */}
          <div className="bg-cyber-dark border border-gray-600 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <Gitlab className="text-2xl text-orange-500" />
              <h3 className="font-semibold">GitLab Integration</h3>
              <Badge className="bg-gray-600 text-white text-xs font-semibold">
                Setup Required
              </Badge>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Connect your GitLab instance for repository scanning
            </p>
            {gitlabRepos.length > 0 ? (
              <div className="space-y-2">
                {gitlabRepos.map((repo: any) => (
                  <div key={repo.id} className="flex items-center justify-between p-2 bg-cyber-dark-3 rounded">
                    <span className="text-sm font-mono">{repo.fullName}</span>
                    <Badge className={`${getStatusColor(repo.isActive)} text-xs`}>
                      {getStatusText(repo.isActive)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
                Configure GitLab
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
