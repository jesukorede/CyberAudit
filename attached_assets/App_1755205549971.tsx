import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Audits from "@/pages/audits";
import ViewerDashboard from "@/pages/viewer-dashboard";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <>
          {/* Role-based routing */}
          {user?.role === "admin" ? (
            <>
              <Route path="/" component={Dashboard} />
              <Route path="/admin" component={Admin} />
              <Route path="/audits" component={Audits} />
              <Route path="/dashboard" component={ViewerDashboard} />
            </>
          ) : user?.role === "auditor" ? (
            <>
              <Route path="/" component={Audits} />
              <Route path="/audits" component={Audits} />
              <Route path="/dashboard" component={ViewerDashboard} />
            </>
          ) : (
            <>
              <Route path="/" component={ViewerDashboard} />
              <Route path="/dashboard" component={ViewerDashboard} />
            </>
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
