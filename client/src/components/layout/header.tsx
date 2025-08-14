import { Search, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-cyber-dark-2 border-b border-cyber-cyan/20 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-orbitron font-bold">{title}</h1>
          {subtitle && (
            <p className="text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..."
              className="w-64 px-4 py-2 bg-cyber-dark border border-gray-600 rounded-lg focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-colors placeholder-gray-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-cyber-cyan transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-red rounded-full"></span>
          </button>
          
          {/* User info */}
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-300">{user.firstName} {user.lastName}</span>
              <span className="px-2 py-1 bg-cyber-cyan text-cyber-dark text-xs font-semibold rounded">
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
