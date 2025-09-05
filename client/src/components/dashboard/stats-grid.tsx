import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  GitBranch, 
  AlertTriangle,
  FileText,
  Award
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsGrid() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-cyber-dark-2 border-cyber-cyan/20">
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full bg-cyber-dark-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      bgGradient: "from-cyan-500 to-cyan-600",
      textColor: "text-cyan-400",
      iconColor: "text-cyan-400"
    },
    {
      title: "Active Audits", 
      value: stats?.activeAudits || 0,
      icon: Search,
      bgGradient: "from-green-500 to-green-600",
      textColor: "text-green-400",
      iconColor: "text-green-400"
    },
    {
      title: "Repositories",
      value: stats?.totalRepositories || 0,
      icon: GitBranch,
      bgGradient: "from-blue-500 to-blue-600",
      textColor: "text-blue-400",
      iconColor: "text-blue-400"
    },
    {
      title: "Vulnerabilities",
      value: stats?.criticalIssues || 0,
      icon: AlertTriangle,
      bgGradient: "from-red-500 to-red-600",
      textColor: "text-red-400",
      iconColor: "text-red-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-cyber-dark-2 border-cyber-cyan/20 hover:border-cyber-cyan/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.bgGradient} rounded-lg flex items-center justify-center opacity-20`}>
                  <Icon className={`${stat.iconColor} h-6 w-6`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
