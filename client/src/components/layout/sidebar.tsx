import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  GitBranch, 
  Search, 
  FileText, 
  Users, 
  LogOut,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/repositories", label: "Repositories", icon: GitBranch },
  { path: "/audits", label: "Audits", icon: Search },
  { path: "/reports", label: "Reports", icon: FileText },
  { path: "/admin", label: "Admin Panel", icon: Users, roleRequired: "admin" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-cyber-dark-2 border-r border-cyber-cyan/20 z-30">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-cyber-cyan to-cyber-green rounded-lg flex items-center justify-center animate-glow">
            <Shield className="text-cyber-dark h-6 w-6" />
          </div>
          <span className="font-orbitron font-bold text-xl bg-gradient-to-r from-cyber-cyan to-cyber-green bg-clip-text text-transparent">
            CyberChari
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            // Check role requirements
            if (item.roleRequired && user?.role !== item.roleRequired) {
              return null;
            }

            return (
              <Link key={item.path} href={item.path}>
                <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                  isActive 
                    ? "text-cyber-cyan bg-cyber-dark-3" 
                    : "text-gray-300 hover:text-cyber-cyan hover:bg-cyber-dark-3"
                }`}>
                  <Icon className={`text-lg group-hover:text-cyber-cyan ${isActive ? 'text-cyber-cyan' : ''}`} />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-cyber-cyan/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyber-cyan to-cyber-green rounded-full flex items-center justify-center">
            <span className="text-cyber-dark font-semibold text-sm">
              {getUserInitials()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
