import React from 'react';
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Trophy, Gamepad2, Activity, Users, DollarSign, BarChart3, Gift, Rocket, Map } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/ChatGPT Image Nov 11, 2025, 06_17_23 PM_1763403383212.png";

export function EmpireNavigation() {
    const [location] = useLocation();
    const { user, isAuthenticated } = useAuth();

    const navItems = [
        { href: "/", label: "CMD CENTER", icon: Trophy, id: "link-home" },
        { href: "/roadmap", label: "ROADMAP", icon: Map, id: "link-roadmap" },
        { href: "/#games", label: "OPERATIONS", icon: Gamepad2, id: "link-games" },
        { href: "/stats", label: "MY STATS", icon: Activity, id: "link-stats" },
        { href: "/referrals", label: "RECRUIT", icon: Users, id: "link-referrals" },
        { href: "/affiliate-program", label: "AFFILIATE", icon: DollarSign, id: "link-affiliate" },
        { href: "/#leaderboards", label: "RANKINGS", icon: BarChart3, id: "link-leaderboards" },
        { href: "/shop", label: "ARMORY", icon: Gift, id: "link-shop" },
    ];

    return (
        <div className="w-full bg-empire-dark/95 border-b border-empire-green/30 backdrop-blur-md relative overflow-hidden z-50">
            {/* Scanline decoration */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0" />

            <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between relative z-10">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-empire-green/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img src={logoImage} alt="GG LOOP" className="h-10 w-auto relative z-10" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-mono font-bold text-2xl text-empire-green tracking-tighter leading-none predator-text glow-text">
                            GG LOOP
                        </span>
                        <span className="text-[10px] text-empire-green/60 tracking-[0.2em] font-mono leading-none">
                            EMPIRE SYSTEMS
                        </span>
                    </div>
                </Link>

                {/* Tactical Nav */}
                <nav className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = location === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-3 py-2 flex items-center gap-2 text-xs font-mono font-bold tracking-wider transition-all duration-300 relative group",
                                    isActive
                                        ? "text-empire-green bg-empire-green/10 border-b-2 border-empire-green"
                                        : "text-empire-green/60 hover:text-empire-green hover:bg-empire-green/5"
                                )}
                                data-testid={item.id}
                            >
                                <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-empire-green" : "text-empire-green/50 group-hover:text-empire-green")} />
                                {item.label}
                                {/* Hover decorative corners */}
                                <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-empire-green/0 group-hover:border-empire-green/50 transition-colors" />
                                <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-empire-green/0 group-hover:border-empire-green/50 transition-colors" />
                                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-empire-green/0 group-hover:border-empire-green/50 transition-colors" />
                                <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-empire-green/0 group-hover:border-empire-green/50 transition-colors" />
                            </Link>
                        );
                    })}
                </nav>

                {/* Status Indicators / User Profile */}
                <div className="flex items-center gap-4">
                    {/* System Status - Decorative */}
                    <div className="hidden md:flex flex-col items-end mr-4 border-r border-empire-green/20 pr-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-empire-green animate-pulse" />
                            <span className="text-[10px] text-empire-green/80 font-mono tracking-widest">ONLINE</span>
                        </div>
                        <span className="text-[9px] text-empire-green/40 font-mono">SYS.VER.2.0.4</span>
                    </div>

                    {/* User Actions Section */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated && user && (
                            <div className="hidden md:flex items-center gap-3">
                                {/* Points display */}
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-empire-green/20 to-empire-green/10 rounded-sm blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative flex items-center gap-2 rounded-sm bg-empire-dark/80 border border-empire-green/30 px-3 py-1.5 backdrop-blur-sm">
                                        <Trophy className="h-3.5 w-3.5 text-empire-green" />
                                        <span className="font-mono text-sm font-bold text-empire-green">{user.totalPoints.toLocaleString()}</span>
                                        <span className="text-[10px] text-empire-green/60 font-mono">PTS</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isAuthenticated && user ? (
                            // User Dropdown
                            <div className="relative flex items-center gap-2">
                                <Link href={`/profile/${user.id}`} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm border border-transparent hover:border-empire-green/30 hover:bg-empire-green/5 transition-all group">
                                    <div className="h-6 w-6 rounded-full bg-empire-green/20 flex items-center justify-center text-xs font-mono text-empire-green border border-empire-green/40">
                                        {user.firstName?.[0] || user.email?.[0] || "U"}
                                    </div>
                                    <span className="text-xs font-mono text-empire-green/80 group-hover:text-empire-green">
                                        {user.firstName || "OPERATOR"}
                                    </span>
                                </Link>

                                {/* Mobile Menu Trigger for Sidebar */}
                                <button
                                    onClick={() => document.dispatchEvent(new CustomEvent('toggle-empire-sidebar'))}
                                    className="lg:hidden p-2 text-empire-green/70 hover:text-empire-green"
                                >
                                    <Rocket className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <div className="relative group overflow-hidden rounded-sm">
                                    <div className="absolute inset-0 bg-empire-green/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <div className="relative px-4 py-2 border border-empire-green/50 text-empire-green font-mono text-xs font-bold tracking-widest hover:text-empire-dark hover:bg-empire-green transition-colors">
                                        INITIALIZE_LOGIN
                                    </div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
