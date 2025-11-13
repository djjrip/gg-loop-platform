import { Trophy, Menu, LogOut, Moon, Sun, Sparkles, Rocket, Gamepad2, Settings as SettingsIcon, Users, CreditCard, Gift, Coins, BarChart3, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Link } from "wouter";
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

  const { data: freeTierData } = useQuery<{ ggCoins: number; canRedeemTrial: boolean }>({
    queryKey: ["/api/free-tier/status"],
    enabled: isAuthenticated,
  });

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

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/99 backdrop-blur supports-[backdrop-filter]:bg-background/95 shadow-[0_1px_0_0_rgba(255,140,66,0.1)]">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md" data-testid="link-home">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <span className="font-bold text-3xl tracking-tight">GG LOOP</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" 
              data-testid="link-home-nav"
            >
              <Trophy className="h-3.5 w-3.5 text-primary" />
              Home
            </Link>
            <a href="#games" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" data-testid="link-games">
              <Gamepad2 className="h-3.5 w-3.5 text-primary" />
              Games
            </a>
            <Link 
              href="/stats" 
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" 
              data-testid="link-stats"
            >
              <Activity className="h-3.5 w-3.5 text-primary" />
              My Stats
            </Link>
            <Link 
              href="/free-tier" 
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" 
              data-testid="link-free-tier"
            >
              <Coins className="h-3.5 w-3.5 text-primary" />
              Free Tier
            </Link>
            <Link 
              href="/referrals" 
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" 
              data-testid="link-referrals"
            >
              <Users className="h-3.5 w-3.5 text-primary" />
              Referrals
            </Link>
            <a href="#leaderboards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" data-testid="link-leaderboards">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              Leaderboards
            </a>
            <Link 
              href="/shop" 
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" 
              data-testid="link-shop"
            >
              <Gift className="h-3.5 w-3.5 text-primary" />
              Shop
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-sm bg-primary/20 px-3 py-1.5 border-2 border-primary/60 shadow-[0_0_20px_rgba(255,140,66,0.5)]">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm font-bold text-primary" data-testid="text-points">{user.totalPoints.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">pts</span>
              </div>
              {freeTierData && freeTierData.ggCoins > 0 && (
                <div className="flex items-center gap-2 rounded-sm bg-accent/20 px-3 py-1.5 border-2 border-accent/60">
                  <Coins className="h-4 w-4 text-accent-foreground" />
                  <span className="font-mono text-sm font-bold" data-testid="text-gg-coins">{freeTierData.ggCoins.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">GG</span>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" className="hidden md:flex" onClick={handleLogin} data-testid="button-sign-in">
              Sign In
            </Button>
          )}
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
            <a href="#games" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" data-testid="link-games-mobile">
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
            <a href="#leaderboards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" data-testid="link-leaderboards-mobile">
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
              href="/tiktok-content" 
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" 
              data-testid="link-tiktok-content-mobile"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              TikTok Content
            </Link>
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
