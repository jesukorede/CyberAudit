import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, login, isLoginPending, loginError } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(email.trim(), password);
      toast({
        title: "Welcome!",
        description: "Successfully logged in to CyberChari.",
      });
      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOAuthLogin = (provider: string) => {
    // Redirect to OAuth endpoint
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyber-dark via-cyber-dark-2 to-cyber-dark-3 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyber-cyan opacity-5 rounded-full blur-3xl animate-pulse-cyber"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-cyber-green opacity-5 rounded-full blur-3xl animate-pulse-cyber" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-cyber-dark-2 border border-cyber-cyan/30 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyber-cyan to-cyber-green rounded-xl mb-4 animate-glow">
              <Shield className="text-2xl text-cyber-dark" />
            </div>
            <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-cyber-cyan to-cyber-green bg-clip-text text-transparent">
              CyberChari
            </h1>
            <p className="text-gray-400 mt-2">Smart Contract Audit Platform</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-colors placeholder-gray-500"
                  disabled={isLoginPending}
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-cyber-dark border border-gray-600 rounded-lg focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-colors placeholder-gray-500 pr-12"
                    disabled={isLoginPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    disabled={isLoginPending}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoginPending}
              className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-green text-cyber-dark font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity focus:ring-2 focus:ring-cyber-cyan focus:ring-offset-2 focus:ring-offset-cyber-dark-2 disabled:opacity-50"
            >
              {isLoginPending ? <LoadingSpinner size="sm" /> : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-sm text-gray-400">or continue with</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* OAuth Options */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center gap-3 bg-cyber-dark-3 border border-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={isLoginPending}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#ea4335" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Sign in with Google</span>
            </Button>
            
            <Button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="w-full flex items-center justify-center gap-3 bg-cyber-dark-3 border border-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={isLoginPending}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>Sign in with GitHub</span>
            </Button>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Protected by CyberChari Security</p>
          </div>
        </div>
      </div>
    </div>
  );
}
