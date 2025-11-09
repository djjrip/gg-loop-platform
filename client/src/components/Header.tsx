import { Trophy, Menu, LogOut, Moon, Sun, Sparkles, Rocket, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Link } from "wouter";
import logoImage from "@assets/generated_images/GG_Loop_gaming_logo_b792d1a4.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/5 bg-background/99 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md" data-testid="link-home">
            <img src={logoImage} alt="GG LOOP" className="h-8 w-8" />
            <span className="text-xl font-bold font-heading tracking-tight">GG LOOP</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#games" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-games">
              Games
            </a>
            <Link 
              href="/report-match" 
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" 
              data-testid="link-report-match"
            >
              <Gamepad2 className="h-3.5 w-3.5 text-primary" />
              Report Win
            </Link>
            <a href="#leaderboards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-leaderboards">
              Leaderboards
            </a>
            <a href="#rewards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-rewards">
              Rewards
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 border border-primary/20">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm font-bold text-primary" data-testid="text-points">{user.totalPoints.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">pts</span>
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
                  <p className="text-xs text-primary font-semibold mt-1">{user.totalPoints} points</p>
                </div>
                <DropdownMenuSeparator />
                <Link href={`/profile/${user.id}`}>
                  <DropdownMenuItem data-testid="link-my-profile">
                    <Trophy className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                </Link>
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
            <a href="#games" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-games-mobile">
              Games
            </a>
            <Link 
              href="/report-match" 
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" 
              data-testid="link-report-match-mobile"
            >
              <Gamepad2 className="h-3.5 w-3.5 text-primary" />
              Report Win
            </Link>
            <a href="#leaderboards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-leaderboards-mobile">
              Leaderboards
            </a>
            <a href="#rewards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-rewards-mobile">
              Rewards
            </a>
            <Link 
              href="/tiktok-content" 
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" 
              data-testid="link-tiktok-content-mobile"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              TikTok Content
            </Link>
            <Link 
              href="/launch-dashboard" 
              className="text-sm font-medium hover-elevate px-3 py-2 rounded-md flex items-center gap-1.5" 
              data-testid="link-launch-dashboard-mobile"
            >
              <Rocket className="h-3.5 w-3.5 text-primary" />
              Launch
            </Link>
            {isAuthenticated && user ? (
              <Button variant="destructive" size="sm" onClick={handleLogout} data-testid="button-logout-mobile">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
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
