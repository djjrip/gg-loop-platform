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

const rarityConfig: Record<RarityTier, { 
  color: string; 
  icon: typeof Trophy; 
  label: string; 
  gradient: string;
  borderClass: string;
  accentBar: string;
}> = {
  common: {
    color: "text-muted-foreground",
    icon: Trophy,
    label: "Common",
    gradient: "from-muted/30 to-muted/10",
    borderClass: "border-muted/50 hover:border-muted",
    accentBar: "bg-muted",
  },
  rare: {
    color: "text-[#5F6D4E]",
    icon: Star,
    label: "Rare",
    gradient: "from-[#5F6D4E]/25 to-[#5F6D4E]/5",
    borderClass: "border-[#5F6D4E]/40 hover:border-[#5F6D4E]/70",
    accentBar: "bg-[#5F6D4E]",
  },
  epic: {
    color: "text-[#B8724D]",
    icon: Sparkles,
    label: "Epic",
    gradient: "from-[#B8724D]/35 to-[#B8724D]/10",
    borderClass: "border-[#B8724D]/50 hover:border-[#B8724D]/80",
    accentBar: "bg-[#B8724D]",
  },
  legendary: {
    color: "text-[#D4A373]",
    icon: Crown,
    label: "Legendary",
    gradient: "from-[#D4A373]/45 to-[#D4A373]/15",
    borderClass: "border-[#D4A373]/60 hover:border-[#D4A373]/90",
    accentBar: "bg-[#D4A373]",
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
        "hover:-translate-y-1",
        "border-2",
        config.borderClass,
        className
      )}
      data-testid={`trophy-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", config.gradient)} />
      
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.accentBar)} />
      
      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className={cn(
            "flex items-center justify-center rounded-lg p-3",
            "bg-background/80 backdrop-blur-sm border",
            config.borderClass
          )}>
            <IconComponent className={cn("h-7 w-7", config.color)} />
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <Badge 
              variant="secondary" 
              className={cn(
                "font-semibold uppercase text-xs px-2.5 py-1",
                config.color
              )}
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
          <h3 className="font-bold text-xl leading-tight" data-testid="text-trophy-title">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-trophy-description">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Game</p>
            <p className="text-sm font-semibold" data-testid="text-trophy-game">{gameName}</p>
          </div>
          
          <div className="space-y-1 text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Points</p>
            <p className={cn(
              "text-2xl font-bold font-mono",
              config.color
            )} data-testid="text-trophy-points">
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
