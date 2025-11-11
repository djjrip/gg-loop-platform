import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Trophy, Zap, Star } from "lucide-react";

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  sponsorName: string;
  requirementCount: number;
  bonusPoints: number;
  userProgress: number;
  canClaim: boolean;
  claimed: boolean;
  endDate: string;
  onClaim?: (challengeId: string) => void;
  isClaimLoading?: boolean;
}

export default function ChallengeCard({ 
  id, 
  title, 
  description, 
  sponsorName, 
  requirementCount, 
  bonusPoints, 
  userProgress, 
  canClaim, 
  claimed,
  endDate,
  onClaim, 
  isClaimLoading 
}: ChallengeCardProps) {
  const progressPercentage = Math.min((userProgress / requirementCount) * 100, 100);
  const isComplete = userProgress >= requirementCount;
  const daysRemaining = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="p-6 relative border-2 hover-elevate" data-testid={`card-challenge-${id}`}>
      
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <Badge variant="secondary" className="text-xs uppercase tracking-wide" data-testid={`badge-sponsor-${id}`}>
                Sponsored by {sponsorName}
              </Badge>
            </div>
            <h3 className="font-semibold text-xl leading-tight" data-testid={`text-challenge-title-${id}`}>
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-challenge-description-${id}`}>
              {description}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <span className="text-3xl font-bold font-mono text-primary" data-testid={`text-bonus-points-${id}`}>
                  {bonusPoints.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground ml-2">bonus points</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {daysRemaining > 0 ? `${daysRemaining}d remaining` : 'Ending soon'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold font-mono" data-testid={`text-progress-${id}`}>
                {userProgress} / {requirementCount} wins
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" data-testid={`progress-bar-${id}`} />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            {claimed ? (
              <Badge variant="outline" className="text-xs flex items-center gap-1" data-testid={`badge-claimed-${id}`}>
                <Check className="h-3 w-3" />
                Reward Claimed
              </Badge>
            ) : isComplete ? (
              <Badge variant="default" className="text-xs flex items-center gap-1" data-testid={`badge-complete-${id}`}>
                <Star className="h-3 w-3" />
                Complete! Ready to claim
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs" data-testid={`badge-progress-${id}`}>
                {Math.round(progressPercentage)}% Complete
              </Badge>
            )}

            {canClaim && !claimed && (
              <Button 
                size="sm" 
                disabled={isClaimLoading}
                onClick={() => onClaim?.(id)}
                data-testid={`button-claim-${id}`}
                className="font-semibold"
              >
                {isClaimLoading ? (
                  "Claiming..."
                ) : (
                  <>
                    <Trophy className="mr-1 h-4 w-4" />
                    Claim {bonusPoints.toLocaleString()} pts
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
