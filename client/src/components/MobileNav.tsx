import { Link, useLocation } from "wouter";
import { Home, Trophy, User, ShieldCheck, QrCode, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Show even if not logged in (to encourage signup), specific items gated if needed
  // For PWA "user experience", we might want it visible always, or at least public routes.
  // User script implies these are verified features, so lets require user for some.

  const isActive = (path: string) => location === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-white/10 pb-safe md:hidden backdrop-blur-lg">
      <div className="flex justify-around items-center h-16">
        <Link href="/">
          <div className={`flex flex-col items-center gap-1 p-2 ${isActive("/") ? "text-ggloop-orange" : "text-gray-500"}`}>
            <Home className="h-6 w-6" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Home</span>
          </div>
        </Link>
        <Link href="/track">
          <div className={`flex flex-col items-center gap-1 p-2 ${isActive("/track") ? "text-ggloop-orange" : "text-gray-500"}`}>
            <Activity className="h-6 w-6" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Track</span>
          </div>
        </Link>
        <Link href="/verify">
          <div className={`flex flex-col items-center gap-1 p-2 ${isActive("/verify") ? "text-ggloop-orange" : "text-gray-500"}`}>
            <ShieldCheck className="h-6 w-6" />
            <div className="absolute -mt-1 ml-4 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Verify</span>
          </div>
        </Link>
        <Link href="/passport">
          <div className={`flex flex-col items-center gap-1 p-2 ${isActive("/passport") ? "text-ggloop-orange" : "text-gray-500"}`}>
            <QrCode className="h-6 w-6" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Pass</span>
          </div>
        </Link>
        <Link href="/profile">
          <div className={`flex flex-col items-center gap-1 p-2 ${isActive("/profile") ? "text-ggloop-orange" : "text-gray-500"}`}>
            <User className="h-6 w-6" />
            <span className="text-[10px] font-medium uppercase tracking-wide">Profile</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
