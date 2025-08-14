import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { FaGithub, FaGitlab } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentAudits() {
  const { data: audits, isLoading } = useQuery({
    queryKey: ["/api/audits"],
  });

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Recent Audits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "pending":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/50";
    }
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">Recent Audits</CardTitle>
          <Button 
            variant="ghost" 
            className="text-cyan-400 hover:text-green-400 text-sm font-medium"
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {audits && audits.length > 0 ? (
          audits.map((audit: any) => (
            <div 
              key={audit.id} 
              className="bg-slate-700 rounded-lg p-4 hover:bg-slate-700/80 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-white">
                      {audit.contractName || "Smart Contract Audit"}
                    </h3>
                    <Badge className={getStatusColor(audit.status)}>
                      {formatStatus(audit.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">
                    {audit.description || "Comprehensive security audit for smart contract"}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      {audit.provider === "github" ? (
                        <FaGithub className="h-3 w-3" />
                      ) : (
                        <FaGitlab className="h-3 w-3" />
                      )}
                      <span>{audit.repositoryName || "Unknown Repository"}</span>
                    </span>
                    <span>
                      Started {new Date(audit.createdAt).toLocaleDateString()}
                    </span>
                    {audit.progress && (
                      <span>{audit.progress}% Complete</span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-cyan-400 hover:text-green-400"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No audits found</p>
            <p className="text-sm text-slate-500">
              Start by connecting a repository and parsing smart contracts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
