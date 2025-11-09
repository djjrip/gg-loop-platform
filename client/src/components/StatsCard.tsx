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
    <Card className="p-6" data-testid={`card-stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-1">
        <p className="text-4xl font-bold font-mono tracking-tight" data-testid={`text-value-${title.toLowerCase().replace(/\s/g, '-')}`}>
          {value}
        </p>
        
        {subtitle && (
          <p className="text-sm text-muted-foreground" data-testid={`text-subtitle-${title.toLowerCase().replace(/\s/g, '-')}`}>
            {subtitle}
          </p>
        )}
        
        {trend && (
          <p className="text-sm font-medium text-primary" data-testid={`text-trend-${title.toLowerCase().replace(/\s/g, '-')}`}>
            {trend}
          </p>
        )}
      </div>
    </Card>
  );
}
