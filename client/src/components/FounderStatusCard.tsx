import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Sparkles, Lock, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface FounderStatus {
  totalSlots: number;
  claimed: number;
  remaining: number;
  isSoldOut: boolean;
  price: number;
  userStatus: {
    isFounder: boolean;
    founderNumber: number | null;
    multiplier: number;
  } | null;
}

export default function FounderStatusCard() {
  const { user, isAuthenticated } = useAuth();

  const { data: status, isLoading } = useQuery<FounderStatus>({
    queryKey: ["/api/stripe/founder-status"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/founder-status");
      if (!res.ok) throw new Error("Failed to fetch founder status");
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-600/5">
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-muted-foreground">Loading founder status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const progressPercent = (status.claimed / status.totalSlots) * 100;
  const isUserFounder = status.userStatus?.isFounder === true;
  const founderNumber = status.userStatus?.founderNumber;

  return (
    <Card className={`border ${isUserFounder ? 'border-amber-500 bg-gradient-to-br from-amber-500/10 to-amber-600/10' : 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-600/5'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Founding Member Program
          </div>
          {isUserFounder && (
            <Badge className="bg-amber-500 text-black">
              <Sparkles className="h-3 w-3 mr-1" />
              Founder #{founderNumber}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              Spots Claimed
            </div>
            <span className="font-bold text-amber-500">
              {status.claimed} / {status.totalSlots}
            </span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-amber-500/20" />
          <div className="text-xs text-muted-foreground text-center">
            {status.isSoldOut ? (
              <span className="text-red-500 font-medium">SOLD OUT</span>
            ) : (
              <span>{status.remaining} spots remaining</span>
            )}
          </div>
        </div>

        {/* User Status */}
        {isUserFounder ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-amber-500" />
              <span className="font-bold text-amber-500">You are Founder #{founderNumber}</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Points Multiplier</span>
                <span className="font-bold text-green-500">2× ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">Lifetime Access</span>
              </div>
            </div>
            <p className="text-xs text-amber-500/80">
              Your 2× multiplier is applied to ALL points earned forever.
            </p>
          </div>
        ) : status.isSoldOut ? (
          <div className="p-4 bg-muted/50 border border-muted rounded-lg text-center">
            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              All {status.totalSlots} Founding Member spots have been claimed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="text-2xl font-bold text-amber-500 text-center">
                ${status.price}
                <span className="text-sm font-normal text-muted-foreground ml-2">lifetime</span>
              </div>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>2× points on everything, forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Founder badge + name on wall</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>1,000 bonus points instantly</span>
              </div>
            </div>

            <Link href="/founding-member">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold">
                <Crown className="mr-2 h-4 w-4" />
                Claim Founder Spot #{status.claimed + 1}
              </Button>
            </Link>
          </div>
        )}

        {/* Enforcement Notice */}
        <div className="pt-2 border-t border-muted">
          <p className="text-[10px] text-muted-foreground text-center">
            Hard limit: First {status.totalSlots} only. 2× multiplier verified in code. No exceptions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

