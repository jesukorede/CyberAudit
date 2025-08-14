import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CyberChariLogo } from "@/components/ui/cyberchari-logo";
import { Shield, Code, GitBranch, Users, Mail, Lock, User } from "lucide-react";
import { FaGoogle, FaApple } from "react-icons/fa";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export default function Login() {
  const { user, isLoading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginForm) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (credentials: SignupForm) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Welcome to CyberChari!",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again with different credentials",
        variant: "destructive",
      });
    },
  });

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/google";
  };

  const handleAppleSignIn = () => {
    window.location.href = "/api/auth/apple";
  };

  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onSignupSubmit = (data: SignupForm) => {
    signupMutation.mutate(data);
  };

  // Redirect if already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-green-400/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Branding */}
            <div className="text-center lg:text-left">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start mb-8">
                <CyberChariLogo className="w-20 h-20" />
              </div>
              
              {/* Company Name with Space Age Font */}
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent font-spaceage">
                CyberChari
              </h1>
              
              {/* Tagline */}
              <p className="text-xl text-slate-300 mb-6">
                Advanced Smart Contract Audit Platform
              </p>
              
              <p className="text-lg text-slate-400 mb-8">
                Secure your blockchain applications with cutting-edge audit tools, 
                automated vulnerability detection, and seamless repository integration.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  <span>Advanced Security</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Code className="h-5 w-5 text-green-400" />
                  <span>Smart Contract Analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GitBranch className="h-5 w-5 text-cyan-400" />
                  <span>Git Integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-400" />
                  <span>Team Collaboration</span>
                </div>
              </div>
            </div>
            
            {/* Right Column - Auth Forms */}
            <div className="max-w-md mx-auto w-full">
              <Card className="bg-slate-800 border-slate-600">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      {isSignup ? "Create your account" : "Sign in to your account"}
                    </h2>
                    <p className="text-slate-400">
                      {isSignup ? "Join the future of smart contract security" : "Welcome back to CyberChari"}
                    </p>
                  </div>
                  
                  {/* OAuth Buttons */}
                  <div className="space-y-3 mb-6">
                    <Button 
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center space-x-3 bg-white text-gray-800 hover:bg-gray-100 px-6 py-3"
                      disabled={loginMutation.isPending || signupMutation.isPending}
                    >
                      <FaGoogle className="h-4 w-4" />
                      <span>{isSignup ? "Sign up" : "Sign in"} with Google</span>
                    </Button>
                    
                    <Button 
                      onClick={handleAppleSignIn}
                      className="w-full flex items-center justify-center space-x-3 bg-black text-white hover:bg-gray-900 px-6 py-3"
                      disabled={loginMutation.isPending || signupMutation.isPending}
                    >
                      <FaApple className="h-4 w-4" />
                      <span>{isSignup ? "Sign up" : "Sign in"} with Apple</span>
                    </Button>
                  </div>
                  
                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-800 text-slate-400">or continue with email</span>
                    </div>
                  </div>
                  
                  {/* Login Form */}
                  {!isSignup && (
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <Input
                            {...loginForm.register("email")}
                            type="email"
                            placeholder="Email address"
                            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-red-400 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <Input
                            {...loginForm.register("password")}
                            type="password"
                            placeholder="Password"
                            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                          />
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-red-400 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white py-3"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign in"}
                      </Button>
                    </form>
                  )}
                  
                  {/* Signup Form */}
                  {isSignup && (
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                              {...signupForm.register("firstName")}
                              placeholder="First name"
                              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                            />
                          </div>
                          {signupForm.formState.errors.firstName && (
                            <p className="text-red-400 text-sm mt-1">{signupForm.formState.errors.firstName.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <Input
                              {...signupForm.register("lastName")}
                              placeholder="Last name"
                              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                            />
                          </div>
                          {signupForm.formState.errors.lastName && (
                            <p className="text-red-400 text-sm mt-1">{signupForm.formState.errors.lastName.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <Input
                            {...signupForm.register("email")}
                            type="email"
                            placeholder="Email address"
                            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                          />
                        </div>
                        {signupForm.formState.errors.email && (
                          <p className="text-red-400 text-sm mt-1">{signupForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <Input
                            {...signupForm.register("password")}
                            type="password"
                            placeholder="Password (min. 6 characters)"
                            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                          />
                        </div>
                        {signupForm.formState.errors.password && (
                          <p className="text-red-400 text-sm mt-1">{signupForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white py-3"
                        disabled={signupMutation.isPending}
                      >
                        {signupMutation.isPending ? "Creating account..." : "Create account"}
                      </Button>
                    </form>
                  )}
                  
                  {/* Toggle Form */}
                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={() => setIsSignup(!isSignup)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}