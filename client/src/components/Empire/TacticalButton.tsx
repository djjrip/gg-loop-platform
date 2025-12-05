import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TacticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'alert';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
}

export function TacticalButton({
    children,
    className,
    variant = 'primary',
    size = 'md',
    icon,
    ...props
}: TacticalButtonProps) {
    const baseStyles = "tactical-btn relative overflow-hidden group font-mono";

    const variants = {
        primary: "bg-empire-dim border-empire-green/50 text-empire-green hover:bg-empire-green/20",
        secondary: "bg-empire-slate border-empire-green/30 text-empire-green/70 hover:text-empire-green hover:border-empire-green",
        alert: "bg-empire-alert/10 border-empire-alert/50 text-empire-alert hover:bg-empire-alert/20"
    };

    const sizes = {
        sm: "px-3 py-1 text-xs",
        md: "px-6 py-2 text-sm",
        lg: "px-8 py-3 text-base"
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            <div className="flex items-center gap-2 relative z-10">
                {icon && <span className="group-hover:animate-pulse">{icon}</span>}
                {children}
            </div>
            {/* Hover reveal effect */}
            <div className="absolute inset-0 bg-empire-green/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
        </button>
    );
}
