import React from 'react';
import { cn } from "@/lib/utils";

interface HUDPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    variant?: 'default' | 'corners-bottom' | 'no-corners';
    scanned?: boolean;
}

export function HUDPanel({
    children,
    className,
    title,
    variant = 'default',
    scanned = false,
    ...props
}: HUDPanelProps) {
    return (
        <div
            className={cn(
                "hud-panel p-4 rounded-sm",
                variant === 'corners-bottom' && "hud-corners-bottom",
                scanned && "relative overflow-hidden before:absolute before:inset-0 before:bg-empire-green/5 before:animate-scanline before:z-0",
                className
            )}
            {...props}
        >
            {title && (
                <div className="flex items-center justify-between mb-4 border-b border-empire-green/30 pb-2">
                    <h3 className="text-empire-green tracking-widest uppercase text-sm font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-empire-green animate-pulse"></span>
                        {title}
                    </h3>
                    <span className="text-xs text-empire-green/50">SYS.READY</span>
                </div>
            )}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
