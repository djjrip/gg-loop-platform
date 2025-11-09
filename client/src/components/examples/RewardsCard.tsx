import RewardsCard from '../RewardsCard';

export default function RewardsCardExample() {
  return (
    <div className="p-8 max-w-sm space-y-4">
      <RewardsCard
        title="Gaming Headset"
        description="Premium wireless gaming headset with 7.1 surround sound"
        points={15000}
        isUnlocked={true}
        category="Gear"
      />
      <RewardsCard
        title="Elite Controller"
        description="Pro-grade controller with customizable buttons"
        points={25000}
        isUnlocked={false}
        category="Gear"
      />
    </div>
  );
}
