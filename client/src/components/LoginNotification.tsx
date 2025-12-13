import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Flame, Trophy, Coins } from "lucide-react";

interface LoginNotification {
  streak: number;
  coinsAwarded: number;
  badgeUnlocked?: string;
  timestamp: number;
}

export function LoginNotification() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const hasChecked = useRef(false);

  const { data: notification, refetch } = useQuery<LoginNotification | null>({
    queryKey: ["/api/auth/login-notification"],
    enabled: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // Trigger notification fetch when user becomes authenticated
  useEffect(() => {
    if (!isLoading && user && !hasChecked.current) {
      hasChecked.current = true;
      refetch();
    }
  }, [user, isLoading, refetch]);

  useEffect(() => {
    if (!notification) return;

    const messages: string[] = [];
    
    if (notification.coinsAwarded > 0) {
      messages.push(`+${notification.coinsAwarded} GG Coins for ${notification.streak}-day streak!`);
    } else if (notification.streak > 1) {
      messages.push(`${notification.streak}-day login streak!`);
    }

    if (notification.badgeUnlocked) {
      messages.push(`Badge unlocked: ${notification.badgeUnlocked}`);
    }

    if (messages.length > 0) {
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            <span>Welcome back!</span>
          </div>
        ) as any,
        description: (
          <div className="space-y-1">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {msg.includes("GG Coins") ? (
                  <Coins className="h-4 w-4 text-primary" />
                ) : msg.includes("Badge") ? (
                  <Trophy className="h-4 w-4 text-primary" />
                ) : (
                  <Flame className="h-4 w-4 text-primary" />
                )}
                <span>{msg}</span>
              </div>
            ))}
          </div>
        ) as any,
        duration: 5000,
      });
    }
  }, [notification, toast]);

  return null;
}
