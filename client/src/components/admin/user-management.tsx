import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { UserPlus, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function UserManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest(`/api/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-cyber-purple text-white";
      case "auditor":
        return "bg-cyber-blue text-white";
      case "viewer":
        return "bg-cyber-green text-cyber-dark";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-cyber-green text-cyber-dark" : "bg-gray-600 text-white";
  };

  const getUserInitials = (user: any) => {
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  };

  const formatLastActive = (lastLoginAt: string | null) => {
    if (!lastLoginAt) return "Never";
    const date = new Date(lastLoginAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <Card className="bg-cyber-dark-2 border-cyber-cyan/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-orbitron font-bold">User Management</CardTitle>
          <div className="flex gap-3">
            <select className="bg-cyber-dark border border-gray-600 rounded-lg px-3 py-2 text-sm">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Auditor</option>
              <option>Viewer</option>
            </select>
            <Button 
              className="bg-gradient-to-r from-cyber-cyan to-cyber-green text-cyber-dark hover:opacity-90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-cyber-dark-3" />
            ))}
          </div>
        ) : users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-400">User</TableHead>
                  <TableHead className="text-gray-400">Role</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Last Active</TableHead>
                  <TableHead className="text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id} className="border-gray-600 hover:bg-cyber-dark-3">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyber-cyan to-cyber-green rounded-full flex items-center justify-center">
                          <span className="text-cyber-dark font-semibold text-xs">
                            {getUserInitials(user)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleColor(user.role)} text-xs font-semibold`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(user.isActive)} text-xs font-semibold`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {formatLastActive(user.lastLoginAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-cyber-cyan hover:text-cyber-green hover:bg-cyber-dark-3"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-cyber-red hover:bg-cyber-dark-3"
                          onClick={() => deleteUserMutation.mutate(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
