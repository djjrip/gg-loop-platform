import React from 'react';
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: 'online' | 'offline' | 'warning' | 'busy';
    label?: string;
    className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
    const styles = {
        online: "bg-empire-green/10 text-empire-green border-empire-green/50",
        offline: "bg-gray-500/10 text-gray-500 border-gray-500/50",
        warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/50",
        busy: "bg-empire-alert/10 text-empire-alert border-empire-alert/50"
    };

    const indicators = {
        online: "bg-empire-green animate-pulse",
        offline: "bg-gray-500",
        warning: "bg-yellow-500 animate-pulse",
        busy: "bg-empire-alert animate-ping"
    };

    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-2 py-1 rounded-sm border text-xs font-mono uppercase tracking-wider",
            styles[status],
            className
        )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", indicators[status])} />
            {label || status}
        </div>
    );
}
