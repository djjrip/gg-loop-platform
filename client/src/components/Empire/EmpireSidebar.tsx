import React from 'react';
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { X, Trophy, Gamepad2, Activity, Users, Settings } from "lucide-react";
import { TacticalButton } from "./TacticalButton";

interface EmpireSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EmpireSidebar({ isOpen, onClose }: EmpireSidebarProps) {
    const navItems = [
        { href: "/", label: "COMMAND CENTER", icon: Trophy },
        { href: "/#games", label: "ACTIVE OPERATIONS", icon: Gamepad2 },
        { href: "/stats", label: "PERFORMANCE STATS", icon: Activity },
        { href: "/referrals", label: "RECRUITMENT", icon: Users },
        { href: "/settings", label: "SYSTEM CONFIG", icon: Settings },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-empire-dark/80 backdrop-blur-sm z-50 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-80 bg-empire-dark border-l border-empire-green/30 z-50 transform transition-transform duration-300 ease-out shadow-[0_0_50px_rgba(0,255,65,0.1)]",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-empire-green/20 relative">
                    <span className="font-mono text-empire-green font-bold tracking-widest">
                        SYS.MENU
                    </span>
                    <button
                        onClick={onClose}
                        className="text-empire-green/70 hover:text-empire-green hover:rotate-90 transition-all duration-300"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-empire-green/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-6">
                    <div className="space-y-2">
                        <span className="text-[10px] text-empire-green/40 uppercase tracking-widest font-mono ml-2">Navigation</span>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className="flex items-center gap-4 p-3 rounded-sm border border-transparent hover:border-empire-green/30 hover:bg-empire-green/5 group transition-all duration-200"
                            >
                                <item.icon className="h-5 w-5 text-empire-green/60 group-hover:text-empire-green group-hover:drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]" />
                                <span className="font-mono text-sm text-empire-green/80 group-hover:text-empire-green font-bold tracking-wide">
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto border-t border-empire-green/20 pt-6">
                        <TacticalButton variant="alert" className="w-full justify-center" onClick={onClose}>
                            CLOSE TERMINAL
                        </TacticalButton>
                    </div>
                </div>

                {/* Decorative Grid Background */}
                <div className="absolute inset-0 pointer-events-none tactical-grid opacity-5 z-[-1]" />
            </div>
        </>
    );
}
