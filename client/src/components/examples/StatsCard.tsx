import StatsCard from '../StatsCard';
import { Trophy } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <StatsCard
        title="Total Points"
        value="12,450"
        icon={Trophy}
        subtitle="All-time earnings"
        trend="+15% this week"
      />
    </div>
  );
}
