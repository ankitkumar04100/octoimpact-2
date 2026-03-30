export type AuthMode = 'demo' | 'guest' | 'email' | 'google' | null;
export type ActionCategory = 'transport' | 'energy' | 'diet' | 'lifestyle' | 'shopping' | 'home';
export type TransactionType = 'green' | 'neutral' | 'carbon-heavy';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  walletAddress: string;
  joinDate: Date;
  ecoScore: number;
  fsiScore: number;
  level: number;
  streak: number;
  energyPoints: number;
  totalTokens: number;
  todayTokens: number;
}

export interface SustainabilityAction {
  id: string;
  userId: string;
  type: string;
  category: ActionCategory;
  timestamp: Date;
  impactValue: number;
  financialImpact: number;
  aiCategory: string;
  blockchainStatus: 'pending' | 'confirmed' | 'error';
  rewardMinted: boolean;
  tokensEarned: number;
  co2Reduced: number;
}

export interface AIInsight {
  id: string;
  userId: string;
  text: string;
  type: 'action' | 'insight' | 'warning' | 'goal' | 'tip';
  generatedBy: 'AI';
  timestamp: Date;
}

export interface FinTechTransaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  classification: TransactionType;
  date: Date;
  carbonIntensity: number;
}

export interface TokenLog {
  id: string;
  userId: string;
  amount: number;
  actionType: string;
  txHash: string;
  timestamp: Date;
  nftIssued: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  earnedAt: Date;
  tokenId: string;
  metadata: Record<string, string>;
}

export interface DAOProposal {
  id: string;
  text: string;
  description: string;
  createdAt: Date;
  createdBy: string;
  status: 'active' | 'passed' | 'rejected' | 'expired';
  yesVotes: number;
  noVotes: number;
  endTime: Date;
  voters: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
  progress: number;
  target: number;
}

export const ACTION_TYPES: Record<string, {
  label: string;
  category: ActionCategory;
  baseImpact: number;
  baseTokens: number;
  co2Reduction: number;
  icon: string;
}> = {
  'public-transport': { label: 'Public Transport', category: 'transport', baseImpact: 15, baseTokens: 10, co2Reduction: 2.5, icon: '🚌' },
  'cycling': { label: 'Cycling', category: 'transport', baseImpact: 20, baseTokens: 12, co2Reduction: 3.0, icon: '🚴' },
  'walking': { label: 'Walking', category: 'transport', baseImpact: 18, baseTokens: 8, co2Reduction: 2.8, icon: '🚶' },
  'carpooling': { label: 'Carpooling', category: 'transport', baseImpact: 12, baseTokens: 8, co2Reduction: 1.8, icon: '🚗' },
  'power-saving': { label: 'Power Saving', category: 'energy', baseImpact: 14, baseTokens: 9, co2Reduction: 2.0, icon: '⚡' },
  'ac-optimization': { label: 'AC Optimization', category: 'energy', baseImpact: 16, baseTokens: 10, co2Reduction: 2.2, icon: '❄️' },
  'veg-day': { label: 'Vegetarian Day', category: 'diet', baseImpact: 22, baseTokens: 14, co2Reduction: 3.5, icon: '🥗' },
  'no-plastic': { label: 'No Plastic Day', category: 'lifestyle', baseImpact: 18, baseTokens: 11, co2Reduction: 2.6, icon: '♻️' },
  'reusable-bottle': { label: 'Reusable Bottle', category: 'lifestyle', baseImpact: 10, baseTokens: 6, co2Reduction: 1.2, icon: '🫗' },
  'led-bulbs': { label: 'LED Bulbs', category: 'home', baseImpact: 20, baseTokens: 13, co2Reduction: 3.2, icon: '💡' },
  'water-conservation': { label: 'Water Conservation', category: 'home', baseImpact: 16, baseTokens: 10, co2Reduction: 2.4, icon: '💧' },
  'eco-shopping': { label: 'Eco Shopping', category: 'shopping', baseImpact: 14, baseTokens: 9, co2Reduction: 2.0, icon: '🛍️' },
};

export const TIER_COLORS: Record<Badge['tier'], string> = {
  bronze: 'from-amber-600 to-amber-400',
  silver: 'from-slate-400 to-slate-200',
  gold: 'from-yellow-500 to-yellow-300',
  platinum: 'from-cyan-400 to-teal-300',
  legendary: 'from-purple-500 to-pink-400',
};
