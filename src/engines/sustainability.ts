import { SustainabilityAction, UserProfile, ACTION_TYPES } from '@/types';

export function computeActionImpact(
  actionType: string,
  user: UserProfile
): { impact: number; tokens: number; co2: number } {
  const config = ACTION_TYPES[actionType];
  if (!config) return { impact: 0, tokens: 0, co2: 0 };

  const streakMultiplier = Math.min(1 + user.streak * 0.01, 1.5);
  const consistencyBonus = Math.min(user.energyPoints / 1000, 0.3);
  const fsiBoost = Math.min((user.fsiScore / 100) * 0.2, 0.2);
  const totalMultiplier = streakMultiplier + consistencyBonus + fsiBoost;

  return {
    impact: Math.round(config.baseImpact * totalMultiplier),
    tokens: Math.round(config.baseTokens * totalMultiplier),
    co2: Number((config.co2Reduction * totalMultiplier).toFixed(1)),
  };
}

export function computeEcoScore(actions: SustainabilityAction[]): number {
  if (actions.length === 0) return 0;
  const now = Date.now();
  const WEEK = 7 * 24 * 60 * 60 * 1000;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const action of actions) {
    const age = now - action.timestamp.getTime();
    const recencyWeight = Math.max(0, 1 - age / (4 * WEEK));
    weightedSum += action.impactValue * (0.3 + 0.7 * recencyWeight);
    totalWeight += 1;
  }

  const rawScore = (weightedSum / totalWeight) * Math.min(Math.log2(totalWeight + 1), 5);
  return Math.min(Math.round(rawScore), 100);
}

export function computeStreak(actions: SustainabilityAction[]): number {
  if (actions.length === 0) return 0;
  const sorted = [...actions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const DAY = 24 * 60 * 60 * 1000;

  let streak = 1;
  const currentDay = new Date(sorted[0].timestamp);
  currentDay.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (currentDay.getTime() < today.getTime() - DAY) return 0;

  let prevDay = currentDay;
  for (let i = 1; i < sorted.length; i++) {
    const actionDay = new Date(sorted[i].timestamp);
    actionDay.setHours(0, 0, 0, 0);
    const diff = prevDay.getTime() - actionDay.getTime();
    if (diff === DAY) {
      streak++;
      prevDay = actionDay;
    } else if (diff > DAY) {
      break;
    }
  }

  return streak;
}

export function generateAIInsights(user: UserProfile, actions: SustainabilityAction[]): string[] {
  const insights: string[] = [];
  const recent = actions.filter(a => Date.now() - a.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000);
  const categories = new Set(recent.map(a => a.category));

  if (user.streak >= 7) {
    insights.push(`🔥 Amazing ${user.streak}-day streak! Your consistency is boosting rewards by ${Math.min(user.streak, 50)}%.`);
  } else if (user.streak >= 3) {
    insights.push(`📈 ${user.streak}-day streak building! Keep going for bonus multipliers at day 7.`);
  } else {
    insights.push('💡 Start a streak today! Consecutive daily actions unlock up to 50% bonus tokens.');
  }

  if (!categories.has('diet')) {
    insights.push('🥗 Try a vegetarian day — it\'s one of the highest-impact actions at 3.5 kg CO₂ saved!');
  }
  if (!categories.has('energy')) {
    insights.push('⚡ Energy-saving actions are underrepresented in your profile. Small changes = big impact.');
  }
  if (user.ecoScore > 70) {
    insights.push(`🌟 EcoScore ${user.ecoScore}/100 — you're in the top tier! Focus on maintaining consistency.`);
  } else if (user.ecoScore > 40) {
    insights.push(`📊 EcoScore ${user.ecoScore}/100 — solid progress! Diversify your actions to push past 70.`);
  } else {
    insights.push(`🌱 EcoScore ${user.ecoScore}/100 — every action counts. Try 2-3 different categories this week.`);
  }

  if (user.fsiScore < 50) {
    insights.push('💰 Your Financial Sustainability Index is low. Consider shifting spending toward green alternatives.');
  }

  const totalCo2 = recent.reduce((sum, a) => sum + a.co2Reduced, 0);
  if (totalCo2 > 0) {
    insights.push(`🌍 You've saved ${totalCo2.toFixed(1)} kg CO₂ this week — equivalent to ${(totalCo2 / 2.3).toFixed(0)} car-free miles!`);
  }

  return insights.slice(0, 5);
}

export function generateNextActions(user: UserProfile, actions: SustainabilityAction[]): Array<{ type: string; label: string; estimatedCo2: number; icon: string }> {
  const recentTypes = new Set(actions.slice(0, 10).map(a => a.type));
  const suggestions: Array<{ type: string; label: string; estimatedCo2: number; icon: string }> = [];

  for (const [type, config] of Object.entries(ACTION_TYPES)) {
    if (!recentTypes.has(type) && suggestions.length < 5) {
      suggestions.push({
        type,
        label: config.label,
        estimatedCo2: Math.round(config.co2Reduction * (1 + user.streak * 0.01) * 10) / 10,
        icon: config.icon,
      });
    }
  }

  if (suggestions.length < 3) {
    for (const [type, config] of Object.entries(ACTION_TYPES)) {
      if (suggestions.length < 5 && !suggestions.find(s => s.type === type)) {
        suggestions.push({ type, label: config.label, estimatedCo2: config.co2Reduction, icon: config.icon });
      }
    }
  }

  return suggestions;
}
