import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RepositoryModal } from "@/components/modals/repository-modal";
import { 
  BarChart3, 
  Search, 
  GitBranch, 
  FileText, 
  Users, 
  Github, 
  GitlabIcon as Gitlab
} from "lucide-react";
import { FaGoogle, FaApple } from "react-icons/fa";

export function Sidebar() {
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [repoProvider, setRepoProvider] = useState<"github" | "gitlab">("github");

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  const handleAppleSignIn = () => {
    window.location.href = "/api/auth/apple";
  };

  const openRepoModal = (provider: "github" | "gitlab") => {
    setRepoProvider(provider);
    setShowRepoModal(true);
  };

  return (
    <>
      <div className="lg:col-span-1">
        <Card className="bg-slate-800 border-slate-600">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-6 text-white">Quick Actions</h2>
            
            {/* OAuth Sign-in Section */}
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Authentication</h3>
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full bg-white text-gray-800 hover:bg-gray-100 flex items-center justify-center space-x-2"
              >
                <FaGoogle className="h-4 w-4" />
                <span className="font-medium">Sign in with Google</span>
              </Button>
              <Button 
                onClick={handleAppleSignIn}
                className="w-full bg-black text-white hover:bg-gray-900 flex items-center justify-center space-x-2"
              >
                <FaApple className="h-4 w-4" />
                <span className="font-medium">Sign in with iCloud</span>
              </Button>
            </div>

            {/* Repository Integration */}
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Repository Integration</h3>
              <Button 
                onClick={() => openRepoModal("github")}
                className="w-full bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900 font-medium hover:shadow-lg hover:shadow-cyan-400/25 transition-all duration-200"
              >
                <Github className="h-4 w-4 mr-2" />
                Connect GitHub
              </Button>
              <Button 
                onClick={() => openRepoModal("gitlab")}
                className="w-full bg-orange-600 text-white font-medium hover:bg-orange-700"
              >
                <Gitlab className="h-4 w-4 mr-2" />
                Connect GitLab
              </Button>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              <Link href="/">
                <a className="flex items-center space-x-3 text-cyan-400 bg-slate-700 rounded-lg px-3 py-2 w-full">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </a>
              </Link>
              <Link href="/audits">
                <a className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors w-full">
                  <Search className="h-4 w-4" />
                  <span>Active Audits</span>
                </a>
              </Link>
              <Link href="/repositories">
                <a className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors w-full">
                  <GitBranch className="h-4 w-4" />
                  <span>Repositories</span>
                </a>
              </Link>
              <Link href="/reports">
                <a className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors w-full">
                  <FileText className="h-4 w-4" />
                  <span>Reports</span>
                </a>
              </Link>
              <Link href="/team">
                <a className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors w-full">
                  <Users className="h-4 w-4" />
                  <span>Team</span>
                </a>
              </Link>
            </nav>
          </CardContent>
        </Card>
      </div>

      <RepositoryModal
        isOpen={showRepoModal}
        onClose={() => setShowRepoModal(false)}
        provider={repoProvider}
      />
    </>
  );
}
