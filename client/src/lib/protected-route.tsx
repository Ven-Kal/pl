import { useAuth } from "@/hooks/use-auth";
import { useAadhaarVerification } from "@/hooks/use-aadhaar-verification";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requireAdmin?: boolean;
  requireAadhaarVerified?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  requireAdmin = false,
  requireAadhaarVerified = false,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const {
    data,
    isLoading: isVerifying,
    error,
  } = useAadhaarVerification();

  return (
    <Route path={path}>
      {isLoading || (requireAadhaarVerified && isVerifying) ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      ) : !user ? (
        <Redirect to="/auth" />
      ) : requireAdmin && !user.isAdmin ? (
        <Redirect to="/" />
      ) : requireAadhaarVerified && data?.status !== "verified" ? (
        <Redirect to="/verify-aadhaar" />
      ) : (
        <Component />
      )}
    </Route>
  );
}
