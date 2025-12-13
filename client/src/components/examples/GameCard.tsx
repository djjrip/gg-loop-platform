import GameCard from '../GameCard';
import fpsImage from '@assets/generated_images/FPS_game_thumbnail_ffb034b2.png';

export default function GameCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <GameCard
        title="Tactical Warfare"
        image={fpsImage}
        category="FPS"
        players="250K"
        avgScore="2,450"
        challenges={12}
      />
    </div>
  );
}
