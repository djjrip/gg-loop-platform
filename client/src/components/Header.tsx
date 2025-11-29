import { Trophy, Menu, LogOut, Moon, Sun, Sparkles, Rocket, Gamepad2, Settings as SettingsIcon, Users, CreditCard, Gift, Coins, BarChart3, Activity, Shield, Package, TrendingUp, DollarSign, Megaphone, Heart } from "lucide-react";
import logoImage from "@assets/ChatGPT Image Nov 11, 2025, 06_17_23 PM_1763403383212.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? false : true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: freeTierData } = useQuery<{ ggCoins: number; canRedeemTrial: boolean }>({
    queryKey: ["/api/free-tier/status"],
    enabled: isAuthenticated,
  });

  // Check if user has admin access
  const { data: adminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: isAuthenticated,
    retry: false,
  });

  const isAdmin = adminCheck?.isAdmin || false;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const navigate = (path: string) => {
    setLocation(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Animated gradient background bar */}
      <div className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 animate-pulse" />

      {/* Main header with glassmorphism */}
      <div className="relative border-b border-primary/20 backdrop-blur-xl bg-gradient-to-b from-background/95 via-background/90 to-background/85 shadow-[0_8px_32px_0_rgba(255,140,66,0.12)]">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />

        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 relative">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-300 hover:scale-105" data-testid="link-home">
              <div className="flex items-center gap-3 relative">
                {/* Logo glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <img src={logoImage} alt="GG LOOP Logo" className="h-10 w-auto relative z-10 drop-shadow-[0_0_8px_rgba(255,140,66,0.4)]" />
                </div>

                <span className="relative font-bold text-3xl tracking-tight bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text">
                  GG LOOP
                  {/* Subtle shine effect on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 bg-clip-text" />
                </span>
              </div>
            </Link>


            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/"
                className="group relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,140,66,0.3)] flex items-center gap-1.5"
                data-testid="link-home-nav"
              >
                <Trophy className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  Home
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
              <a href="/#games" className="group relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,140,66,0.3)] flex items-center gap-1.5" data-testid="link-games">
                <Gamepad2 className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  Games
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </span>
              </a>
              <Link
                href="/stats"
                className="group relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,140,66,0.3)] flex items-center gap-1.5"
                data-testid="link-stats"
              >
                <Activity className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  My Stats
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
              <Link
                href="/referrals"
                className="group relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,140,66,0.3)] flex items-center gap-1.5"
                data-testid="link-referrals"
              >
                <Users className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  Referrals
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
              <Link
                href="/affiliate-program"
                className="group relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,140,66,0.3)] flex items-center gap-1.5"
                data-testid="link-affiliate"
              >
                <DollarSign className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  Affiliate
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
              <a href="/#leaderboards" className="group relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,140,66,0.3)] flex items-center gap-1.5" data-testid="link-leaderboards">
                <BarChart3 className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  Leaderboards
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </span>
              </a>
              <Link
                href="/shop"
                className="group relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,140,66,0.3)] flex items-center gap-1.5"
                data-testid="link-shop"
              >
                <Gift className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  Shop
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
              <Link
                href="/creator-tools"
                className="group relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,140,66,0.3)] flex items-center gap-1.5"
                data-testid="link-creator-tools"
              >
                <Megaphone className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  Creator Tools
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
              <Link
                href="/gg-loop-cares"
                className="group relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,140,66,0.3)] flex items-center gap-1.5"
                data-testid="link-gg-loop-cares"
              >
                <Heart className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  GG Loop Cares
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
              <Link
                href="/about"
                className="group relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_16px_rgba(255,140,66,0.3)] flex items-center gap-1.5"
                data-testid="link-about"
              >
                <Trophy className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="relative">
                  About
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && user && (
              <div className="hidden md:flex items-center gap-3">
                {/* Points display with enhanced glow */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-accent/40 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                  <div className="relative flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 px-4 py-2 border-2 border-primary/40 backdrop-blur-sm">
                    <Trophy className="h-4 w-4 text-primary drop-shadow-[0_0_6px_rgba(255,140,66,0.8)]" />
                    <span className="font-mono text-sm font-bold text-primary drop-shadow-[0_0_4px_rgba(255,140,66,0.5)]" data-testid="text-points">{user.totalPoints.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground font-semibold">pts</span>
                  </div>
                </div>

                {/* GG Coins display with enhanced effects */}
                {freeTierData && freeTierData.ggCoins > 0 && (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-primary/30 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center gap-2 rounded-lg bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 px-4 py-2 border-2 border-accent/30 backdrop-blur-sm">
                      <Coins className="h-4 w-4 text-accent-foreground drop-shadow-[0_0_6px_rgba(255,200,100,0.6)]" />
                      <span className="font-mono text-sm font-bold drop-shadow-[0_0_4px_rgba(255,200,100,0.4)]" data-testid="text-gg-coins">{freeTierData.ggCoins.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground font-semibold">GG</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="button-mobile-menu">
              <Menu className="h-5 w-5" />
            </Button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-2" data-testid="button-profile">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {user.firstName?.[0] || user.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {user.firstName || user.email?.split("@")[0] || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.firstName || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-primary font-semibold">{user.totalPoints} points</p>
                      {freeTierData && freeTierData.ggCoins > 0 && (
                        <p className="text-xs text-accent-foreground font-semibold">{freeTierData.ggCoins} GG Coins</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href={`/profile/${user.id}`}>
                    <DropdownMenuItem data-testid="link-my-profile">
                      <Trophy className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/my-rewards">
                    <DropdownMenuItem data-testid="link-my-rewards">
                      <Gift className="mr-2 h-4 w-4" />
                      My Rewards
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/subscription">
                    <DropdownMenuItem data-testid="link-subscription">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscription
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem data-testid="link-settings">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                      {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5">
                          <Shield className="h-3 w-3" />
                          Admin Tools
                        </p>
                      </div>
                      <DropdownMenuItem onClick={() => navigate("/admin/daily-ops")} data-testid="link-daily-ops">
                        <Activity className="mr-2 h-4 w-4 text-primary" />
                        Daily Operations
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin/fulfillment")} data-testid="link-fulfillment">
                        <Package className="mr-2 h-4 w-4 text-primary" />
                        Fulfillment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin/rewards")} data-testid="link-rewards-management">
                        <Gift className="mr-2 h-4 w-4 text-primary" />
                        Manage Rewards
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/launch-dashboard")} data-testid="link-launch-dashboard">
                        <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                        Launch KPIs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="link-admin-dashboard">
                        <Shield className="mr-2 h-4 w-4 text-primary" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="relative group hidden md:flex">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                <Button
                  variant="default"
                  size="sm"
                  className="relative px-4 py-2 rounded-lg bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 border-2 border-primary/40 backdrop-blur-sm text-primary-foreground font-semibold hover:bg-primary/30 transition-colors duration-300"
                  onClick={handleLogin}
                  data-testid="button-sign-in"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col gap-2 p-4">
            <Link
              href="/"
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
              data-testid="link-home-mobile"
            >
              <Trophy className="h-3.5 w-3.5 text-primary" />
              Home
            </Link>
            <a href="/#games" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" data-testid="link-games-mobile">
              <Gamepad2 className="h-3.5 w-3.5 text-primary" />
              Games
            </a>
            <Link
              href="/stats"
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
              data-testid="link-stats-mobile"
            >
              <Activity className="h-3.5 w-3.5 text-primary" />
              My Stats
            </Link>
            <Link
              href="/referrals"
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
              data-testid="link-referrals-mobile"
            >
              <Users className="h-3.5 w-3.5 text-primary" />
              Referrals
            </Link>
            <Link
              href="/affiliate-program"
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
              data-testid="link-affiliate-mobile"
            >
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              Affiliate
            </Link>
            <a href="/#leaderboards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" data-testid="link-leaderboards-mobile">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              Leaderboards
            </a>
            <Link
              href="/shop"
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
              data-testid="link-shop-mobile"
            >
              <Gift className="h-3.5 w-3.5 text-primary" />
              Shop
            </Link>
            <Link
              href="/creator-tools"
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
              data-testid="link-creator-tools-mobile"
            >
              <Megaphone className="h-3.5 w-3.5 text-primary" />
              Creator Tools
            </Link>
            <Link
              href="/gg-loop-cares"
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
              data-testid="link-gg-loop-cares-mobile"
            >
              <Heart className="h-3.5 w-3.5 text-primary" />
              GG Loop Cares
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
              data-testid="link-about-mobile"
            >
              <Trophy className="h-3.5 w-3.5 text-primary" />
              About
            </Link>
            {isAuthenticated && user && user.isFounder && (
              <Link
                href="/launch-dashboard"
                className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
                data-testid="link-launch-dashboard-mobile"
              >
                <Rocket className="h-3.5 w-3.5 text-primary" />
                Launch
              </Link>
            )}
            {isAuthenticated && user ? (
              <>
                <div className="border-t my-2" />
                <Link
                  href={`/profile/${user.id}`}
                  className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
                  data-testid="link-profile-mobile"
                >
                  <Trophy className="h-3.5 w-3.5 text-primary" />
                  My Profile
                </Link>
                <Link
                  href="/my-rewards"
                  className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
                  data-testid="link-my-rewards-mobile"
                >
                  <Gift className="h-3.5 w-3.5 text-primary" />
                  My Rewards
                </Link>
                <Link
                  href="/settings"
                  className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5"
                  data-testid="link-settings-mobile"
                >
                  <SettingsIcon className="h-3.5 w-3.5 text-primary" />
                  Settings
                </Link>
                <div className="border-t my-2" />
                <Button variant="destructive" size="sm" onClick={handleLogout} data-testid="button-logout-mobile">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={handleLogin} data-testid="button-sign-in-mobile">
                Sign In
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
