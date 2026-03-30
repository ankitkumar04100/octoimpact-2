import { UserProfile, Badge } from '@/types';

export const BADGE_THRESHOLDS = [
  {
    id: 'bronze-streak',
    name: '7-Day Streak',
    description: 'Maintained a 7-day sustainability streak',
    tier: 'bronze' as const,
    condition: (u: UserProfile) => u.streak >= 7,
  },
  {
    id: 'silver-streak',
    name: '30-Day Streak',
    description: '30 consecutive days of eco actions',
    tier: 'silver' as const,
    condition: (u: UserProfile) => u.streak >= 30,
  },
  {
    id: 'gold-streak',
    name: '60-Day Streak',
    description: '60 consecutive days — true dedication',
    tier: 'gold' as const,
    condition: (u: UserProfile) => u.streak >= 60,
  },
  {
    id: 'platinum-tokens',
    name: 'Platinum Earner',
    description: 'Earned 500+ ImpactTokens',
    tier: 'platinum' as const,
    condition: (u: UserProfile) => u.totalTokens >= 500,
  },
  {
    id: 'legendary',
    name: 'Legendary Supporter',
    description: 'Long-term sustainability champion',
    tier: 'legendary' as const,
    condition: (u: UserProfile) => u.totalTokens >= 1000 && u.streak >= 90,
  },
];

export function checkBadgeEligibility(user: UserProfile, existingBadges: Badge[]): Badge[] {
  const newBadges: Badge[] = [];

  for (const threshold of BADGE_THRESHOLDS) {
    const alreadyHas = existingBadges.some(b => b.id === threshold.id);
    if (!alreadyHas && threshold.condition(user)) {
      newBadges.push({
        id: threshold.id,
        name: threshold.name,
        description: threshold.description,
        tier: threshold.tier,
        earnedAt: new Date(),
        tokenId: `NFT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        metadata: { tier: threshold.tier, earnedBy: user.id },
      });
    }
  }

  return newBadges;
}

export function generateTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export function computeTokenReward(
  baseTokens: number,
  streak: number,
  fsiScore: number,
  energyPoints: number
): number {
  const streakMult = Math.min(1 + streak * 0.01, 1.5);
  const consistencyBonus = Math.min(energyPoints / 1000, 0.3);
  const fsiBoost = Math.min((fsiScore / 100) * 0.2, 0.2);
  return Math.round(baseTokens * (streakMult + consistencyBonus + fsiBoost));
}
