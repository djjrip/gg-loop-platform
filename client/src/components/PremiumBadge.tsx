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
    gradient: 'from-yellow-400 via-orange-500 to-yellow-600',
    border: 'border-yellow-500/50',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.5)]',
    bg: 'bg-gradient-to-br from-yellow-900/20 via-orange-900/30 to-yellow-800/20',
    label: 'Legendary',
    metallic: 'bg-gradient-to-br from-yellow-300 to-orange-400',
    frameGradient: 'from-yellow-600 via-orange-500 to-yellow-600',
  },
  epic: {
    icon: Sparkles,
    gradient: 'from-purple-400 via-pink-500 to-purple-600',
    border: 'border-purple-500/50',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.4)]',
    bg: 'bg-gradient-to-br from-purple-900/20 via-pink-900/30 to-purple-800/20',
    label: 'Epic',
    metallic: 'bg-gradient-to-br from-purple-300 to-pink-400',
    frameGradient: 'from-purple-600 via-pink-500 to-purple-600',
  },
  rare: {
    icon: Star,
    gradient: 'from-blue-400 via-cyan-500 to-blue-600',
    border: 'border-blue-500/50',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    bg: 'bg-gradient-to-br from-blue-900/20 via-cyan-900/30 to-blue-800/20',
    label: 'Rare',
    metallic: 'bg-gradient-to-br from-blue-300 to-cyan-400',
    frameGradient: 'from-blue-600 via-cyan-500 to-blue-600',
  },
  common: {
    icon: Zap,
    gradient: 'from-slate-400 via-gray-500 to-slate-600',
    border: 'border-slate-500/50',
    glow: 'shadow-[0_0_15px_rgba(100,116,139,0.2)]',
    bg: 'bg-gradient-to-br from-slate-900/20 via-gray-900/30 to-slate-800/20',
    label: 'Common',
    metallic: 'bg-gradient-to-br from-slate-300 to-gray-400',
    frameGradient: 'from-slate-600 via-gray-500 to-slate-600',
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
        "relative group",
        className
      )}
      data-testid={`badge-full-${rarity}`}
    >
      {/* Outer glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity",
        config.glow
      )} />
      
      {/* Main badge container */}
      <div className={cn(
        "relative flex flex-col items-center p-6 rounded-2xl border-2 backdrop-blur-sm",
        config.border,
        config.bg
      )}>
        {/* Shield frame with icon */}
        <div className="relative mb-4">
          {/* Metallic frame */}
          <div className={cn(
            "w-24 h-28 rounded-t-full rounded-b-lg flex items-center justify-center border-4 border-background/20",
            `bg-gradient-to-br ${config.frameGradient}`
          )}>
            {/* Inner shield */}
            <div className="w-20 h-24 rounded-t-full rounded-b-lg bg-background/10 flex items-center justify-center border-2 border-background/30">
              <Icon className="h-12 w-12 text-background drop-shadow-lg" />
            </div>
          </div>
          
          {/* Floating particles effect for legendary/epic */}
          {(rarity === 'legendary' || rarity === 'epic') && (
            <div className="absolute inset-0 overflow-hidden rounded-t-full rounded-b-lg">
              <div className={cn("absolute top-1/4 left-1/4 w-2 h-2 rounded-full animate-ping", config.metallic)} />
              <div className={cn("absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full animate-pulse", config.metallic)} />
            </div>
          )}
        </div>

        {/* Badge title */}
        <h3 className="text-xl font-bold text-center mb-2">{title}</h3>
        
        {/* Rarity label */}
        <div className={cn(
          "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border-2",
          `bg-gradient-to-r ${config.gradient}`,
          "text-white border-background/30"
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
