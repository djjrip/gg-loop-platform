export interface AchievementDefinition {
  id: string;
  game: 'league' | 'valorant' | 'tft';
  title: string;
  description: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: AchievementCondition;
}

export interface AchievementCondition {
  type: 'win_count' | 'win_streak' | 'total_matches' | 'rank_achieved' | 'kda' | 'placement';
  threshold?: number;
  streak?: number;
  rank?: string;
  kda?: number;
  placement?: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ===== LEAGUE OF LEGENDS =====
  {
    id: 'lol_first_win',
    game: 'league',
    title: 'First Blood',
    description: 'Win your first League of Legends match',
    points: 50,
    rarity: 'common',
    condition: { type: 'win_count', threshold: 1 }
  },
  {
    id: 'lol_5_wins',
    game: 'league',
    title: 'Summoner\'s Journey',
    description: 'Win 5 League of Legends matches',
    points: 100,
    rarity: 'common',
    condition: { type: 'win_count', threshold: 5 }
  },
  {
    id: 'lol_10_wins',
    game: 'league',
    title: 'Rift Warrior',
    description: 'Win 10 League of Legends matches',
    points: 200,
    rarity: 'rare',
    condition: { type: 'win_count', threshold: 10 }
  },
  {
    id: 'lol_25_wins',
    game: 'league',
    title: 'Veteran Summoner',
    description: 'Win 25 League of Legends matches',
    points: 500,
    rarity: 'epic',
    condition: { type: 'win_count', threshold: 25 }
  },
  {
    id: 'lol_50_wins',
    game: 'league',
    title: 'League Legend',
    description: 'Win 50 League of Legends matches',
    points: 1000,
    rarity: 'legendary',
    condition: { type: 'win_count', threshold: 50 }
  },
  {
    id: 'lol_3_streak',
    game: 'league',
    title: 'Hot Streak',
    description: 'Win 3 League matches in a row',
    points: 150,
    rarity: 'rare',
    condition: { type: 'win_streak', streak: 3 }
  },
  {
    id: 'lol_5_streak',
    game: 'league',
    title: 'Unstoppable',
    description: 'Win 5 League matches in a row',
    points: 400,
    rarity: 'epic',
    condition: { type: 'win_streak', streak: 5 }
  },
  {
    id: 'lol_10_streak',
    game: 'league',
    title: 'Godlike',
    description: 'Win 10 League matches in a row',
    points: 1500,
    rarity: 'legendary',
    condition: { type: 'win_streak', streak: 10 }
  },
  {
    id: 'lol_100_matches',
    game: 'league',
    title: 'Summoner\'s Dedication',
    description: 'Play 100 League of Legends matches',
    points: 750,
    rarity: 'epic',
    condition: { type: 'total_matches', threshold: 100 }
  },

  // ===== VALORANT =====
  {
    id: 'val_first_win',
    game: 'valorant',
    title: 'First Strike',
    description: 'Win your first Valorant match',
    points: 50,
    rarity: 'common',
    condition: { type: 'win_count', threshold: 1 }
  },
  {
    id: 'val_5_wins',
    game: 'valorant',
    title: 'Agent Rising',
    description: 'Win 5 Valorant matches',
    points: 100,
    rarity: 'common',
    condition: { type: 'win_count', threshold: 5 }
  },
  {
    id: 'val_10_wins',
    game: 'valorant',
    title: 'Tactical Specialist',
    description: 'Win 10 Valorant matches',
    points: 200,
    rarity: 'rare',
    condition: { type: 'win_count', threshold: 10 }
  },
  {
    id: 'val_25_wins',
    game: 'valorant',
    title: 'Radiant Warrior',
    description: 'Win 25 Valorant matches',
    points: 500,
    rarity: 'epic',
    condition: { type: 'win_count', threshold: 25 }
  },
  {
    id: 'val_50_wins',
    game: 'valorant',
    title: 'Valorant Elite',
    description: 'Win 50 Valorant matches',
    points: 1000,
    rarity: 'legendary',
    condition: { type: 'win_count', threshold: 50 }
  },
  {
    id: 'val_3_streak',
    game: 'valorant',
    title: 'Sharp Shooter',
    description: 'Win 3 Valorant matches in a row',
    points: 150,
    rarity: 'rare',
    condition: { type: 'win_streak', streak: 3 }
  },
  {
    id: 'val_5_streak',
    game: 'valorant',
    title: 'Ace Commander',
    description: 'Win 5 Valorant matches in a row',
    points: 400,
    rarity: 'epic',
    condition: { type: 'win_streak', streak: 5 }
  },
  {
    id: 'val_10_streak',
    game: 'valorant',
    title: 'Tactical Genius',
    description: 'Win 10 Valorant matches in a row',
    points: 1500,
    rarity: 'legendary',
    condition: { type: 'win_streak', streak: 10 }
  },
  {
    id: 'val_100_matches',
    game: 'valorant',
    title: 'Agent\'s Dedication',
    description: 'Play 100 Valorant matches',
    points: 750,
    rarity: 'epic',
    condition: { type: 'total_matches', threshold: 100 }
  },

  // ===== TEAMFIGHT TACTICS (TFT) =====
  {
    id: 'tft_first_top4',
    game: 'tft',
    title: 'Into the Arena',
    description: 'Finish Top 4 in your first TFT match',
    points: 50,
    rarity: 'common',
    condition: { type: 'placement', placement: 4 }
  },
  {
    id: 'tft_first_win',
    game: 'tft',
    title: 'Victory Royale',
    description: 'Win your first TFT match (1st place)',
    points: 100,
    rarity: 'rare',
    condition: { type: 'win_count', threshold: 1 }
  },
  {
    id: 'tft_5_wins',
    game: 'tft',
    title: 'Tactician\'s Path',
    description: 'Win 5 TFT matches',
    points: 200,
    rarity: 'rare',
    condition: { type: 'win_count', threshold: 5 }
  },
  {
    id: 'tft_10_wins',
    game: 'tft',
    title: 'Master Strategist',
    description: 'Win 10 TFT matches',
    points: 400,
    rarity: 'epic',
    condition: { type: 'win_count', threshold: 10 }
  },
  {
    id: 'tft_25_wins',
    game: 'tft',
    title: 'TFT Champion',
    description: 'Win 25 TFT matches',
    points: 1000,
    rarity: 'legendary',
    condition: { type: 'win_count', threshold: 25 }
  },
  {
    id: 'tft_3_streak',
    game: 'tft',
    title: 'Hot Hand',
    description: 'Win 3 TFT matches in a row',
    points: 300,
    rarity: 'epic',
    condition: { type: 'win_streak', streak: 3 }
  },
  {
    id: 'tft_5_streak',
    game: 'tft',
    title: 'Unbeatable Tactician',
    description: 'Win 5 TFT matches in a row',
    points: 800,
    rarity: 'legendary',
    condition: { type: 'win_streak', streak: 5 }
  },
  {
    id: 'tft_50_matches',
    game: 'tft',
    title: 'Arena Veteran',
    description: 'Play 50 TFT matches',
    points: 500,
    rarity: 'epic',
    condition: { type: 'total_matches', threshold: 50 }
  },
  {
    id: 'tft_100_matches',
    game: 'tft',
    title: 'Tactician\'s Dedication',
    description: 'Play 100 TFT matches',
    points: 1000,
    rarity: 'legendary',
    condition: { type: 'total_matches', threshold: 100 }
  },
];

export function getAchievementDefinition(achievementId: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find(def => def.id === achievementId);
}

export function getGameAchievements(game: 'league' | 'valorant' | 'tft'): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter(def => def.game === game);
}
