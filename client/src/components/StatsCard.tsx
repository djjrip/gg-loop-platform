import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
}

export default function StatsCard({ title, value, icon: Icon, subtitle, trend }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="relative group"
      data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Glowing border on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl opacity-0 group-hover:opacity-75 blur transition-all duration-500" />

      {/* Main card */}
      <div className="relative bg-zinc-900/90 backdrop-blur border border-orange-500/20 rounded-xl p-6 overflow-hidden">
        {/* Animated grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255, 140, 66, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 140, 66, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        <div className="relative z-10 space-y-3">
          <motion.div
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center"
          >
            <Icon className="h-6 w-6 text-orange-500" />
          </motion.div>
          
          <div>
            <p className="text-xs text-orange-400/70 font-medium uppercase tracking-widest">{title}</p>
            <p className="text-4xl font-black font-mono mt-2 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
            {subtitle && <p className="text-xs text-zinc-500 mt-1" data-testid={`text-subtitle-${title.toLowerCase().replace(/\s+/g, '-')}`}>{subtitle}</p>}
            {trend && <p className="text-sm text-orange-500 font-semibold mt-2" data-testid={`text-trend-${title.toLowerCase().replace(/\s+/g, '-')}`}>{trend}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
