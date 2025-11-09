import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";

interface GameCardProps {
  title: string;
  image: string;
  category: string;
  players: string;
  avgScore: string;
  challenges: number;
}

export default function GameCard({ title, image, category, players, avgScore, challenges }: GameCardProps) {
  return (
    <Card className="overflow-hidden cursor-pointer hover-elevate active-elevate-2" data-testid={`card-game-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
        
        <div className="absolute top-3 left-3">
          <Badge data-testid={`badge-category-${category.toLowerCase()}`}>
            {category}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <h3 className="text-xl font-bold">{title}</h3>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{players} players</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span>{avgScore} avg</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground font-medium">
            {challenges} Active Challenges
          </p>
        </div>
      </div>
    </Card>
  );
}
