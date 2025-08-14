import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsGrid() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-600">
            <CardContent className="p-6">
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <Search className="text-cyan-400 h-6 w-6" />
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

      <Card className="bg-slate-800 border-slate-600 hover:shadow-lg hover:shadow-red-400/10 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm">Critical Issues</p>
              <p className="text-2xl font-bold text-red-400">
                {stats?.criticalIssues || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-400 h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
