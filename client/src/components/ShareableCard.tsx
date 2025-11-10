import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Share2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import logoImage from "@assets/DISCORD LOGO_1762728629973.png";

interface ShareableCardProps {
  type: "achievement" | "milestone" | "referral";
  title: string;
  subtitle?: string;
  points?: number;
  stat1Label?: string;
  stat1Value?: string;
  stat2Label?: string;
  stat2Value?: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
  username?: string;
  onShare?: () => void;
}

const RARITY_COLORS = {
  common: "from-gray-500 to-gray-600",
  rare: "from-blue-500 to-blue-600",
  epic: "from-purple-500 to-purple-600",
  legendary: "from-yellow-500 to-orange-500",
};

const RARITY_GLOW = {
  common: "shadow-[0_0_20px_rgba(107,114,128,0.5)]",
  rare: "shadow-[0_0_30px_rgba(59,130,246,0.6)]",
  epic: "shadow-[0_0_40px_rgba(168,85,247,0.7)]",
  legendary: "shadow-[0_0_50px_rgba(251,146,60,0.8)]",
};

export default function ShareableCard({
  type,
  title,
  subtitle,
  points,
  stat1Label,
  stat1Value,
  stat2Label,
  stat2Value,
  rarity = "common",
  username = "Gamer",
  onShare,
}: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadAsImage = async () => {
    // For now, just copy the share text
    const text = `🏆 ${title}\n\n${subtitle || ''}\n${points ? `${points} points earned` : ''}\n\nJoin me on GG Loop! #GGLoop #Gaming`;
    
    try {
      await navigator.clipboard.writeText(text);
      alert("Achievement text copied! Paste it into your social media post.");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToTwitter = () => {
    const text = `🏆 ${title}\n\n${subtitle || ''}\n${points ? `${points} points on GG Loop!` : ''}\n\n#GGLoop #Gaming #Achievement`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onShare?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <Card 
        ref={cardRef}
        className={`relative overflow-hidden bg-gradient-to-br ${RARITY_COLORS[rarity]} ${RARITY_GLOW[rarity]} p-8 text-white`}
        data-testid="card-shareable-achievement"
      >
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <Badge 
                variant="outline" 
                className="border-white/30 text-white mb-3 backdrop-blur-sm bg-white/10"
                data-testid="badge-rarity"
              >
                {rarity.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                <img src={logoImage} alt="GG LOOP" className="h-6 w-6" />
                <span>GG LOOP</span>
              </div>
            </div>
            <Trophy className="h-12 w-12 text-white drop-shadow-lg" />
          </div>

          {/* Main Content */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2 leading-tight" data-testid="text-card-title">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/90 text-lg" data-testid="text-card-subtitle">
                {subtitle}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {points !== undefined && (
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-white/70 text-xs mb-1">POINTS EARNED</div>
                <div className="text-2xl font-bold font-mono" data-testid="text-card-points">
                  {points.toLocaleString()}
                </div>
              </div>
            )}
            {stat1Label && stat1Value && (
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-white/70 text-xs mb-1">{stat1Label}</div>
                <div className="text-2xl font-bold font-mono" data-testid="text-card-stat1">
                  {stat1Value}
                </div>
              </div>
            )}
            {stat2Label && stat2Value && (
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-white/70 text-xs mb-1">{stat2Label}</div>
                <div className="text-2xl font-bold font-mono" data-testid="text-card-stat2">
                  {stat2Value}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/20 pt-4">
            <div className="text-sm text-white/70" data-testid="text-card-username">
              @{username}
            </div>
            <div className="text-xs text-white/60">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </Card>

      {/* Share Actions */}
      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={shareToTwitter}
          data-testid="button-share-twitter"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share on X
        </Button>
        <Button 
          variant="outline"
          onClick={downloadAsImage}
          data-testid="button-download-card"
        >
          <Download className="w-4 h-4 mr-2" />
          Copy Text
        </Button>
      </div>
    </div>
  );
}
