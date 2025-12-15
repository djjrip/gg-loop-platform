import { Link, useLocation } from "wouter";
import { Home, Trophy, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => location === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-white/10 pb-safe md:hidden backdrop-blur-lg">
      <div className="flex justify-around items-center h-16">
        <Link href="/">
          <div className={`flex flex-col items-center gap-1 p-2 ${isActive("/") ? "text-ggloop-orange" : "text-gray-500"}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Home</span>
          </div>
        </Link>
        <Link href="/creator-leaderboard">
          <div className={`flex flex-col items-center gap-1 p-2 ${isActive("/creator-leaderboard") ? "text-ggloop-orange" : "text-gray-500"}`}>
            <Trophy className="h-6 w-6" />
            <span className="text-xs font-medium">Rank</span>
          </div>
        </Link>
        <Link href="/creator-dashboard">
          <div className={`flex flex-col items-center gap-1 p-2 ${isActive("/creator-dashboard") ? "text-ggloop-orange" : "text-gray-500"}`}>
            <ShieldCheck className="h-6 w-6" />
            <span className="text-xs font-medium">Verify</span>
          </div>
        </Link>
        <Link href="/profile">
          <div className={`flex flex-col items-center gap-1 p-2 ${isActive("/profile") ? "text-ggloop-orange" : "text-gray-500"}`}>
            <User className="h-6 w-6" />
            <span className="text-xs font-medium">Profile</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
