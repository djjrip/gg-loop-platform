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
    <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group border-primary/10" data-testid={`card-game-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-background/90 backdrop-blur-sm" data-testid={`badge-category-${category.toLowerCase()}`}>
            {category}
          </Badge>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <h3 className="text-xl font-semibold" data-testid={`text-game-title-${title.toLowerCase().replace(/\s/g, '-')}`}>{title}</h3>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span data-testid={`text-players-${title.toLowerCase().replace(/\s/g, '-')}`}>{players}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="font-mono" data-testid={`text-avg-score-${title.toLowerCase().replace(/\s/g, '-')}`}>{avgScore}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary" data-testid={`text-challenges-${title.toLowerCase().replace(/\s/g, '-')}`}>{challenges}</span> active challenges
          </p>
        </div>
      </div>
    </Card>
  );
}
