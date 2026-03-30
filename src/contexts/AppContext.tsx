import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  AuthMode, UserProfile, SustainabilityAction, FinTechTransaction,
  AIInsight, Badge, TokenLog, DAOProposal, Achievement, ACTION_TYPES,
} from '@/types';
import { computeActionImpact, computeEcoScore, computeStreak, generateAIInsights } from '@/engines/sustainability';
import { computeFSI } from '@/engines/fintech';
import { checkBadgeEligibility, generateTxHash } from '@/engines/tokenomics';
import { computeLevel, checkAchievements } from '@/engines/gamification';

interface AppContextType {
  authMode: AuthMode;
  user: UserProfile | null;
  actions: SustainabilityAction[];
  transactions: FinTechTransaction[];
  insights: AIInsight[];
  badges: Badge[];
  tokenLogs: TokenLog[];
  proposals: DAOProposal[];
  achievements: Achievement[];
  enterDemoMode: () => void;
  enterGuestMode: () => void;
  logAction: (actionType: string) => void;
  addTransactions: (txs: FinTechTransaction[]) => void;
  createProposal: (text: string, desc: string, durationDays: number) => void;
  vote: (proposalId: string, v: 'yes' | 'no') => void;
  resetDemo: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

const DAY = 86400000;

function makeDemoSeed() {
  const now = Date.now();
  const userId = 'demo-user';
  const types = Object.keys(ACTION_TYPES);

  const actions: SustainabilityAction[] = types.slice(0, 9).flatMap((type, i) => {
    const cfg = ACTION_TYPES[type];
    return [0, 1].map((j) => ({
      id: `demo-a-${i}-${j}`,
      userId,
      type,
      category: cfg.category,
      timestamp: new Date(now - (i + j) * DAY * 0.8 - Math.random() * DAY * 0.3),
      impactValue: cfg.baseImpact + Math.floor(Math.random() * 6),
      financialImpact: Math.round(Math.random() * 8),
      aiCategory: cfg.category,
      blockchainStatus: 'confirmed' as const,
      rewardMinted: true,
      tokensEarned: cfg.baseTokens + Math.floor(Math.random() * 4),
      co2Reduced: cfg.co2Reduction + Math.random() * 0.5,
    }));
  });

  const transactions: FinTechTransaction[] = [
    { id: 'tx1', userId, description: 'Organic Farmers Market', amount: 45, category: 'Food', classification: 'green', date: new Date(now - 2 * DAY), carbonIntensity: 0.1 },
    { id: 'tx2', userId, description: 'EV Charging Station', amount: 18, category: 'Transport', classification: 'green', date: new Date(now - 3 * DAY), carbonIntensity: 0.05 },
    { id: 'tx3', userId, description: 'Solar Panel Payment', amount: 120, category: 'Energy', classification: 'green', date: new Date(now - 5 * DAY), carbonIntensity: 0.02 },
    { id: 'tx4', userId, description: 'Thrift Store', amount: 25, category: 'Shopping', classification: 'green', date: new Date(now - 6 * DAY), carbonIntensity: 0.08 },
    { id: 'tx5', userId, description: 'Plant-Based Meal', amount: 32, category: 'Food', classification: 'green', date: new Date(now - DAY), carbonIntensity: 0.12 },
    { id: 'tx6', userId, description: 'Grocery Store', amount: 80, category: 'Food', classification: 'neutral', date: new Date(now - 2 * DAY), carbonIntensity: 0.35 },
    { id: 'tx7', userId, description: 'Office Supplies', amount: 30, category: 'Office', classification: 'neutral', date: new Date(now - 4 * DAY), carbonIntensity: 0.3 },
    { id: 'tx8', userId, description: 'Gas Station Fill-Up', amount: 55, category: 'Transport', classification: 'carbon-heavy', date: new Date(now - 3 * DAY), carbonIntensity: 0.85 },
    { id: 'tx9', userId, description: 'Fast Fashion Store', amount: 60, category: 'Shopping', classification: 'carbon-heavy', date: new Date(now - 8 * DAY), carbonIntensity: 0.75 },
    { id: 'tx10', userId, description: 'Airline Ticket', amount: 200, category: 'Transport', classification: 'carbon-heavy', date: new Date(now - 10 * DAY), carbonIntensity: 0.95 },
  ];

  const totalTokens = actions.reduce((s, a) => s + a.tokensEarned, 0);
  const todayTokens = actions.filter(a => now - a.timestamp.getTime() < DAY).reduce((s, a) => s + a.tokensEarned, 0);

  const user: UserProfile = {
    id: userId, name: 'Ankit Kumar', email: 'ankit@octoimpact.demo', avatarUrl: '',
    walletAddress: '0x7a3B...f91D', joinDate: new Date(now - 30 * DAY),
    ecoScore: computeEcoScore(actions), fsiScore: computeFSI(transactions),
    level: computeLevel(totalTokens), streak: 7,
    energyPoints: actions.reduce((s, a) => s + a.impactValue, 0),
    totalTokens, todayTokens,
  };

  const badges: Badge[] = [{
    id: 'bronze-streak', name: '7-Day Streak', description: 'Maintained a 7-day streak',
    tier: 'bronze', earnedAt: new Date(now - DAY), tokenId: 'NFT-demo-bronze',
    metadata: { tier: 'bronze', earnedBy: userId },
  }];

  const proposals: DAOProposal[] = [{
    id: 'prop-1', text: 'Fund community solar panels', description: 'Allocate 500 ImpactTokens to install solar panels in the community center.',
    createdAt: new Date(now - 3 * DAY), createdBy: 'community', status: 'active',
    yesVotes: 120, noVotes: 30, endTime: new Date(now + 4 * DAY), voters: [],
  }];

  return { user, actions, transactions, badges, proposals };
}

function makeGuestUser(): UserProfile {
  return {
    id: `guest-${Date.now()}`, name: 'Guest Explorer', email: '', avatarUrl: '',
    walletAddress: '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...guest',
    joinDate: new Date(), ecoScore: 0, fsiScore: 0, level: 1, streak: 0, energyPoints: 0,
    totalTokens: 0, todayTokens: 0,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [actions, setActions] = useState<SustainabilityAction[]>([]);
  const [transactions, setTransactions] = useState<FinTechTransaction[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [tokenLogs, setTokenLogs] = useState<TokenLog[]>([]);
  const [proposals, setProposals] = useState<DAOProposal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const refreshInsights = useCallback((u: UserProfile, acts: SustainabilityAction[]) => {
    const texts = generateAIInsights(u, acts);
    setInsights(texts.map((text, i) => ({
      id: `ins-${Date.now()}-${i}`, userId: u.id, text, type: 'insight' as const,
      generatedBy: 'AI' as const, timestamp: new Date(),
    })));
  }, []);

  const enterDemoMode = useCallback(() => {
    const seed = makeDemoSeed();
    setAuthMode('demo');
    setUser(seed.user);
    setActions(seed.actions);
    setTransactions(seed.transactions);
    setBadges(seed.badges);
    setProposals(seed.proposals);
    setTokenLogs(seed.actions.map((a, i) => ({
      id: `tl-${i}`, userId: seed.user.id, amount: a.tokensEarned, actionType: a.type,
      txHash: generateTxHash(), timestamp: a.timestamp, nftIssued: i === 0,
    })));
    setAchievements(checkAchievements(seed.user, seed.actions));
    refreshInsights(seed.user, seed.actions);
  }, [refreshInsights]);

  const enterGuestMode = useCallback(() => {
    const u = makeGuestUser();
    setAuthMode('guest');
    setUser(u);
    setActions([]);
    setTransactions([]);
    setBadges([]);
    setTokenLogs([]);
    setProposals([]);
    setAchievements(checkAchievements(u, []));
    refreshInsights(u, []);
  }, [refreshInsights]);

  const logAction = useCallback((actionType: string) => {
    if (!user) return;
    const cfg = ACTION_TYPES[actionType];
    if (!cfg) return;
    const result = computeActionImpact(actionType, user);

    const newAction: SustainabilityAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id, type: actionType, category: cfg.category,
      timestamp: new Date(), impactValue: result.impact, financialImpact: 0,
      aiCategory: cfg.category, blockchainStatus: 'pending', rewardMinted: false,
      tokensEarned: result.tokens, co2Reduced: result.co2,
    };

    const updatedActions = [newAction, ...actions];
    setActions(updatedActions);

    const newTotal = user.totalTokens + result.tokens;
    const updatedUser: UserProfile = {
      ...user,
      ecoScore: computeEcoScore(updatedActions),
      streak: computeStreak(updatedActions),
      totalTokens: newTotal,
      todayTokens: user.todayTokens + result.tokens,
      level: computeLevel(newTotal),
      energyPoints: user.energyPoints + result.impact,
      fsiScore: transactions.length > 0 ? computeFSI(transactions) : user.fsiScore,
    };
    setUser(updatedUser);

    const newBadges = checkBadgeEligibility(updatedUser, badges);
    if (newBadges.length > 0) setBadges(prev => [...prev, ...newBadges]);

    setTokenLogs(prev => [{
      id: `tl-${Date.now()}`, userId: user.id, amount: result.tokens, actionType,
      txHash: generateTxHash(), timestamp: new Date(), nftIssued: newBadges.length > 0,
    }, ...prev]);

    setAchievements(checkAchievements(updatedUser, updatedActions));
    refreshInsights(updatedUser, updatedActions);

    setTimeout(() => {
      setActions(prev => prev.map(a =>
        a.id === newAction.id ? { ...a, blockchainStatus: 'confirmed' as const, rewardMinted: true } : a
      ));
    }, 2000);
  }, [user, actions, transactions, badges, refreshInsights]);

  const addTransactions = useCallback((txs: FinTechTransaction[]) => {
    const updated = [...txs, ...transactions];
    setTransactions(updated);
    if (user) {
      const newFsi = computeFSI(updated);
      const updatedUser = { ...user, fsiScore: newFsi };
      setUser(updatedUser);
      refreshInsights(updatedUser, actions);
    }
  }, [transactions, user, actions, refreshInsights]);

  const createProposal = useCallback((text: string, desc: string, durationDays: number) => {
    setProposals(prev => [{
      id: `prop-${Date.now()}`, text, description: desc,
      createdAt: new Date(), createdBy: user?.name || 'Anonymous',
      status: 'active', yesVotes: 0, noVotes: 0,
      endTime: new Date(Date.now() + durationDays * DAY), voters: [],
    }, ...prev]);
  }, [user]);

  const vote = useCallback((proposalId: string, v: 'yes' | 'no') => {
    if (!user) return;
    const tokenWeight = Math.max(1, Math.floor(user.totalTokens / 10));
    setProposals(prev => prev.map(p => {
      if (p.id !== proposalId || p.voters.includes(user.id)) return p;
      return {
        ...p,
        yesVotes: v === 'yes' ? p.yesVotes + tokenWeight : p.yesVotes,
        noVotes: v === 'no' ? p.noVotes + tokenWeight : p.noVotes,
        voters: [...p.voters, user.id],
      };
    }));
  }, [user]);

  const resetDemo = useCallback(() => {
    enterDemoMode();
  }, [enterDemoMode]);

  const logout = useCallback(() => {
    setAuthMode(null);
    setUser(null);
    setActions([]);
    setTransactions([]);
    setInsights([]);
    setBadges([]);
    setTokenLogs([]);
    setProposals([]);
    setAchievements([]);
  }, []);

  return (
    <AppContext.Provider value={{
      authMode, user, actions, transactions, insights, badges, tokenLogs,
      proposals, achievements, enterDemoMode, enterGuestMode, logAction,
      addTransactions, createProposal, vote, resetDemo, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}
