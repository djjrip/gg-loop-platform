import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

interface MaintenanceStatus {
    active: boolean;
    message: string;
    severity: "info" | "warning" | "error";
    estimatedEnd?: string;
}

export function MaintenanceBanner() {
    const { data: status } = useQuery<MaintenanceStatus>({
        queryKey: ["/api/maintenance/status"],
        refetchInterval: 30000, // Check every 30 seconds
    });

    if (!status?.active) return null;

    const severityColors = {
        info: "bg-blue-50 border-blue-200 text-blue-900",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
        error: "bg-red-50 border-red-200 text-red-900",
    };

    return (
        <Alert className={`${severityColors[status.severity]} mb-4`}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Platform Maintenance</AlertTitle>
            <AlertDescription>
                {status.message}
                {status.estimatedEnd && (
                    <span className="block mt-1 text-sm opacity-75">
                        Expected completion: {new Date(status.estimatedEnd).toLocaleString()}
                    </span>
                )}
            </AlertDescription>
        </Alert>
    );
}
