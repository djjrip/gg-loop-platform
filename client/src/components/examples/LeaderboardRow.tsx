import LeaderboardRow from '../LeaderboardRow';

export default function LeaderboardRowExample() {
  return (
    <div className="p-8 max-w-2xl space-y-2">
      <LeaderboardRow rank={1} username="ProGamer99" score="45,230" games={342} />
      <LeaderboardRow rank={2} username="SkillMaster" score="42,150" games={318} />
      <LeaderboardRow rank={3} username="GameChamp" score="39,890" games={295} isCurrentUser />
    </div>
  );
}
