import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  AuthMode, UserProfile, SustainabilityAction, FinTechTransaction,
  AIInsight, Badge, TokenLog, DAOProposal, Achievement, ACTION_TYPES,
} from '@/types';
import { computeActionImpact, computeEcoScore, computeStreak, generateAIInsights } from '@/engines/sustainability';
import { computeFSI } from '@/engines/fintech';
import { checkBadgeEligibility, generateTxHash } from '@/engines/tokenomics';
import { computeLevel, checkAchievements } from '@/engines/gamification';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

interface AppContextType {
  authMode: AuthMode;
  user: UserProfile | null;
  session: Session | null;
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
  fetchAIInsights: () => Promise<void>;
  authLoading: boolean;
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
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [actions, setActions] = useState<SustainabilityAction[]>([]);
  const [transactions, setTransactions] = useState<FinTechTransaction[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [tokenLogs, setTokenLogs] = useState<TokenLog[]>([]);
  const [proposals, setProposals] = useState<DAOProposal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      setSession(sess);
      if (sess?.user && authMode !== 'demo' && authMode !== 'guest') {
        const provider = sess.user.app_metadata?.provider;
        setAuthMode(provider === 'google' ? 'google' : 'email');
        // Load profile
        setTimeout(async () => {
          await loadUserData(sess.user.id);
        }, 0);
      } else if (!sess && authMode !== 'demo' && authMode !== 'guest') {
        setAuthMode(null);
        setUser(null);
      }
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        const provider = s.user.app_metadata?.provider;
        setAuthMode(provider === 'google' ? 'google' : 'email');
        loadUserData(s.user.id);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name || '',
          email: profile.email || '',
          avatarUrl: profile.avatar_url || '',
          walletAddress: profile.wallet_address || '',
          joinDate: new Date(profile.join_date),
          ecoScore: Number(profile.eco_score) || 0,
          fsiScore: Number(profile.fsi_score) || 0,
          level: profile.level || 1,
          streak: profile.streak || 0,
          energyPoints: Number(profile.energy_points) || 0,
          totalTokens: profile.total_tokens || 0,
          todayTokens: profile.today_tokens || 0,
        });
      }

      // Load actions
      const { data: dbActions } = await supabase.from('actions').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(100);
      if (dbActions) {
        setActions(dbActions.map(a => ({
          id: a.id, userId: a.user_id, type: a.type, category: a.category as any,
          timestamp: new Date(a.timestamp), impactValue: Number(a.impact_value),
          financialImpact: Number(a.financial_impact), aiCategory: a.ai_category || '',
          blockchainStatus: a.blockchain_status as any, rewardMinted: a.reward_minted,
          tokensEarned: a.tokens_earned, co2Reduced: Number(a.co2_reduced),
        })));
      }

      // Load insights
      const { data: dbInsights } = await supabase.from('insights').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(20);
      if (dbInsights) {
        setInsights(dbInsights.map(i => ({
          id: i.id, userId: i.user_id, text: i.text, type: i.type as any,
          generatedBy: 'AI' as const, timestamp: new Date(i.timestamp),
        })));
      }

      // Load token logs
      const { data: dbTokenLogs } = await supabase.from('token_logs').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(50);
      if (dbTokenLogs) {
        setTokenLogs(dbTokenLogs.map(l => ({
          id: l.id, userId: l.user_id, amount: l.amount, actionType: l.action_type,
          txHash: l.tx_hash, timestamp: new Date(l.timestamp), nftIssued: l.nft_issued,
        })));
      }

      // Load badges
      const { data: dbBadges } = await supabase.from('badges').select('*').eq('user_id', userId);
      if (dbBadges) {
        setBadges(dbBadges.map(b => ({
          id: b.badge_id, name: b.name, description: b.description || '',
          tier: b.tier as any, earnedAt: new Date(b.earned_at),
          tokenId: b.token_id || '', metadata: (b.metadata as Record<string, string>) || {},
        })));
      }

      // Load proposals
      const { data: dbProposals } = await supabase.from('proposals').select('*').order('created_at', { ascending: false });
      if (dbProposals) {
        setProposals(dbProposals.map(p => ({
          id: p.id, text: p.text, description: p.description || '',
          createdAt: new Date(p.created_at), createdBy: p.created_by_name || 'Anonymous',
          status: p.status as any, yesVotes: p.yes_votes, noVotes: p.no_votes,
          endTime: new Date(p.end_time), voters: [],
        })));
      }

      // Load user's votes to populate voters array
      const { data: dbVotes } = await supabase.from('votes').select('*').eq('user_id', userId);
      if (dbVotes && dbVotes.length > 0) {
        setProposals(prev => prev.map(p => ({
          ...p,
          voters: dbVotes.filter(v => v.proposal_id === p.id).map(v => v.user_id),
        })));
      }

      // Compute achievements from loaded data
      if (profile) {
        const u: UserProfile = {
          id: profile.id, name: profile.name || '', email: profile.email || '',
          avatarUrl: '', walletAddress: '', joinDate: new Date(),
          ecoScore: Number(profile.eco_score), fsiScore: Number(profile.fsi_score),
          level: profile.level || 1, streak: profile.streak || 0,
          energyPoints: Number(profile.energy_points), totalTokens: profile.total_tokens || 0,
          todayTokens: profile.today_tokens || 0,
        };
        setAchievements(checkAchievements(u, dbActions?.map(a => ({
          id: a.id, userId: a.user_id, type: a.type, category: a.category as any,
          timestamp: new Date(a.timestamp), impactValue: Number(a.impact_value),
          financialImpact: Number(a.financial_impact), aiCategory: a.ai_category || '',
          blockchainStatus: a.blockchain_status as any, rewardMinted: a.reward_minted,
          tokensEarned: a.tokens_earned, co2Reduced: Number(a.co2_reduced),
        })) || []));
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const refreshInsights = useCallback((u: UserProfile, acts: SustainabilityAction[]) => {
    const texts = generateAIInsights(u, acts);
    setInsights(texts.map((text, i) => ({
      id: `ins-${Date.now()}-${i}`, userId: u.id, text, type: 'insight' as const,
      generatedBy: 'AI' as const, timestamp: new Date(),
    })));
  }, []);

  const fetchAIInsights = useCallback(async () => {
    if (!user) return;
    try {
      const recentActions = actions.slice(0, 14).map(a => ({
        type: a.type, category: a.category, co2: a.co2Reduced, tokens: a.tokensEarned,
        date: a.timestamp.toISOString().split('T')[0],
      }));

      const categories: Record<string, number> = {};
      for (const a of actions) categories[a.category] = (categories[a.category] || 0) + 1;

      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          ecoScore: user.ecoScore, fsiScore: user.fsiScore,
          streak: user.streak, level: user.level, totalTokens: user.totalTokens,
          recentActions, categories,
          alerts: [],
        },
      });

      if (error) throw error;
      if (data && !data.error) {
        const newInsights: AIInsight[] = [];
        if (data.weeklyInsight) {
          newInsights.push({ id: `ai-weekly-${Date.now()}`, userId: user.id, text: data.weeklyInsight, type: 'insight', generatedBy: 'AI', timestamp: new Date() });
        }
        if (data.nextStep) {
          newInsights.push({ id: `ai-next-${Date.now()}`, userId: user.id, text: `Next step: ${data.nextStep}`, type: 'goal', generatedBy: 'AI', timestamp: new Date() });
        }
        if (data.dailyActions) {
          for (const da of data.dailyActions) {
            newInsights.push({
              id: `ai-action-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              userId: user.id, text: `${da.action} (~${da.co2Points} CO₂ pts) — ${da.reason}`,
              type: 'action', generatedBy: 'AI', timestamp: new Date(),
            });
          }
        }
        if (data.ticker) {
          newInsights.push({ id: `ai-ticker-${Date.now()}`, userId: user.id, text: data.ticker, type: 'tip', generatedBy: 'AI', timestamp: new Date() });
        }
        setInsights(newInsights);

        // Persist insights for authenticated users
        if (session && newInsights.length > 0) {
          const rows = newInsights.map(i => ({
            user_id: session.user.id, text: i.text, type: i.type, generated_by: 'AI',
          }));
          await supabase.from('insights').insert(rows);
        }
      }
    } catch (err) {
      console.error('AI insights error:', err);
      // Fall back to local insights
      refreshInsights(user, actions);
    }
  }, [user, actions, session, refreshInsights]);

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

  const persistAction = useCallback(async (action: SustainabilityAction, updatedUser: UserProfile, newBadges: Badge[], txHash: string) => {
    if (!session) return;
    const uid = session.user.id;
    try {
      await supabase.from('actions').insert({
        user_id: uid, type: action.type, category: action.category,
        impact_value: action.impactValue, financial_impact: action.financialImpact,
        ai_category: action.aiCategory, blockchain_status: 'confirmed',
        reward_minted: true, tokens_earned: action.tokensEarned, co2_reduced: action.co2Reduced,
      });
      await supabase.from('profiles').update({
        eco_score: updatedUser.ecoScore, fsi_score: updatedUser.fsiScore,
        level: updatedUser.level, streak: updatedUser.streak,
        energy_points: updatedUser.energyPoints, total_tokens: updatedUser.totalTokens,
        today_tokens: updatedUser.todayTokens, updated_at: new Date().toISOString(),
      }).eq('id', uid);
      await supabase.from('token_logs').insert({
        user_id: uid, amount: action.tokensEarned, action_type: action.type,
        tx_hash: txHash, nft_issued: newBadges.length > 0,
      });
      for (const b of newBadges) {
        await supabase.from('badges').insert({
          user_id: uid, badge_id: b.id, name: b.name, description: b.description,
          tier: b.tier, token_id: b.tokenId, metadata: b.metadata,
        });
      }
    } catch (err) {
      console.error('Persist action error:', err);
    }
  }, [session]);

  const logAction = useCallback((actionType: string) => {
    if (!user) return;
    const cfg = ACTION_TYPES[actionType];
    if (!cfg) return;
    const result = computeActionImpact(actionType, user);
    const txHash = generateTxHash();

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
      txHash, timestamp: new Date(), nftIssued: newBadges.length > 0,
    }, ...prev]);

    setAchievements(checkAchievements(updatedUser, updatedActions));
    refreshInsights(updatedUser, updatedActions);

    // Persist to DB for authenticated users
    persistAction(newAction, updatedUser, newBadges, txHash);

    setTimeout(() => {
      setActions(prev => prev.map(a =>
        a.id === newAction.id ? { ...a, blockchainStatus: 'confirmed' as const, rewardMinted: true } : a
      ));
    }, 2000);
  }, [user, actions, transactions, badges, refreshInsights, persistAction]);

  const addTransactions = useCallback((txs: FinTechTransaction[]) => {
    const updated = [...txs, ...transactions];
    setTransactions(updated);
    if (user) {
      const newFsi = computeFSI(updated);
      const updatedUser = { ...user, fsiScore: newFsi };
      setUser(updatedUser);
      refreshInsights(updatedUser, actions);

      // Persist for authenticated users
      if (session) {
        const rows = txs.map(t => ({
          user_id: session.user.id, description: t.description, amount: t.amount,
          category: t.category, classification: t.classification,
          date: t.date.toISOString(), carbon_intensity: t.carbonIntensity,
        }));
        supabase.from('transactions').insert(rows).then(({ error }) => {
          if (error) console.error('Persist transactions error:', error);
        });
        supabase.from('profiles').update({
          fsi_score: newFsi, updated_at: new Date().toISOString(),
        }).eq('id', session.user.id);
      }
    }
  }, [transactions, user, actions, refreshInsights, session]);

  const createProposal = useCallback(async (text: string, desc: string, durationDays: number) => {
    const endTime = new Date(Date.now() + durationDays * DAY);
    const newProposal: DAOProposal = {
      id: `prop-${Date.now()}`, text, description: desc,
      createdAt: new Date(), createdBy: user?.name || 'Anonymous',
      status: 'active', yesVotes: 0, noVotes: 0,
      endTime, voters: [],
    };
    setProposals(prev => [newProposal, ...prev]);

    if (session) {
      const { data, error } = await supabase.from('proposals').insert({
        text, description: desc, created_by: session.user.id,
        created_by_name: user?.name || 'Anonymous',
        end_time: endTime.toISOString(),
      }).select().single();
      if (data) {
        setProposals(prev => prev.map(p => p.id === newProposal.id ? { ...p, id: data.id } : p));
      }
      if (error) console.error('Create proposal error:', error);
    }
  }, [user, session]);

  const vote = useCallback(async (proposalId: string, v: 'yes' | 'no') => {
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

    if (session) {
      const { error } = await supabase.from('votes').insert({
        proposal_id: proposalId, user_id: session.user.id, vote: v, weight: tokenWeight,
      });
      if (error) console.error('Vote error:', error);
      // Update proposal tallies
      const col = v === 'yes' ? 'yes_votes' : 'no_votes';
      const { data: prop } = await supabase.from('proposals').select(col).eq('id', proposalId).single();
      if (prop) {
        await supabase.from('proposals').update({
          [col]: (prop as any)[col] + tokenWeight,
        }).eq('id', proposalId);
      }
    }
  }, [user, session]);

  const resetDemo = useCallback(() => {
    enterDemoMode();
  }, [enterDemoMode]);

  const logout = useCallback(async () => {
    if (session) {
      await supabase.auth.signOut();
    }
    setAuthMode(null);
    setSession(null);
    setUser(null);
    setActions([]);
    setTransactions([]);
    setInsights([]);
    setBadges([]);
    setTokenLogs([]);
    setProposals([]);
    setAchievements([]);
  }, [session]);

  // Set up realtime subscriptions for authenticated users
  useEffect(() => {
    if (!session) return;
    const uid = session.user.id;

    const channel = supabase.channel('realtime-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions', filter: `user_id=eq.${uid}` }, () => {
        // Reload actions on new insert from other devices
        loadUserData(uid);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals' }, () => {
        supabase.from('proposals').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) {
            setProposals(data.map(p => ({
              id: p.id, text: p.text, description: p.description || '',
              createdAt: new Date(p.created_at), createdBy: p.created_by_name || 'Anonymous',
              status: p.status as any, yesVotes: p.yes_votes, noVotes: p.no_votes,
              endTime: new Date(p.end_time), voters: [],
            })));
          }
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'insights', filter: `user_id=eq.${uid}` }, (payload) => {
        const i = payload.new as any;
        setInsights(prev => [{
          id: i.id, userId: i.user_id, text: i.text, type: i.type,
          generatedBy: 'AI' as const, timestamp: new Date(i.timestamp),
        }, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session]);

  return (
    <AppContext.Provider value={{
      authMode, user, session, actions, transactions, insights, badges, tokenLogs,
      proposals, achievements, enterDemoMode, enterGuestMode, logAction,
      addTransactions, createProposal, vote, resetDemo, logout, fetchAIInsights, authLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}
