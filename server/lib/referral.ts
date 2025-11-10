import crypto from 'crypto';

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    const randomByte = crypto.randomBytes(1)[0];
    const index = randomByte % chars.length;
    code += chars[index];
  }
  
  return code;
}

export interface ReferralTier {
  minReferrals: number;
  pointsPerReferral: number;
  bonusPoints: number;
  name: string;
}

export const REFERRAL_TIERS: ReferralTier[] = [
  {
    minReferrals: 1,
    pointsPerReferral: 50,
    bonusPoints: 0,
    name: 'Bronze',
  },
  {
    minReferrals: 3,
    pointsPerReferral: 75,
    bonusPoints: 150,
    name: 'Silver',
  },
  {
    minReferrals: 10,
    pointsPerReferral: 100,
    bonusPoints: 500,
    name: 'Gold',
  },
  {
    minReferrals: 25,
    pointsPerReferral: 150,
    bonusPoints: 1500,
    name: 'Platinum',
  },
  {
    minReferrals: 50,
    pointsPerReferral: 200,
    bonusPoints: 5000,
    name: 'Diamond',
  },
];

export function calculateReferralReward(totalReferrals: number): { tier: ReferralTier | null; totalPoints: number } {
  let currentTier: ReferralTier | null = null;
  let totalPoints = 0;
  
  for (const tier of REFERRAL_TIERS) {
    if (totalReferrals >= tier.minReferrals) {
      currentTier = tier;
    }
  }
  
  if (!currentTier) {
    return { tier: null, totalPoints: 0 };
  }
  
  const reversedTiers = [...REFERRAL_TIERS].reverse();
  
  for (let i = 1; i <= totalReferrals; i++) {
    const tierForThisReferral = reversedTiers.find(t => i >= t.minReferrals) || REFERRAL_TIERS[0];
    totalPoints += tierForThisReferral.pointsPerReferral;
    
    const tierUnlocked = REFERRAL_TIERS.find(t => t.minReferrals === i);
    if (tierUnlocked) {
      totalPoints += tierUnlocked.bonusPoints;
    }
  }
  
  return { tier: currentTier, totalPoints };
}

export const FREE_TRIAL_DURATION_DAYS = 7;
export const FREE_TRIAL_DAILY_POINTS = 100;
export const FREE_TRIAL_QUEST_MILESTONES = [
  { day: 1, points: 50, title: 'Complete First Match', description: 'Report your first win' },
  { day: 3, points: 100, title: 'Stay Active', description: 'Play 3 matches this week' },
  { day: 5, points: 150, title: 'Build Momentum', description: 'Earn 500 total points' },
  { day: 7, points: 200, title: 'Trial Complete!', description: 'Subscribe to keep earning' },
];
