import React from 'react';
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Trophy, Gamepad2, Activity, Users, DollarSign, Gift, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@assets/ChatGPT Image Nov 11, 2025, 06_17_23 PM_1763403383212.png";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { href: "/", label: "Home", icon: Trophy },
    { href: "/roadmap", label: "Roadmap", icon: Gamepad2 },
    { href: "/stats", label: "My Stats", icon: Activity },
    { href: "/referrals", label: "Referrals", icon: Users },
    { href: "/affiliate-program", label: "Affiliate", icon: DollarSign },
    { href: "/shop", label: "Shop", icon: Gift },
    { href: "/aws-roadmap", label: "AWS Partnership", icon: Briefcase },
  ];

  return (
    <div className="w-full bg-ggloop-black/95 border-b border-ggloop-orange/20 backdrop-blur-md relative z-50 sticky top-0">
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-ggloop-orange/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img src={logoImage} alt="GG LOOP" className="h-10 w-auto relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl text-white tracking-tight leading-none">
              GG LOOP
            </span>
            <span className="text-[10px] text-ggloop-rose-gold tracking-[0.2em] leading-none uppercase">
              Gaming Rewards
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
                  "px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-all duration-300 rounded",
                  isActive
                    ? "text-ggloop-orange bg-ggloop-orange/10 border-b-2 border-ggloop-orange"
                    : "text-gray-400 hover:text-ggloop-orange hover:bg-ggloop-orange/5"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-ggloop-orange" : "text-gray-500 group-hover:text-ggloop-orange")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-ggloop-dark-shadow/80 border border-ggloop-orange/30 px-3 py-1.5">
                <Trophy className="h-4 w-4 text-ggloop-orange" />
                <span className="font-semibold text-ggloop-orange">{user.totalPoints?.toLocaleString() || '0'}</span>
                <span className="text-xs text-gray-500">pts</span>
              </div>
            </div>
          )}

          {isAuthenticated && user ? (
            <Link href={`/profile/${user.id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-ggloop-orange/10 transition-colors border border-transparent hover:border-ggloop-orange/30">
              <div className="h-8 w-8 rounded-full bg-ggloop-orange/20 flex items-center justify-center text-sm font-bold text-ggloop-orange border border-ggloop-orange/40">
                {user.firstName?.[0] || user.email?.[0] || "U"}
              </div>
              <span className="text-sm text-white hidden md:block font-medium">
                {user.firstName || "User"}
              </span>
            </Link>
          ) : (
            <Link href="/login">
              <div className="px-5 py-2 border-2 border-ggloop-orange bg-ggloop-orange/10 text-ggloop-orange font-bold text-sm rounded-lg hover:bg-ggloop-orange hover:text-white transition-all duration-300">
                SIGN IN
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
