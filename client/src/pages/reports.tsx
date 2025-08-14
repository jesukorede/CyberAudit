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
import { FileText, Download, Award, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports"],
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
        <LoadingSpinner size="lg" message="Loading reports..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getSeverityColor = (score: number) => {
    if (score >= 8) return "text-cyber-red";
    if (score >= 5) return "text-yellow-500";
    return "text-cyber-green";
  };

  const getSeverityText = (score: number) => {
    if (score >= 8) return "High Risk";
    if (score >= 5) return "Medium Risk";
    return "Low Risk";
  };

  return (
    <div className="min-h-screen bg-cyber-dark">
      <Sidebar />
      
      <main className="ml-64 min-h-screen">
        <Header 
          title="Reports" 
          subtitle="View audit reports and security certificates" 
        />
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Audit Reports</h2>
              <p className="text-gray-400">Detailed security analysis and findings</p>
            </div>
          </div>

          {reportsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }, (_, i) => (
                <Card key={i} className="bg-cyber-dark-2 border-cyber-cyan/20">
                  <CardContent className="p-6">
                    <Skeleton className="h-40 w-full bg-cyber-dark-3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report: any) => (
                <Card key={report.id} className="bg-cyber-dark-2 border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyber-cyan to-cyber-green rounded-lg flex items-center justify-center">
                          <FileText className="text-cyber-dark h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {report.title || "Security Audit Report"}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {report.audit?.contractName || "Smart Contract"}
                          </p>
                        </div>
                      </div>
                      {report.certificateUrl && (
                        <div className="flex items-center gap-1 text-cyber-green">
                          <Award className="h-4 w-4" />
                          <span className="text-xs">Certified</span>
                        </div>
                      )}
                    </div>

                    {report.summary && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {report.summary}
                      </p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Issues Found:</span>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-white font-semibold">
                            {report.issuesFound || 0}
                          </span>
                        </div>
                      </div>

                      {report.severityScore && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Risk Level:</span>
                          <Badge className={`bg-transparent border ${getSeverityColor(report.severityScore)} text-xs`}>
                            {getSeverityText(report.severityScore)}
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Generated:</span>
                        <span className="text-gray-300 text-sm">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 mt-4 border-t border-gray-600">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-cyber-cyan to-cyber-green text-cyber-dark hover:opacity-90"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {report.certificateUrl && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-cyber-dark"
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Certificate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No reports available</h3>
              <p className="text-gray-400 mb-6">Complete your first audit to generate security reports</p>
              <Button className="bg-gradient-to-r from-cyber-cyan to-cyber-green text-cyber-dark hover:opacity-90">
                Start First Audit
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
