import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { X } from "lucide-react";

interface RepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: "github" | "gitlab";
}

export function RepositoryModal({ isOpen, onClose, provider }: RepositoryModalProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [branch, setBranch] = useState("main");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectRepoMutation = useMutation({
    mutationFn: async (repoData: {
      url: string;
      name: string;
      provider: string;
      branch: string;
      accessToken?: string;
    }) => {
      const response = await apiRequest("POST", "/api/repositories", repoData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Repository connected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
      handleClose();
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

  const handleConnect = () => {
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive",
      });
      return;
    }

    const urlPattern = provider === "github" 
      ? /github\.com\/([^\/]+)\/([^\/]+)/
      : /gitlab\.com\/([^\/]+\/[^\/]+)/;
    
    const urlMatch = repoUrl.match(urlPattern);
    if (!urlMatch) {
      toast({
        title: "Error",
        description: `Invalid ${provider} URL format`,
        variant: "destructive",
      });
      return;
    }

    const repoName = provider === "github" 
      ? `${urlMatch[1]}/${urlMatch[2]}`.replace(/\.git$/, "")
      : urlMatch[1].replace(/\.git$/, "");

    connectRepoMutation.mutate({
      url: repoUrl,
      name: repoName,
      provider,
      branch,
      accessToken: accessToken || undefined,
    });
  };

  const handleClose = () => {
    setRepoUrl("");
    setAccessToken("");
    setBranch("main");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Connect {provider === "github" ? "GitHub" : "GitLab"} Repository
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-2">
              Repository URL
            </Label>
            <Input
              type="url"
              placeholder={`https://${provider}.com/username/repository`}
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
          
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-2">
              Access Token (Optional)
            </Label>
            <Input
              type="password"
              placeholder="For private repositories"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleConnect}
              disabled={connectRepoMutation.isPending}
              className="flex-1 bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900 font-medium hover:shadow-lg hover:shadow-cyan-400/25 transition-all duration-200"
            >
              {connectRepoMutation.isPending ? "Connecting..." : "Connect"}
            </Button>
            <Button 
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
