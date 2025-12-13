import CommunityFeedItem from '../CommunityFeedItem';

export default function CommunityFeedItemExample() {
  return (
    <div className="p-8 max-w-2xl space-y-4">
      <CommunityFeedItem
        username="ProGamer99"
        action="unlocked achievement"
        game="Tactical Warfare"
        details="Perfect Victory - Won match without losing a round"
        time="2m ago"
        type="achievement"
      />
      <CommunityFeedItem
        username="SkillMaster"
        action="set new high score"
        game="Speed Racer"
        details="Track Record: Neon City - 1:42.350"
        time="15m ago"
        type="highscore"
      />
    </div>
  );
}
