import { useAuth } from "@/hooks/useAuth";
import { Route, Redirect } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    path: string;
    component: React.ComponentType<any>;
    adminOnly?: boolean;
}

export function ProtectedRoute({ path, component: Component, adminOnly = false }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Route path={path} component={() => <Redirect to="/login" />} />;
    }

    if (adminOnly) {
        // @ts-ignore - isAdmin is added by the backend endpoint we just created
        if (!user.isAdmin) {
            return <Route path={path} component={() => <Redirect to="/" />} />;
        }
    }

    return <Route path={path} component={Component} />;
}
