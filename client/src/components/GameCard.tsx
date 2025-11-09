import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="relative group"
      data-testid={`card-game-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      {/* Glowing border on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl opacity-0 group-hover:opacity-75 blur transition-all duration-500" />

      {/* Main card */}
      <div className="relative bg-zinc-900/90 backdrop-blur border border-orange-500/20 rounded-xl overflow-hidden">
        {/* Image section */}
        <div className="relative aspect-video overflow-hidden">
          <motion.img 
            src={image} 
            alt={title}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
          
          {/* Category badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-orange-500/90 text-black font-bold border-none" data-testid={`badge-category-${category.toLowerCase()}`}>
              {category}
            </Badge>
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(255, 140, 66, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 140, 66, 0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
        </div>

        {/* Content section */}
        <div className="p-5 space-y-3">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Users className="h-4 w-4 text-orange-500" />
              <span>{players} players</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span>{avgScore} avg</span>
            </div>
          </div>

          <div className="pt-2 border-t border-orange-500/20">
            <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider">
              {challenges} Active Challenges
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
