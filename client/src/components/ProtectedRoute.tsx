import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Route, Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    path: string;
    component: React.ComponentType<any>;
    adminOnly?: boolean;
}

export function ProtectedRoute({ path, component: Component, adminOnly = false }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    
    // Check admin status via separate endpoint
    const { data: adminCheck, isLoading: isCheckingAdmin } = useQuery<{ isAdmin: boolean }>({
        queryKey: ["/api/auth/is-admin"],
        enabled: isAuthenticated && !isLoading,
        retry: false,
    });

    const isAdmin = adminCheck?.isAdmin || false;

    if (isLoading || isCheckingAdmin) {
        return (
            <Route path={path} component={() => (
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )} />
        );
    }

    if (!isAuthenticated || !user) {
        return <Route path={path} component={() => <Redirect to="/login" />} />;
    }

    if (adminOnly && !isAdmin) {
        return <Route path={path} component={() => <Redirect to="/" />} />;
    }

    return <Route path={path} component={Component} />;
}
