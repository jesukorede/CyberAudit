import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Shield, UserCheck, UserX } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role, permissions }: { 
      userId: string; 
      role: string; 
      permissions: string[] 
    }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}`, {
        role,
        permissions,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User permissions updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUserId("");
      setSelectedRole("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Session expired. Please login again.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/auth/google";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update user permissions",
        variant: "destructive",
      });
    },
  });

  const handleRoleUpdate = () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select a user and role",
        variant: "destructive",
      });
      return;
    }

    const permissions = getPermissionsByRole(selectedRole);
    updateUserRoleMutation.mutate({
      userId: selectedUserId,
      role: selectedRole,
      permissions,
    });
  };

  const getPermissionsByRole = (role: string): string[] => {
    switch (role) {
      case "admin":
        return ["view_dashboard", "manage_users", "parse_contracts", "create_audits", "manage_team"];
      case "auditor":
        return ["view_dashboard", "parse_contracts", "create_audits", "manage_team"];
      case "viewer":
        return ["view_dashboard"];
      default:
        return ["view_dashboard"];
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "auditor":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50";
      case "viewer":
        return "bg-slate-500/20 text-slate-400 border-slate-500/50";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/50";
    }
  };

  if (isLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-slate-300">Manage users, roles, and permissions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>Update User Role</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Select User
                  </label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {allUsers?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id} className="text-white">
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Assign Role
                  </label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="admin" className="text-white">Admin</SelectItem>
                      <SelectItem value="auditor" className="text-white">Auditor</SelectItem>
                      <SelectItem value="viewer" className="text-white">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleRoleUpdate}
                  disabled={updateUserRoleMutation.isPending}
                  className="w-full bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900 font-medium"
                >
                  {updateUserRoleMutation.isPending ? "Updating..." : "Update Role"}
                </Button>

                <div className="text-xs text-slate-400 space-y-1">
                  <p><strong>Admin:</strong> Full system access</p>
                  <p><strong>Auditor:</strong> Can parse contracts and create audits</p>
                  <p><strong>Viewer:</strong> Dashboard access only</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>System Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600">
                      <TableHead className="text-slate-300">User</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Role</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers?.map((userData: any) => (
                      <TableRow key={userData.id} className="border-slate-600">
                        <TableCell className="text-white">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={userData.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=100&h=100&fit=crop&crop=face`}
                              alt={`${userData.firstName} ${userData.lastName}`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span>{userData.firstName} {userData.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {userData.email}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(userData.role)}>
                            {userData.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {userData.isActive ? (
                            <div className="flex items-center space-x-1 text-green-400">
                              <UserCheck className="h-4 w-4" />
                              <span>Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-red-400">
                              <UserX className="h-4 w-4" />
                              <span>Inactive</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}