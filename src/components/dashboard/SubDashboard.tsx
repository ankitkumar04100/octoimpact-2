import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Leaf, Users, Trophy, BarChart3, Bell, Zap } from 'lucide-react';
import { UserProfile, SustainabilityAction, FinTechTransaction, ACTION_TYPES } from '@/types';
import { Progress } from '@/components/ui/progress';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface SubDashboardProps {
  user: UserProfile;
  actions: SustainabilityAction[];
  transactions: FinTechTransaction[];
}

export default function SubDashboard({ user, actions, transactions }: SubDashboardProps) {
  const weekActions = useMemo(() =>
    actions.filter(a => Date.now() - a.timestamp.getTime() < 7 * 86400000),
    [actions]
  );

  const weekCo2 = useMemo(() => weekActions.reduce((s, a) => s + a.co2Reduced, 0), [weekActions]);
  const weekTokens = useMemo(() => weekActions.reduce((s, a) => s + a.tokensEarned, 0), [weekActions]);

  // Category deep dives
  const categoryStats = useMemo(() => {
    const cats: Record<string, { count: number; co2: number; tokens: number }> = {};
    for (const a of actions) {
      if (!cats[a.category]) cats[a.category] = { count: 0, co2: 0, tokens: 0 };
      cats[a.category].count++;
      cats[a.category].co2 += a.co2Reduced;
      cats[a.category].tokens += a.tokensEarned;
    }
    return Object.entries(cats).sort((a, b) => b[1].co2 - a[1].co2);
  }, [actions]);

  // Carbon budget (weekly target: 20kg CO2)
  const weeklyBudget = 20;
  const budgetUsed = Math.min(weekCo2, weeklyBudget);
  const budgetPct = Math.round((budgetUsed / weeklyBudget) * 100);

  // Challenges
  const challenges = useMemo(() => {
    const transportCount = weekActions.filter(a => a.category === 'transport').length;
    const plasticCount = weekActions.filter(a => a.type === 'no-plastic').length;
    return [
      { name: '3 Commute Logs', progress: Math.min(transportCount, 3), target: 3, reward: '15 bonus tokens' },
      { name: 'No-Plastic Weekend', progress: Math.min(plasticCount, 2), target: 2, reward: 'Silver badge progress' },
      { name: '5 Actions This Week', progress: Math.min(weekActions.length, 5), target: 5, reward: 'Consistency bonus +5%' },
    ];
  }, [weekActions]);

  // Top action types
  const topActions = useMemo(() => {
    const counts: Record<string, number> = {};
    actions.forEach(a => counts[a.type] = (counts[a.type] || 0) + 1);
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count, label: ACTION_TYPES[type]?.label || type, icon: ACTION_TYPES[type]?.icon || '🎯' }));
  }, [actions]);

  // Green spend ratio
  const greenSpend = transactions.filter(t => t.classification === 'green').reduce((s, t) => s + t.amount, 0);
  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);
  const greenPct = totalSpend > 0 ? Math.round((greenSpend / totalSpend) * 100) : 0;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
        <Zap className="h-5 w-5 text-ocean-cyan" /> Pro Panels
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Goal Tracker */}
        <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-ocean-teal" /> Weekly Goals
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Actions logged</span>
                <span className="font-semibold">{weekActions.length}/7</span>
              </div>
              <Progress value={Math.min((weekActions.length / 7) * 100, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>CO₂ Saved</span>
                <span className="font-semibold">{weekCo2.toFixed(1)}/{weeklyBudget} kg</span>
              </div>
              <Progress value={budgetPct} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Tokens earned</span>
                <span className="font-semibold">{weekTokens}/50</span>
              </div>
              <Progress value={Math.min((weekTokens / 50) * 100, 100)} className="h-2" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {weekActions.length < 7
                ? `${7 - weekActions.length} more actions to hit your weekly target!`
                : '🎉 Weekly goal achieved! Keep the momentum going.'}
            </p>
          </div>
        </motion.div>

        {/* Personal Carbon Budget */}
        <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-ocean-green" /> Carbon Budget
          </h3>
          <div className="text-center mb-4">
            <p className="text-4xl font-display font-black ocean-gradient-text">{weekCo2.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO₂ saved this week</p>
          </div>
          <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${budgetPct >= 80 ? 'bg-ocean-green' : budgetPct >= 40 ? 'bg-ocean-cyan' : 'bg-ocean-teal'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 kg</span>
            <span>{weeklyBudget} kg target</span>
          </div>
          {greenPct > 0 && (
            <div className="mt-4 glass-ocean rounded-xl p-3">
              <p className="text-xs font-medium">💚 Green Spend Ratio: <span className="text-ocean-green font-bold">{greenPct}%</span></p>
            </div>
          )}
        </motion.div>

        {/* Challenges */}
        <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" /> Active Challenges
          </h3>
          <div className="space-y-4">
            {challenges.map(c => (
              <div key={c.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{c.name}</span>
                  <span className={`font-semibold ${c.progress >= c.target ? 'text-ocean-green' : ''}`}>
                    {c.progress}/{c.target} {c.progress >= c.target ? '✅' : ''}
                  </span>
                </div>
                <Progress value={(c.progress / c.target) * 100} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground mt-0.5">🎁 {c.reward}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Deep Dives */}
        <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-ocean-blue" /> Category Insights
          </h3>
          {categoryStats.length > 0 ? (
            <div className="space-y-3">
              {categoryStats.map(([cat, data]) => (
                <div key={cat} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{cat}</p>
                    <p className="text-[10px] text-muted-foreground">{data.count} actions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-ocean-teal">{data.co2.toFixed(1)} kg CO₂</p>
                    <p className="text-[10px] text-muted-foreground">{data.tokens} tokens</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Log actions to see category breakdowns</p>
          )}
        </motion.div>

        {/* Top Actions */}
        <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.25 }}>
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-ocean-cyan" /> Top Actions
          </h3>
          {topActions.length > 0 ? (
            <div className="space-y-3">
              {topActions.map((a, i) => (
                <div key={a.type} className="flex items-center gap-3">
                  <span className="text-lg">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.label}</p>
                    <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full ocean-gradient"
                        style={{ width: `${(a.count / (topActions[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold">{a.count}×</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Start logging to see your favorites</p>
          )}
        </motion.div>

        {/* Notifications */}
        <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" /> Notifications
          </h3>
          <div className="space-y-2">
            {user.streak >= 7 && (
              <div className="glass-ocean rounded-xl p-3 text-xs">
                🔥 {user.streak}-day streak active! Keep it going for Silver badge.
              </div>
            )}
            {weekActions.length >= 5 && (
              <div className="glass-ocean rounded-xl p-3 text-xs">
                🎯 5+ actions this week — consistency bonus unlocked!
              </div>
            )}
            {user.totalTokens >= 400 && user.totalTokens < 500 && (
              <div className="glass-ocean rounded-xl p-3 text-xs">
                🏅 {500 - user.totalTokens} tokens until Platinum badge!
              </div>
            )}
            {weekActions.length === 0 && (
              <div className="glass-ocean rounded-xl p-3 text-xs">
                💡 No actions this week yet. Start today to keep your streak!
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-2">Notifications update in realtime</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
