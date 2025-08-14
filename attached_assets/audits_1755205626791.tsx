import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Code, 
  FileCode, 
  Upload, 
  Github, 
  GitlabIcon as Gitlab,
  Search,
  Users,
  Send
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Audits() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState<string>("");
  
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [accessToken, setAccessToken] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  // Check permissions
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.permissions?.includes("parse_contracts"))) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access audit tools.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: repositories } = useQuery({
    queryKey: ["/api/repositories"],
    enabled: !!user && user.permissions?.includes("parse_contracts"),
  });

  const { data: auditors } = useQuery({
    queryKey: ["/api/users/auditors"],
    enabled: !!user && user.permissions?.includes("manage_team"),
  });

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
      setShowRepoModal(false);
      setRepoUrl("");
      setAccessToken("");
      setBranch("main");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please login again.",
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

  const parseRepoMutation = useMutation({
    mutationFn: async (repoId: string) => {
      const response = await apiRequest("POST", `/api/repositories/${repoId}/parse`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Smart contracts parsed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/repositories"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to parse contracts",
        variant: "destructive",
      });
    },
  });

  const inviteAuditorMutation = useMutation({
    mutationFn: async ({ auditId, email, message }: {
      auditId: string;
      email: string;
      message: string;
    }) => {
      const response = await apiRequest("POST", "/api/audits/invite", {
        auditId,
        email,
        message,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invitation sent successfully!",
      });
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteMessage("");
      setSelectedAuditId("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const handleConnectRepo = () => {
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive",
      });
      return;
    }

    const provider = repoUrl.includes("github.com") ? "github" : "gitlab";
    const urlMatch = repoUrl.match(provider === "github" 
      ? /github\.com\/([^\/]+)\/([^\/]+)/ 
      : /gitlab\.com\/([^\/]+\/[^\/]+)/
    );

    if (!urlMatch) {
      toast({
        title: "Error",
        description: "Invalid repository URL format",
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

  const handleSendInvite = () => {
    if (!selectedAuditId || !inviteEmail) {
      toast({
        title: "Error",
        description: "Please select an audit and enter an email",
        variant: "destructive",
      });
      return;
    }

    inviteAuditorMutation.mutate({
      auditId: selectedAuditId,
      email: inviteEmail,
      message: inviteMessage,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !user.permissions?.includes("parse_contracts")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Search className="h-5 w-5 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Audit Management</h1>
          </div>
          <p className="text-slate-300">Parse smart contracts and manage security audits</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => setShowRepoModal(true)}
                  className="w-full bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900 font-medium"
                >
                  <Github className="h-4 w-4 mr-2" />
                  Connect Repository
                </Button>
                
                <Button 
                  onClick={() => setShowFileUpload(true)}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Contract File
                </Button>

                {user.permissions?.includes("manage_team") && (
                  <Button 
                    onClick={() => setShowInviteModal(true)}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Invite Auditor
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Connected Repositories */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Connected Repositories</CardTitle>
              </CardHeader>
              <CardContent>
                {repositories && repositories.length > 0 ? (
                  <div className="space-y-4">
                    {repositories.map((repo: any) => (
                      <div key={repo.id} className="bg-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {repo.provider === "github" ? (
                              <Github className="h-5 w-5 text-white" />
                            ) : (
                              <Gitlab className="h-5 w-5 text-orange-400" />
                            )}
                            <div>
                              <h3 className="font-medium text-white">{repo.name}</h3>
                              <p className="text-sm text-slate-400">
                                Branch: {repo.branch} • Last sync: {repo.lastSyncAt ? new Date(repo.lastSyncAt).toLocaleDateString() : "Never"}
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => parseRepoMutation.mutate(repo.id)}
                            disabled={parseRepoMutation.isPending}
                            size="sm"
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            <Code className="h-4 w-4 mr-2" />
                            {parseRepoMutation.isPending ? "Parsing..." : "Parse Contracts"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileCode className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">No repositories connected</p>
                    <Button 
                      onClick={() => setShowRepoModal(true)}
                      className="bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900"
                    >
                      Connect Your First Repository
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Repository Connection Modal */}
        <Dialog open={showRepoModal} onOpenChange={setShowRepoModal}>
          <DialogContent className="bg-slate-800 border-slate-600 text-white">
            <DialogHeader>
              <DialogTitle>Connect Repository</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Repository URL</Label>
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Branch</Label>
                <Input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Access Token (Optional)</Label>
                <Input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="For private repositories"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleConnectRepo}
                  disabled={connectRepoMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900"
                >
                  {connectRepoMutation.isPending ? "Connecting..." : "Connect"}
                </Button>
                <Button 
                  onClick={() => setShowRepoModal(false)}
                  variant="outline"
                  className="flex-1 border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invite Auditor Modal */}
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="bg-slate-800 border-slate-600 text-white">
            <DialogHeader>
              <DialogTitle>Invite Auditor to Collaborate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Auditor Email</Label>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="auditor@example.com"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Message (Optional)</Label>
                <Textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="I'd like you to help with this audit..."
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSendInvite}
                  disabled={inviteAuditorMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {inviteAuditorMutation.isPending ? "Sending..." : "Send Invite"}
                </Button>
                <Button 
                  onClick={() => setShowInviteModal(false)}
                  variant="outline"
                  className="flex-1 border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}