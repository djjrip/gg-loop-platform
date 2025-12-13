import { Shield, Crown, Sparkles, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface PremiumBadgeProps {
  rarity: Rarity;
  title: string;
  description?: string;
  compact?: boolean;
  className?: string;
}

const rarityConfig = {
  legendary: {
    icon: Crown,
    gradient: 'from-amber-600 via-orange-600 to-amber-700',
    border: 'border-amber-600/40',
    glow: 'shadow-sm',
    bg: 'bg-gradient-to-br from-amber-950/10 via-orange-950/15 to-amber-900/10',
    label: 'Legendary',
    metallic: 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600',
    frameGradient: 'from-amber-700 via-orange-600 to-amber-700',
    frameColor: '#B8724D',
  },
  epic: {
    icon: Sparkles,
    gradient: 'from-purple-600 via-purple-700 to-purple-800',
    border: 'border-purple-600/40',
    glow: 'shadow-sm',
    bg: 'bg-gradient-to-br from-purple-950/10 via-purple-900/15 to-purple-950/10',
    label: 'Epic',
    metallic: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600',
    frameGradient: 'from-purple-700 via-purple-600 to-purple-700',
    frameColor: '#7C3AED',
  },
  rare: {
    icon: Star,
    gradient: 'from-blue-600 via-blue-700 to-blue-800',
    border: 'border-blue-600/40',
    glow: 'shadow-sm',
    bg: 'bg-gradient-to-br from-blue-950/10 via-blue-900/15 to-blue-950/10',
    label: 'Rare',
    metallic: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
    frameGradient: 'from-blue-700 via-blue-600 to-blue-700',
    frameColor: '#2563EB',
  },
  common: {
    icon: Shield,
    gradient: 'from-slate-500 via-slate-600 to-slate-700',
    border: 'border-slate-500/40',
    glow: 'shadow-sm',
    bg: 'bg-gradient-to-br from-slate-950/10 via-slate-900/15 to-slate-950/10',
    label: 'Common',
    metallic: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500',
    frameGradient: 'from-slate-700 via-slate-600 to-slate-700',
    frameColor: '#64748B',
  },
};

export default function PremiumBadge({ rarity, title, description, compact = false, className }: PremiumBadgeProps) {
  const config = rarityConfig[rarity];
  const Icon = config.icon;

  if (compact) {
    return (
      <div 
        className={cn(
          "relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2",
          config.border,
          config.bg,
          config.glow,
          className
        )}
        data-testid={`badge-compact-${rarity}`}
      >
        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", config.metallic)}>
          <Icon className="h-3 w-3 text-background" />
        </div>
        <span className="font-semibold text-sm">{title}</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative",
        className
      )}
      data-testid={`badge-full-${rarity}`}
    >
      {/* Main badge container */}
      <div className={cn(
        "relative flex flex-col items-center p-6 rounded-md border",
        config.border,
        config.bg,
        config.glow
      )}>
        {/* Shield frame with icon */}
        <div className="relative mb-4">
          {/* Metallic frame - simplified shield silhouette */}
          <div className={cn(
            "w-20 h-24 rounded-t-full rounded-b-lg flex items-center justify-center border-[3px]",
            `bg-gradient-to-br ${config.frameGradient}`,
            config.border
          )}>
            {/* Inner shield */}
            <div className="w-16 h-20 rounded-t-full rounded-b-lg bg-background/90 flex items-center justify-center border border-background/50">
              <Icon className="h-10 w-10" style={{ color: config.frameColor }} />
            </div>
          </div>
        </div>

        {/* Badge title */}
        <h3 className="text-lg font-bold text-center mb-2">{title}</h3>
        
        {/* Rarity label */}
        <div className={cn(
          "px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide",
          `bg-gradient-to-r ${config.gradient}`,
          "text-white"
        )}>
          {config.label}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground text-center mt-3 max-w-xs">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
