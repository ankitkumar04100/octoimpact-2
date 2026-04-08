import { UserProfile, Achievement, SustainabilityAction } from '@/types';

export function computeLevel(tokens: number): number {
  if (tokens <= 0) return 1;
  return Math.min(Math.floor(Math.log2(tokens / 10 + 1)) + 1, 50);
}

export function getLevelProgress(tokens: number): {
  level: number;
  currentThreshold: number;
  nextThreshold: number;
  progress: number;
} {
  const level = computeLevel(tokens);
  const currentThreshold = level <= 1 ? 0 : (Math.pow(2, level - 1) - 1) * 10;
  const nextThreshold = (Math.pow(2, level) - 1) * 10;
  const progress = ((tokens - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return {
    level,
    currentThreshold,
    nextThreshold,
    progress: Math.min(Math.max(progress, 0), 100),
  };
}

export const ACHIEVEMENTS_CONFIG: Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  collection: 'streak' | 'impact' | 'finance' | 'governance';
}> = [
  { id: 'first-step', title: 'First Step Champion', description: 'Log your first sustainability action', icon: '🏆', target: 1, collection: 'impact' },
  { id: 'eco-warrior', title: 'Eco Warrior', description: 'Complete 50 sustainability actions', icon: '⚔️', target: 50, collection: 'impact' },
  { id: 'plastic-free', title: 'Plastic-Free Week', description: '7 no-plastic actions logged', icon: '🚫', target: 7, collection: 'impact' },
  { id: 'carbon-zero', title: 'Carbon Zero Hero', description: 'Achieve EcoScore of 80+', icon: '🌍', target: 80, collection: 'impact' },
  { id: 'energy-guardian', title: 'Energy Guardian', description: 'Log 20 energy-saving actions', icon: '⚡', target: 20, collection: 'impact' },
  { id: 'planet-protector', title: 'Planet Protector', description: 'Earn 1000 ImpactTokens', icon: '🛡️', target: 1000, collection: 'impact' },
  { id: 'finops-saver', title: 'FinOps Saver', description: 'Achieve FSI score of 70+', icon: '💰', target: 70, collection: 'finance' },
  { id: 'dao-steward', title: 'DAO Steward', description: 'Vote on 10 proposals', icon: '🏛️', target: 10, collection: 'governance' },
];

export function checkAchievements(
  user: UserProfile,
  actions: SustainabilityAction[],
  voteCount?: number
): Achievement[] {
  const actionCount = actions.length;
  const energyActions = actions.filter(a => a.category === 'energy').length;
  const plasticActions = actions.filter(a => a.type === 'no-plastic').length;

  return ACHIEVEMENTS_CONFIG.map(a => {
    let progress = 0;

    switch (a.id) {
      case 'first-step':
        progress = Math.min(actionCount, 1);
        break;
      case 'eco-warrior':
        progress = Math.min(actionCount, 50);
        break;
      case 'plastic-free':
        progress = Math.min(plasticActions, 7);
        break;
      case 'carbon-zero':
        progress = Math.min(user.ecoScore, 80);
        break;
      case 'energy-guardian':
        progress = Math.min(energyActions, 20);
        break;
      case 'planet-protector':
        progress = Math.min(user.totalTokens, 1000);
        break;
      case 'finops-saver':
        progress = Math.min(user.fsiScore, 70);
        break;
      case 'dao-steward':
        progress = Math.min(voteCount ?? 0, 10);
        break;
    }

    const earned = progress >= a.target;
    return {
      ...a,
      progress,
      earned,
      earnedAt: earned ? new Date() : undefined,
    };
  });
}

export function getMultiplierDescription(user: UserProfile): string[] {
  const items: string[] = [];
  const streakBonus = Math.min(user.streak, 50);
  if (streakBonus > 0) items.push(`🔥 Streak bonus: +${streakBonus}%`);

  const consistency = Math.min(Math.round(user.energyPoints / 10), 30);
  if (consistency > 0) items.push(`📈 Consistency: +${consistency}%`);

  const fsi = Math.min(Math.round(user.fsiScore / 5), 20);
  if (fsi > 0) items.push(`💰 FSI boost: +${fsi}%`);

  return items;
}
