import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
}

export default function StatsCard({ title, value, icon: Icon, subtitle, trend }: StatsCardProps) {
  return (
    <Card className="p-6 border-primary/40 hover:border-primary/80 transition-all hover:shadow-[0_0_30px_rgba(255,140,66,0.4)]" data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        
        <div>
          <p className="text-4xl font-bold font-mono" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1" data-testid={`text-subtitle-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className="text-sm text-primary font-medium mt-2" data-testid={`text-trend-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {trend}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
