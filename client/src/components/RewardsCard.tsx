import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Check } from "lucide-react";

interface RewardsCardProps {
  id: string;
  title: string;
  description: string;
  points: number;
  isUnlocked: boolean;
  isClaimed?: boolean;
  category: string;
  onClaim?: (rewardId: string) => void;
  isClaimLoading?: boolean;
}

export default function RewardsCard({ id, title, description, points, isUnlocked, isClaimed, category, onClaim, isClaimLoading }: RewardsCardProps) {
  return (
    <Card className="p-6 relative overflow-hidden" data-testid={`card-reward-${title.toLowerCase().replace(/\s/g, '-')}`}>
      {!isUnlocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <Lock className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg" data-testid={`text-reward-title-${title.toLowerCase().replace(/\s/g, '-')}`}>
              {title}
            </h3>
            <p className="text-sm text-muted-foreground" data-testid={`text-reward-description-${title.toLowerCase().replace(/\s/g, '-')}`}>
              {description}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0" data-testid={`badge-category-${category.toLowerCase()}`}>
            {category}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-primary" data-testid={`text-points-${title.toLowerCase().replace(/\s/g, '-')}`}>
              {points.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>

          {isUnlocked && (
            <Button 
              size="sm" 
              disabled={isClaimed || isClaimLoading}
              onClick={() => onClaim?.(id)}
              data-testid={`button-claim-${title.toLowerCase().replace(/\s/g, '-')}`}
            >
              {isClaimed ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Claimed
                </>
              ) : isClaimLoading ? (
                "Claiming..."
              ) : (
                "Claim"
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
