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
  accentColor: string;
  bgGradient: string;
  iconBg: string;
}> = {
  common: {
    color: "text-zinc-400",
    icon: Trophy,
    label: "COMMON",
    accentColor: "bg-zinc-600",
    bgGradient: "from-zinc-900/40 to-zinc-800/20",
    iconBg: "bg-zinc-800/50",
  },
  rare: {
    color: "text-[#5F6D4E]",
    icon: Star,
    label: "RARE",
    accentColor: "bg-[#5F6D4E]",
    bgGradient: "from-[#5F6D4E]/30 to-[#4A5A3D]/10",
    iconBg: "bg-[#5F6D4E]/20",
  },
  epic: {
    color: "text-[#B8724D]",
    icon: Sparkles,
    label: "EPIC",
    accentColor: "bg-gradient-to-r from-[#B8724D] to-[#D4885F]",
    bgGradient: "from-[#B8724D]/40 via-[#C88A5E]/20 to-[#8B5A3C]/10",
    iconBg: "bg-gradient-to-br from-[#B8724D]/30 to-[#8B5A3C]/20",
  },
  legendary: {
    color: "text-[#D4A373]",
    icon: Crown,
    label: "LEGENDARY",
    accentColor: "bg-gradient-to-r from-[#FFD700] via-[#D4A373] to-[#B8724D]",
    bgGradient: "from-[#FFD700]/25 via-[#D4A373]/20 to-[#B8724D]/15",
    iconBg: "bg-gradient-to-br from-[#FFD700]/30 via-[#D4A373]/25 to-[#B8724D]/20",
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
  
  // COMMON: Small, compact card
  if (rarity === "common") {
    return (
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5",
          "border border-zinc-700/50 hover:border-zinc-600",
          className
        )}
        data-testid={`trophy-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/30 to-zinc-800/10" />
        <div className="relative p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-zinc-800/50">
                <IconComponent className="h-4 w-4 text-zinc-400" />
              </div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {config.label}
              </span>
            </div>
            {serialNumber && (
              <span className="text-xs text-zinc-600 font-mono" data-testid="text-serial">{serialNumber}</span>
            )}
          </div>
          <h3 className="text-sm font-semibold leading-tight" data-testid="text-trophy-title">{title}</h3>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800">
            <span className="text-zinc-500" data-testid="text-trophy-game">{gameName}</span>
            <span className="font-bold font-mono text-zinc-400" data-testid="text-trophy-points">+{pointsAwarded}</span>
          </div>
        </div>
      </Card>
    );
  }
  
  // RARE: Medium card with accent bar and split layout
  if (rarity === "rare") {
    return (
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-250 hover:-translate-y-1",
          "border-2 border-[#5F6D4E]/50 hover:border-[#5F6D4E]/80",
          className
        )}
        data-testid={`trophy-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#5F6D4E]/25 to-[#4A5A3D]/5" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#5F6D4E]" />
        <div className="relative p-5 space-y-3.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-[#5F6D4E]/20 border border-[#5F6D4E]/40">
                <IconComponent className="h-6 w-6 text-[#5F6D4E]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#5F6D4E] uppercase tracking-widest mb-1" data-testid="badge-rarity">
                  {config.label}
                </div>
                <h3 className="text-base font-bold leading-tight" data-testid="text-trophy-title">{title}</h3>
              </div>
            </div>
            {serialNumber && (
              <span className="text-xs text-muted-foreground font-mono px-2 py-1 bg-[#5F6D4E]/10 rounded" data-testid="text-serial">
                {serialNumber}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-trophy-description">{description}</p>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-[#5F6D4E]/20">
            <span className="text-sm font-medium" data-testid="text-trophy-game">{gameName}</span>
            <span className="text-xl font-bold font-mono text-[#5F6D4E]" data-testid="text-trophy-points">+{pointsAwarded}</span>
          </div>
          <div className="text-xs text-muted-foreground" data-testid="text-trophy-date">
            {new Date(achievedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </Card>
    );
  }
  
  // EPIC: Large showcase card with prominent icon
  if (rarity === "epic") {
    return (
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01]",
          "border-[3px] border-[#B8724D]/60 hover:border-[#B8724D]/90",
          className
        )}
        data-testid={`trophy-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#B8724D]/35 via-[#C88A5E]/15 to-[#8B5A3C]/5" />
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B8724D] to-[#D4885F]" />
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4885F] to-[#B8724D]" />
        
        <div className="relative p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#B8724D]/20 blur-xl rounded-full" />
              <div className="relative p-5 rounded-xl bg-gradient-to-br from-[#B8724D]/30 to-[#8B5A3C]/20 border-2 border-[#B8724D]/50">
                <IconComponent className="h-10 w-10 text-[#B8724D]" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-black text-[#B8724D] uppercase tracking-[0.2em]" data-testid="badge-rarity">
                  {config.label}
                </div>
                {serialNumber && (
                  <span className="text-xs text-muted-foreground font-mono font-semibold px-2.5 py-1 bg-[#B8724D]/15 rounded border border-[#B8724D]/30" data-testid="text-serial">
                    {serialNumber}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold leading-tight mb-1" data-testid="text-trophy-title">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-trophy-description">{description}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-3 border-t-2 border-[#B8724D]/25">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Game</div>
              <div className="text-sm font-bold" data-testid="text-trophy-game">{gameName}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Points</div>
              <div className="text-2xl font-black font-mono text-[#B8724D]" data-testid="text-trophy-points">+{pointsAwarded}</div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground pt-2 border-t border-[#B8724D]/15" data-testid="text-trophy-date">
            Unlocked {new Date(achievedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </Card>
    );
  }
  
  // LEGENDARY: Championship banner - FULL GLORY
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-400 hover:-translate-y-2 hover:scale-[1.02]",
        "border-[4px] border-[#D4A373]/70 hover:border-[#FFD700]/90 shadow-2xl",
        className
      )}
      data-testid={`trophy-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Glowing golden gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/20 via-[#D4A373]/15 to-[#B8724D]/10" />
      
      {/* Top and bottom accent bars - CHAMPIONSHIP ENERGY */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FFD700] via-[#D4A373] to-[#FFD700]" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FFD700] via-[#D4A373] to-[#FFD700]" />
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-[#FFD700]/20 blur-2xl" />
      <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFD700]/20 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#D4A373]/20 blur-2xl" />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#D4A373]/20 blur-2xl" />
      
      {/* Subtle shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent bg-[length:200%_100%] animate-shimmer-slow" />
      
      <div className="relative p-8 space-y-6">
        {/* Top section: Icon and badge */}
        <div className="flex items-center justify-between">
          {/* MASSIVE championship icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#FFD700]/30 blur-2xl rounded-full" />
            <div className="relative p-6 rounded-full bg-gradient-to-br from-[#FFD700]/30 via-[#D4A373]/25 to-[#B8724D]/20 border-[3px] border-[#FFD700]/60 shadow-xl ring-4 ring-[#D4A373]/20 ring-offset-2 ring-offset-background">
              <IconComponent className="h-14 w-14 text-[#FFD700]" />
            </div>
          </div>
          
          {/* Legendary badge */}
          <Badge 
            variant="secondary" 
            className="uppercase text-sm px-4 py-2 font-black tracking-[0.25em] text-[#FFD700] bg-gradient-to-r from-[#FFD700]/20 to-[#D4A373]/20 backdrop-blur-sm border-2 border-[#FFD700]/50"
            data-testid="badge-rarity"
          >
            {config.label}
          </Badge>
        </div>
        
        {/* Title section */}
        <div className="space-y-3">
          <h3 className="text-3xl font-black uppercase leading-none tracking-tight font-mono text-[#FFD700]" data-testid="text-trophy-title">
            {title}
          </h3>
          {description && (
            <p className="text-base text-foreground/80 leading-relaxed italic font-medium" data-testid="text-trophy-description">
              {description}
            </p>
          )}
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-[#D4A373]/40">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-bold">Game</div>
            <div className="text-base font-bold" data-testid="text-trophy-game">{gameName}</div>
          </div>
          
          <div className="space-y-2 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-bold">Unlocked</div>
            <div className="text-sm font-semibold" data-testid="text-trophy-date">
              {new Date(achievedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: '2-digit'
              })}
            </div>
          </div>
          
          <div className="space-y-2 text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-bold">Points</div>
            <div className="text-4xl font-black font-mono text-[#FFD700]" data-testid="text-trophy-points">
              +{pointsAwarded}
            </div>
          </div>
        </div>
        
        {/* Serial number at bottom */}
        {serialNumber && (
          <div className="pt-4 border-t border-[#D4A373]/25 text-center">
            <span className="text-xs font-mono text-muted-foreground font-semibold tracking-wider" data-testid="text-serial">
              {serialNumber}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
