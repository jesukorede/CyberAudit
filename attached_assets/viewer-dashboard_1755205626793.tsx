import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  CheckCircle, 
  AlertTriangle,
  FileText,
  Award,
  Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect unauthorized users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please sign in to access the dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  const { data: recentAudits, isLoading: auditsLoading } = useQuery({
    queryKey: ["/api/audits/recent"],
    enabled: !!user,
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports"],
    enabled: !!user,
  });

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-slate-300">
            Here's an overview of security audits and reports
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            Array.from({ length: 4 }, (_, i) => (
              <Card key={i} className="bg-slate-800 border-slate-600">
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="bg-slate-800 border-slate-600 hover:shadow-lg hover:shadow-cyan-400/10 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm">Active Audits</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {stats?.activeAudits || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-cyan-400 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600 hover:shadow-lg hover:shadow-green-400/10 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm">Completed</p>
                      <p className="text-2xl font-bold text-green-400">
                        {stats?.completedAudits || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-green-400 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600 hover:shadow-lg hover:shadow-yellow-400/10 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm">Reports</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {stats?.totalReports || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                      <FileText className="text-yellow-400 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-600 hover:shadow-lg hover:shadow-purple-400/10 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm">Certificates</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {stats?.certificates || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center">
                      <Award className="text-purple-400 h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Audits */}
          <Card className="bg-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Recent Audits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentAudits && recentAudits.length > 0 ? (
                <div className="space-y-4">
                  {recentAudits.map((audit: any) => (
                    <div key={audit.id} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">
                          {audit.contractName || "Smart Contract Audit"}
                        </h3>
                        <Badge className={getStatusColor(audit.status)}>
                          {audit.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(audit.createdAt).toLocaleDateString()}</span>
                        </span>
                        {audit.progress && (
                          <span>{audit.progress}% Complete</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No audits available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Reports & Certificates */}
          <Card className="bg-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Reports & Certificates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : reports && reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report: any) => (
                    <div key={report.id} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-2">
                            Security Audit Report
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-slate-300 mb-2">
                            <span>Issues Found: {report.issuesFound}</span>
                            {report.severityScore && (
                              <span>Severity: {report.severityScore}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            Generated: {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {report.certificateUrl && (
                            <div className="flex items-center space-x-1 text-green-400">
                              <Award className="h-4 w-4" />
                              <span className="text-xs">Certified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No reports available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Critical Issues Alert */}
        {stats?.criticalIssues > 0 && (
          <Card className="bg-red-900/20 border-red-600 mt-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400">
                    Critical Issues Detected
                  </h3>
                  <p className="text-slate-300">
                    {stats.criticalIssues} critical security issues require immediate attention. 
                    Contact your security team for resolution.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}