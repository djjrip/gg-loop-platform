import { Trophy, Menu, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-heading tracking-tight">GG LOOP</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#games" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-games">
              Games
            </a>
            <a href="#leaderboards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-leaderboards">
              Leaderboards
            </a>
            <a href="#rewards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-rewards">
              Rewards
            </a>
            <a href="#community" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-community">
              Community
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 border border-primary/20">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm font-bold text-primary" data-testid="text-points">12,450</span>
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
          
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

          <Button variant="ghost" size="icon" className="hidden md:flex" data-testid="button-profile">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col gap-2 p-4">
            <a href="#games" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-games-mobile">
              Games
            </a>
            <a href="#leaderboards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-leaderboards-mobile">
              Leaderboards
            </a>
            <a href="#rewards" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-rewards-mobile">
              Rewards
            </a>
            <a href="#community" className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-community-mobile">
              Community
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
