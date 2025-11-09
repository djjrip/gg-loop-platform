import { Trophy, Star, Sparkles, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type RarityTier = "common" | "rare" | "epic" | "legendary";

interface TrophyCardProps {
  title: string;
  description?: string;
  gameName: string;
  pointsAwarded: number;
  achievedAt: string;
  rarity?: RarityTier;
  serialNumber?: string;
  className?: string;
}

const rarityConfig: Record<RarityTier, { color: string; icon: typeof Trophy; label: string; gradient: string }> = {
  common: {
    color: "text-muted-foreground",
    icon: Trophy,
    label: "Common",
    gradient: "from-muted/50 to-muted/20",
  },
  rare: {
    color: "text-blue-500",
    icon: Star,
    label: "Rare",
    gradient: "from-blue-500/20 to-blue-500/5",
  },
  epic: {
    color: "text-purple-500",
    icon: Sparkles,
    label: "Epic",
    gradient: "from-purple-500/20 to-purple-500/5",
  },
  legendary: {
    color: "text-amber-500",
    icon: Crown,
    label: "Legendary",
    gradient: "from-amber-500/20 to-amber-500/5",
  },
};

export default function TrophyCard({
  title,
  description,
  gameName,
  pointsAwarded,
  achievedAt,
  rarity = "common",
  serialNumber,
  className,
}: TrophyCardProps) {
  const config = rarityConfig[rarity];
  const IconComponent = config.icon;
  
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg",
        "border-2",
        className
      )}
      data-testid={`trophy-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", config.gradient)} />
      
      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn(
            "flex items-center justify-center rounded-lg p-3",
            "bg-background/80 backdrop-blur-sm"
          )}>
            <IconComponent className={cn("h-6 w-6", config.color)} />
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge 
              variant="secondary" 
              className={cn("font-semibold uppercase text-xs", config.color)}
              data-testid="badge-rarity"
            >
              {config.label}
            </Badge>
            {serialNumber && (
              <span className="text-xs font-mono text-muted-foreground" data-testid="text-serial">
                {serialNumber}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-lg leading-tight" data-testid="text-trophy-title">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-trophy-description">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Game</p>
            <p className="text-sm font-medium" data-testid="text-trophy-game">{gameName}</p>
          </div>
          
          <div className="space-y-1 text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Points</p>
            <p className="text-lg font-bold font-mono text-primary" data-testid="text-trophy-points">
              +{pointsAwarded}
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground" data-testid="text-trophy-date">
          Unlocked {new Date(achievedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
      </div>
    </Card>
  );
}
