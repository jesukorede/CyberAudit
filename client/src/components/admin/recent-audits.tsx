import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentAudits() {
  const { data: audits, isLoading } = useQuery({
    queryKey: ["/api/audits/recent"],
  });

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-cyber-dark-2 border-cyber-cyan/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-orbitron font-bold">Recent Audits</CardTitle>
          <button className="text-cyber-cyan hover:text-cyber-green transition-colors flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-cyber-dark-3" />
            ))}
          </div>
        ) : Array.isArray(audits) && audits.length > 0 ? (
          <div className="space-y-4">
            {audits.map((audit: any) => (
              <div key={audit.id} className="bg-cyber-dark border border-gray-600 rounded-lg p-4 hover:border-cyber-cyan/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyber-cyan to-cyber-green rounded-lg flex items-center justify-center">
                      <Shield className="text-cyber-dark h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{audit.contractName || "Smart Contract Audit"}</h3>
                      <p className="text-sm text-gray-400">
                        {audit.repository?.fullName || "Unknown repository"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(audit.status)} text-xs font-semibold mb-1`}>
                      {getStatusText(audit.status)}
                    </Badge>
                    {audit.status === "in_progress" && audit.progress && (
                      <p className="text-xs text-gray-400">{audit.progress}% Complete</p>
                    )}
                    {audit.status === "completed" && (
                      <p className="text-xs text-gray-400">{formatDate(audit.completedAt || audit.updatedAt)}</p>
                    )}
                  </div>
                </div>
                
                {audit.status === "in_progress" && audit.progress && (
                  <div className="mt-4">
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

                {audit.status === "completed" && audit.vulnerabilities && (
                  <div className="mt-4 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-cyber-red rounded-full"></div>
                      <span className="text-gray-400">{audit.vulnerabilities.critical || 0} Critical</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-400">{audit.vulnerabilities.medium || 0} Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-cyber-cyan rounded-full"></div>
                      <span className="text-gray-400">{audit.vulnerabilities.low || 0} Low</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No recent audits available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
