import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CyberChariLogo } from "@/components/ui/logo";
import { Shield, Code, GitBranch, Users } from "lucide-react";
import { FaGoogle, FaApple } from "react-icons/fa";

export default function Landing() {
  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  const handleAppleSignIn = () => {
    window.location.href = "/api/auth/apple";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-green-400/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <CyberChariLogo className="w-20 h-20" />
            </div>
            
            {/* Company Name */}
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              CyberChari
            </h1>
            
            {/* Tagline */}
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Advanced Smart Contract Audit Platform with GitHub/GitLab Integration
            </p>
            
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
              Secure your blockchain applications with our cutting-edge audit tools, 
              automated vulnerability detection, and seamless repository integration.
            </p>
            
            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button 
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center space-x-3 bg-white text-gray-800 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                <FaGoogle className="h-5 w-5" />
                <span>Sign in with Google</span>
              </Button>
              
              <Button 
                onClick={handleAppleSignIn}
                className="flex items-center justify-center space-x-3 bg-black text-white hover:bg-gray-900 px-8 py-4 text-lg"
              >
                <FaApple className="h-5 w-5" />
                <span>Sign in with Apple</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Comprehensive Smart Contract Security
            </h2>
            <p className="text-xl text-slate-300">
              Everything you need to secure your blockchain applications
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-slate-800 border-slate-600 hover:shadow-lg hover:shadow-cyan-400/10 transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Advanced Security Audits
                </h3>
                <p className="text-slate-300 text-sm">
                  Comprehensive vulnerability detection and security analysis
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-600 hover:shadow-lg hover:shadow-green-400/10 transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Smart Contract Parsing
                </h3>
                <p className="text-slate-300 text-sm">
                  Automatic detection and analysis of Solidity and Vyper contracts
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-600 hover:shadow-lg hover:shadow-blue-400/10 transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Repository Integration
                </h3>
                <p className="text-slate-300 text-sm">
                  Seamless GitHub and GitLab integration for continuous auditing
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-600 hover:shadow-lg hover:shadow-purple-400/10 transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Team Collaboration
                </h3>
                <p className="text-slate-300 text-sm">
                  Role-based access control for auditors and administrators
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <CyberChariLogo className="w-8 h-8" />
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              CyberChari
            </span>
          </div>
          <p className="text-slate-400">
            Securing the future of blockchain technology
          </p>
        </div>
      </footer>
    </div>
  );
}
