import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
}

export default function StatsCard({ title, value, icon: Icon, subtitle, trend }: StatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      data-testid={`card-stat-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-background relative overflow-hidden group">
        {/* Animated neon border */}
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 140, 66, 0.4), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: isHovered ? ['0% 0%', '200% 0%'] : '0% 0%',
          }}
          transition={{
            duration: 1.5,
            repeat: isHovered ? Infinity : 0,
          }}
        />
        
        {/* Holographic shine effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(255, 140, 66, 0.1) 50%, transparent 100%)',
          }}
          animate={{
            x: isHovered ? ['-100%', '100%'] : '0%',
          }}
          transition={{
            duration: 1,
            repeat: isHovered ? Infinity : 0,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <motion.div
              animate={{
                rotate: isHovered ? 360 : 0,
                scale: isHovered ? 1.2 : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="h-5 w-5 text-primary" style={{
                filter: 'drop-shadow(0 0 8px rgba(255, 140, 66, 0.6))',
              }} />
            </motion.div>
          </div>
          
          <div className="space-y-1">
            <motion.p
              className="text-4xl font-bold font-mono tracking-tight"
              data-testid={`text-value-${title.toLowerCase().replace(/\s/g, '-')}`}
              animate={{
                textShadow: isHovered ? [
                  '0 0 5px rgba(255, 140, 66, 0.2)',
                  '0 0 15px rgba(255, 140, 66, 0.6)',
                  '0 0 5px rgba(255, 140, 66, 0.2)',
                ] : 'none',
              }}
              transition={{
                duration: 1,
                repeat: isHovered ? Infinity : 0,
                repeatType: "reverse",
              }}
            >
              {value}
            </motion.p>
            
            {subtitle && (
              <p className="text-sm text-muted-foreground" data-testid={`text-subtitle-${title.toLowerCase().replace(/\s/g, '-')}`}>
                {subtitle}
              </p>
            )}
            
            {trend && (
              <motion.p
                className="text-sm font-medium text-primary"
                data-testid={`text-trend-${title.toLowerCase().replace(/\s/g, '-')}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {trend}
              </motion.p>
            )}
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/40" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/40" />
      </Card>
    </motion.div>
  );
}
