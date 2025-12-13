import React from 'react';
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Trophy, Gamepad2, Activity, Users, DollarSign, Gift, TrendingUp, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/ChatGPT Image Nov 11, 2025, 06_17_23 PM_1763403383212.png";

export function MarketingNavigation() {
    const [location] = useLocation();
    const { user, isAuthenticated } = useAuth();

    const navItems = [
        { href: "/", label: "Home", icon: Trophy },
        { href: "/roadmap", label: "Roadmap", icon: TrendingUp },
        { href: "/shop", label: "Shop", icon: Gift },
        { href: "/referrals", label: "Referrals", icon: Users },
        { href: "/affiliate-program", label: "Affiliate", icon: DollarSign },
        { href: "/partners", label: "Partners", icon: Users }, // New link
    ];

    return (
        <div className="w-full bg-black/95 border-b border-brand-copper/20 backdrop-blur-md relative z-50">
            <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3 group">
                    <img src={logoImage} alt="GG LOOP" className="h-10 w-auto" />
                    <div className="flex flex-col">
                        <span className="font-bold text-2xl text-white tracking-tight leading-none">
                            GG LOOP
                        </span>
                    </div>
                </Link>

                {/* Main Nav */}
                <nav className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = location === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors rounded",
                                    isActive
                                        ? "text-brand-copper bg-brand-copper/10"
                                        : "text-gray-400 hover:text-brand-copper hover:bg-brand-copper/5"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="flex items-center gap-4">
                    {isAuthenticated && user && (
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded bg-brand-dark/80 border border-brand-copper/30 px-3 py-1">
                                <Trophy className="h-4 w-4 text-brand-copper" />
                                <span className="font-semibold text-brand-copper">{user.totalPoints?.toLocaleString() || '0'}</span>
                                <span className="text-xs text-gray-500">pts</span>
                            </div>
                        </div>
                    )}

                    {isAuthenticated && user ? (
                        <Link href={`/profile/${user.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-brand-copper/10 transition-colors">
                            <div className="h-7 w-7 rounded-full bg-brand-copper/20 flex items-center justify-center text-sm font-semibold text-brand-copper border border-brand-copper/40">
                                {user.firstName?.[0] || user.email?.[0] || "U"}
                            </div>
                            <span className="text-sm text-white hidden md:block">
                                {user.firstName || "User"}
                            </span>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <div className="px-4 py-2 border border-brand-copper bg-brand-copper/10 text-brand-copper font-medium text-sm rounded hover:bg-brand-copper hover:text-white transition-colors">
                                Sign In
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
