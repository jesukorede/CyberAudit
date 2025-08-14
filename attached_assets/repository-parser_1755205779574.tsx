import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Code, FileCode } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export function RepositoryParser() {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: repositories } = useQuery({
    queryKey: ["/api/repositories"],
  });

  const { data: contracts, isLoading: contractsLoading } = useQuery({
    queryKey: ["/api/repositories", selectedRepoId, "contracts"],
    enabled: !!selectedRepoId,
  });

  const parseRepoMutation = useMutation({
    mutationFn: async (repoId: string) => {
      const response = await apiRequest("POST", `/api/repositories/${repoId}/parse`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Repository parsed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
      if (selectedRepoId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/repositories", selectedRepoId, "contracts"] 
        });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to parse repository",
        variant: "destructive",
      });
    },
  });

  const createRepoMutation = useMutation({
    mutationFn: async (repoData: { url: string; name: string; branch: string; provider: string }) => {
      const response = await apiRequest("POST", "/api/repositories", repoData);
      return response.json();
    },
    onSuccess: (newRepo) => {
      toast({
        title: "Success",
        description: "Repository connected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
      setSelectedRepoId(newRepo.id);
      setRepoUrl("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to connect repository",
        variant: "destructive",
      });
    },
  });

  const handleAddRepository = () => {
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive",
      });
      return;
    }

    const urlMatch = repoUrl.match(/(?:github\.com|gitlab\.com)\/([^\/]+)\/([^\/]+)/);
    if (!urlMatch) {
      toast({
        title: "Error",
        description: "Invalid repository URL format",
        variant: "destructive",
      });
      return;
    }

    const provider = repoUrl.includes("github.com") ? "github" : "gitlab";
    const repoName = `${urlMatch[1]}/${urlMatch[2]}`.replace(/\.git$/, "");

    createRepoMutation.mutate({
      url: repoUrl,
      name: repoName,
      branch,
      provider,
    });
  };

  const handleParseRepository = () => {
    if (!selectedRepoId) {
      toast({
        title: "Error",
        description: "Please select a repository first",
        variant: "destructive",
      });
      return;
    }
    parseRepoMutation.mutate(selectedRepoId);
  };

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          Smart Contract Repository Parser
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-300 mb-2">
                Repository URL
              </Label>
              <Input
                type="url"
                placeholder="https://github.com/username/repo or https://gitlab.com/username/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-300 mb-2">
                Branch
              </Label>
              <Input
                type="text"
                placeholder="main, master, develop..."
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAddRepository}
            disabled={createRepoMutation.isPending}
            className="bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900 font-medium hover:shadow-lg hover:shadow-cyan-400/25 transition-all duration-200"
          >
            <Code className="h-4 w-4 mr-2" />
            {createRepoMutation.isPending ? "Connecting..." : "Connect Repository"}
          </Button>
        </div>

        {/* Repository Selection */}
        {repositories && repositories.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-2">
              Select Repository to Parse
            </Label>
            <div className="space-y-2">
              {repositories.map((repo: any) => (
                <Button
                  key={repo.id}
                  variant={selectedRepoId === repo.id ? "default" : "outline"}
                  onClick={() => setSelectedRepoId(repo.id)}
                  className={`w-full justify-start ${
                    selectedRepoId === repo.id 
                      ? "bg-cyan-600 text-white" 
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {repo.name} ({repo.provider})
                </Button>
              ))}
            </div>
            
            {selectedRepoId && (
              <Button 
                onClick={handleParseRepository}
                disabled={parseRepoMutation.isPending}
                className="mt-4 bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900 font-medium"
              >
                {parseRepoMutation.isPending ? "Parsing..." : "Parse Smart Contracts"}
              </Button>
            )}
          </div>
        )}

        {/* Detected Smart Contracts */}
        {contracts && contracts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Detected Smart Contracts
            </h3>
            <div className="space-y-3">
              {contracts.map((contract: any) => (
                <div 
                  key={contract.id} 
                  className="bg-slate-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <FileCode className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="font-medium text-white">{contract.fileName}</p>
                      <p className="text-sm text-slate-400">{contract.filePath}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="text-green-400 hover:text-cyan-400 bg-transparent border border-green-400 hover:border-cyan-400"
                  >
                    Start Audit
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {contractsLoading && (
          <div className="text-center py-4">
            <p className="text-slate-400">Loading contracts...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
