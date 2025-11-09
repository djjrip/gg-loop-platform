import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface GameCardProps {
  title: string;
  image: string;
  category: string;
  players: string;
  avgScore: string;
  challenges: number;
}

export default function GameCard({ title, image, category, players, avgScore, challenges }: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${-mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`
          : 'none',
        transition: 'transform 0.1s ease-out',
      }}
      data-testid={`card-game-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <Card className="overflow-hidden cursor-pointer group border-primary/20 relative">
        {/* Glowing border effect */}
        <motion.div
          className="absolute inset-0 rounded-lg z-0"
          animate={{
            boxShadow: isHovered
              ? [
                  '0 0 20px rgba(255, 140, 66, 0.3)',
                  '0 0 40px rgba(255, 140, 66, 0.6)',
                  '0 0 20px rgba(255, 140, 66, 0.3)',
                ]
              : 'none',
          }}
          transition={{
            duration: 1.5,
            repeat: isHovered ? Infinity : 0,
            repeatType: "reverse",
          }}
        />

        <div className="relative aspect-video overflow-hidden">
          <motion.img 
            src={image} 
            alt={title}
            className="h-full w-full object-cover opacity-70"
            animate={{
              scale: isHovered ? 1.15 : 1,
              opacity: isHovered ? 0.85 : 0.7,
            }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Animated scan line */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-8"
            animate={{
              y: isHovered ? ['-100%', '100%'] : '0%',
            }}
            transition={{
              duration: 2,
              repeat: isHovered ? Infinity : 0,
              ease: "linear",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent opacity-90" />
          
          <motion.div
            className="absolute top-3 left-3 z-10"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="bg-background/90 backdrop-blur-sm" data-testid={`badge-category-${category.toLowerCase()}`}>
              {category}
            </Badge>
          </motion.div>

          {/* Holographic overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 140, 66, 0) 0%, rgba(255, 140, 66, 0.1) 50%, rgba(255, 140, 66, 0) 100%)',
            }}
            animate={{
              x: isHovered ? ['-100%', '100%'] : '0%',
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
            }}
          />
        </div>
        
        <div className="p-4 space-y-3 relative z-10">
          <h3 className="text-xl font-semibold" data-testid={`text-game-title-${title.toLowerCase().replace(/\s/g, '-')}`}>
            {title}
          </h3>
          
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

          <motion.div
            className="pt-2 border-t border-primary/20"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ transformOrigin: 'left' }}
          >
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary" data-testid={`text-challenges-${title.toLowerCase().replace(/\s/g, '-')}`}>
                {challenges}
              </span> active challenges
            </p>
          </motion.div>
        </div>

        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>
    </motion.div>
  );
}
