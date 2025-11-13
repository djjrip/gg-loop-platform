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
  borderWidth: string;
  texturePattern: string;
  padding: string;
  iconSize: string;
  titleSize: string;
  titleFont: string;
  iconContainer: string;
}> = {
  common: {
    color: "text-muted-foreground",
    icon: Trophy,
    label: "Common",
    gradient: "from-muted/20 to-transparent",
    borderWidth: "border",
    texturePattern: "",
    padding: "p-4",
    iconSize: "h-6 w-6",
    titleSize: "text-base",
    titleFont: "font-semibold",
    iconContainer: "rounded-md p-2 bg-muted/30",
  },
  rare: {
    color: "text-[#5F6D4E]",
    icon: Star,
    label: "Rare",
    gradient: "from-[#5F6D4E]/30 via-[#5F6D4E]/15 to-transparent",
    borderWidth: "border-2",
    texturePattern: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImxpbmVuIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiPjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDAgTDYwIDYwIE0tMzAgMzAgTDMwIC0zMCBNMzAgOTAgTDkwIDMwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjAzIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2xpbmVuKSIvPjwvc3ZnPg==')] opacity-40",
    padding: "p-5",
    iconSize: "h-7 w-7",
    titleSize: "text-lg",
    titleFont: "font-bold",
    iconContainer: "rounded-full p-3 bg-[#5F6D4E]/20 border border-[#5F6D4E]/40",
  },
  epic: {
    color: "text-[#B8724D]",
    icon: Sparkles,
    label: "Epic",
    gradient: "from-[#B8724D]/40 via-[#B8724D]/25 to-[#B8724D]/5",
    borderWidth: "border-[3px]",
    texturePattern: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRpYWdvbmFsIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDIwIEw0MCAyMCBNMjAgMCBMMjAgNDAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIwLjgiIG9wYWNpdHk9IjAuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZGlhZ29uYWwpIi8+PC9zdmc+')]",
    padding: "p-6",
    iconSize: "h-8 w-8",
    titleSize: "text-xl",
    titleFont: "font-bold",
    iconContainer: "rounded-lg p-4 bg-gradient-to-br from-[#B8724D]/30 to-[#B8724D]/10 border-2 border-[#B8724D]/50 shadow-inner",
  },
  legendary: {
    color: "text-[#D4A373]",
    icon: Crown,
    label: "Legendary",
    gradient: "from-[#D4A373]/50 via-[#C9A35E]/30 to-[#B8724D]/10",
    borderWidth: "border-[4px]",
    texturePattern: "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9Im1ldGFsIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjAuOCIgZmlsbD0iIzAwMDAwMCIgb3BhY2l0eT0iMC4wNiIvPjxjaXJjbGUgY3g9IjUiIGN5PSI1IiByPSIwLjYiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuMDQiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIwLjYiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuMDQiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjbWV0YWwpIi8+PC9zdmc+')]",
    padding: "p-8",
    iconSize: "h-10 w-10",
    titleSize: "text-2xl",
    titleFont: "font-black tracking-tight",
    iconContainer: "rounded-full p-5 bg-gradient-to-br from-[#D4A373]/40 to-[#B8724D]/20 border-[3px] border-[#D4A373]/60 shadow-lg ring-2 ring-[#D4A373]/20 ring-offset-2 ring-offset-background",
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
  
  const borderColor = rarity === "common" ? "border-muted/50" :
                     rarity === "rare" ? "border-[#5F6D4E]/50" :
                     rarity === "epic" ? "border-[#B8724D]/60" :
                     "border-[#D4A373]/70";
  
  const hoverBorder = rarity === "common" ? "hover:border-muted" :
                      rarity === "rare" ? "hover:border-[#5F6D4E]/80" :
                      rarity === "epic" ? "hover:border-[#B8724D]/90" :
                      "hover:border-[#D4A373]";
  
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:-translate-y-1",
        config.borderWidth,
        borderColor,
        hoverBorder,
        className
      )}
      data-testid={`trophy-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", config.gradient)} />
      
      {config.texturePattern && (
        <div className={cn("absolute inset-0", config.texturePattern)} />
      )}
      
      {rarity === "legendary" && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4A373]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer-slow 4s ease-in-out infinite',
          }}
        />
      )}
      
      {rarity === "rare" && (
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#5F6D4E]/20" />
      )}
      
      {rarity === "epic" && (
        <>
          <div className={cn(
            "absolute inset-0 m-2 rounded-md",
            "border border-[#B8724D]/30 pointer-events-none"
          )} />
          <div className="absolute top-0 left-0 w-16 h-16 bg-[#B8724D]/10 blur-2xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#B8724D]/10 blur-2xl" />
        </>
      )}
      
      <div className={cn("relative", config.padding)}>
        {rarity === "legendary" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className={cn(
                "flex items-center justify-center",
                config.iconContainer
              )}>
                <IconComponent className={cn(config.iconSize, config.color)} />
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "uppercase text-xs px-3 py-1.5 font-bold tracking-wider",
                  config.color,
                  "bg-background/60 backdrop-blur-sm border-2",
                  "border-[#D4A373]/50"
                )}
                data-testid="badge-rarity"
              >
                {config.label}
              </Badge>
            </div>

            <div className="space-y-3">
              <h3 className={cn(
                config.titleSize,
                config.titleFont,
                "uppercase leading-none font-mono",
                config.color
              )} data-testid="text-trophy-title">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-foreground/70 leading-relaxed italic" data-testid="text-trophy-description">
                  {description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-[#D4A373]/40">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Game</p>
                <p className="text-sm font-bold" data-testid="text-trophy-game">{gameName}</p>
              </div>
              
              <div className="space-y-1 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Unlocked</p>
                <p className="text-xs font-medium" data-testid="text-trophy-date">
                  {new Date(achievedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="space-y-1 text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Points</p>
                <p className={cn(
                  "text-3xl font-black font-mono",
                  config.color
                )} data-testid="text-trophy-points">
                  +{pointsAwarded}
                </p>
              </div>
            </div>
            
            {serialNumber && (
              <p className="text-xs font-mono text-muted-foreground text-center pt-2 border-t border-[#D4A373]/20" data-testid="text-serial">
                {serialNumber}
              </p>
            )}
          </div>
        ) : rarity === "epic" ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className={cn(
                "flex items-center justify-center",
                config.iconContainer
              )}>
                <IconComponent className={cn(config.iconSize, config.color)} />
              </div>
              
              <div className="flex flex-col items-end gap-1.5">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "font-bold uppercase text-xs px-3 py-1.5",
                    config.color,
                    "bg-background/70 backdrop-blur-sm border-2 border-[#B8724D]/40"
                  )}
                  data-testid="badge-rarity"
                >
                  {config.label}
                </Badge>
                {serialNumber && (
                  <span className="text-xs font-mono text-muted-foreground font-semibold px-2 py-0.5 bg-background/50 rounded" data-testid="text-serial">
                    {serialNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className={cn(config.titleSize, config.titleFont, "leading-tight")} data-testid="text-trophy-title">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-trophy-description">
                  {description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t-2 border-[#B8724D]/30">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Game</p>
                <p className="text-sm font-bold" data-testid="text-trophy-game">{gameName}</p>
              </div>
              
              <div className="space-y-1 text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Points</p>
                <p className={cn(
                  "text-2xl font-black font-mono",
                  config.color
                )} data-testid="text-trophy-points">
                  +{pointsAwarded}
                </p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground pt-2 border-t border-[#B8724D]/20" data-testid="text-trophy-date">
              Unlocked {new Date(achievedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        ) : rarity === "rare" ? (
          <div className="space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className={cn(
                "flex items-center justify-center",
                config.iconContainer
              )}>
                <IconComponent className={cn(config.iconSize, config.color)} />
              </div>
              
              <div className="flex flex-col items-end gap-1.5">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "font-bold uppercase text-xs px-3 py-1 rounded-full",
                    config.color,
                    "bg-background/60 backdrop-blur-sm"
                  )}
                  data-testid="badge-rarity"
                >
                  {config.label}
                </Badge>
                {serialNumber && (
                  <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 bg-[#5F6D4E]/10 rounded-full" data-testid="text-serial">
                    {serialNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className={cn(config.titleSize, config.titleFont, "leading-tight")} data-testid="text-trophy-title">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-trophy-description">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#5F6D4E]/30">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Game</p>
                <p className="text-sm font-bold" data-testid="text-trophy-game">{gameName}</p>
              </div>
              
              <div className="space-y-0.5 text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Points</p>
                <p className={cn(
                  "text-xl font-bold font-mono",
                  config.color
                )} data-testid="text-trophy-points">
                  +{pointsAwarded}
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground" data-testid="text-trophy-date">
              {new Date(achievedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className={cn(
                "flex items-center justify-center",
                config.iconContainer
              )}>
                <IconComponent className={cn(config.iconSize, config.color)} />
              </div>
              
              <Badge 
                variant="secondary" 
                className="font-semibold uppercase text-xs px-2 py-0.5"
                data-testid="badge-rarity"
              >
                {config.label}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <h3 className={cn(config.titleSize, config.titleFont, "leading-tight")} data-testid="text-trophy-title">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-muted-foreground leading-relaxed" data-testid="text-trophy-description">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
              <span className="text-muted-foreground" data-testid="text-trophy-game">{gameName}</span>
              <span className={cn("font-bold font-mono", config.color)} data-testid="text-trophy-points">
                +{pointsAwarded}
              </span>
            </div>
            
            <div className="text-xs text-muted-foreground/70" data-testid="text-trophy-date">
              {new Date(achievedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
