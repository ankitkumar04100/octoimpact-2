import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Coins, Flame, Leaf, Brain, Award } from 'lucide-react';
import { getLevelProgress } from '@/engines/gamification';
import { computeEcoScore } from '@/engines/sustainability';
import { TIER_COLORS } from '@/types';

const CHART_COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { user, actions, insights, badges, tokenLogs, achievements } = useApp();

  const ecoData = useMemo(() => {
    const sorted = [...actions].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const pts: { date: string; score: number }[] = [];
    for (let i = 0; i < sorted.length; i += Math.max(1, Math.floor(sorted.length / 12))) {
      const subset = sorted.slice(0, i + 1);
      pts.push({
        date: sorted[i].timestamp.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        score: computeEcoScore(subset),
      });
    }
    return pts;
  }, [actions]);

  const carbonData = useMemo(() => {
    const cats: Record<string, number> = {};
    for (const a of actions) cats[a.category] = (cats[a.category] || 0) + a.co2Reduced;
    return Object.entries(cats).map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }));
  }, [actions]);

  const levelInfo = user ? getLevelProgress(user.totalTokens) : { level: 1, progress: 0, nextThreshold: 10 };
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
        {/* Stats Row */}
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
          {[
            { icon: Leaf, label: 'EcoScore', value: user.ecoScore, suffix: '/100', color: 'text-ocean-teal' },
            { icon: Coins, label: 'Tokens', value: user.totalTokens, suffix: ` (+${user.todayTokens})`, color: 'text-ocean-cyan' },
            { icon: Flame, label: 'Streak', value: user.streak, suffix: ' days', color: 'text-orange-500' },
            { icon: TrendingUp, label: 'Level', value: levelInfo.level, suffix: ` (${Math.round(levelInfo.progress)}%)`, color: 'text-ocean-blue' },
          ].map(s => (
            <motion.div key={s.label} variants={fade} className="glass rounded-2xl p-5 card-hover">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              </div>
              <p className="text-3xl font-display font-black">
                {s.value}<span className="text-sm font-normal text-muted-foreground">{s.suffix}</span>
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* EcoScore Timeline */}
          <motion.div className="lg:col-span-2 glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-ocean-teal" /> EcoScore Timeline
            </h3>
            {ecoData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={ecoData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(200 12% 48%)" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(200 12% 48%)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(180 65% 30%)" strokeWidth={3} dot={{ fill: 'hsl(180 65% 30%)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm py-16 text-center">Log actions to see your EcoScore evolve</p>
            )}
          </motion.div>

          {/* Carbon Breakdown */}
          <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
            <h3 className="font-display font-bold mb-4">CO₂ by Category</h3>
            {carbonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={carbonData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} ${value}`}>
                    {carbonData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm py-16 text-center">No data yet</p>
            )}
          </motion.div>

          {/* AI Insights */}
          <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-ocean-cyan" /> AI Insights
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {insights.length > 0 ? insights.map(ins => (
                <div key={ins.id} className="glass-ocean rounded-xl p-3 text-sm leading-relaxed">
                  {ins.text}
                </div>
              )) : (
                <p className="text-muted-foreground text-sm">Insights will appear as you take actions</p>
              )}
            </div>
          </motion.div>

          {/* Token Activity */}
          <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-ocean-cyan" /> Token Activity
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {tokenLogs.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">+{log.amount} tokens</p>
                    <p className="text-xs text-muted-foreground">{log.actionType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-muted-foreground">{log.txHash.slice(0, 10)}...</p>
                    {log.nftIssued && <span className="text-xs text-ocean-cyan font-semibold">+ NFT</span>}
                  </div>
                </div>
              ))}
              {tokenLogs.length === 0 && <p className="text-sm text-muted-foreground">No token activity yet</p>}
            </div>
          </motion.div>

          {/* Badge Shelf */}
          <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.25 }}>
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" /> NFT Badges
            </h3>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {badges.map(badge => (
                  <motion.div
                    key={badge.id}
                    className={`rounded-xl p-4 text-center bg-gradient-to-br ${TIER_COLORS[badge.tier]} text-primary-foreground`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <p className="text-2xl mb-1">🏅</p>
                    <p className="text-xs font-bold">{badge.name}</p>
                    <p className="text-[10px] opacity-80 mt-1">{badge.tier.toUpperCase()}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Earn badges by reaching milestones</p>
            )}
          </motion.div>

          {/* Recent Actions */}
          <motion.div className="lg:col-span-2 glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.3 }}>
            <h3 className="font-display font-bold mb-4">Recent Actions</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {actions.slice(0, 8).map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block w-2 h-2 rounded-full ${a.blockchainStatus === 'confirmed' ? 'bg-ocean-green' : a.blockchainStatus === 'pending' ? 'bg-yellow-400 animate-pulse' : 'bg-destructive'}`} />
                    <div>
                      <p className="text-sm font-medium">{a.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                      <p className="text-xs text-muted-foreground">{a.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ocean-teal">+{a.tokensEarned} tokens</p>
                    <p className="text-xs text-muted-foreground">{a.co2Reduced.toFixed(1)} kg CO₂</p>
                  </div>
                </div>
              ))}
              {actions.length === 0 && <p className="text-sm text-muted-foreground">No actions yet — head to the Actions page!</p>}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.35 }}>
            <h3 className="font-display font-bold mb-4">Achievements</h3>
            <div className="space-y-3">
              {achievements.slice(0, 6).map(a => (
                <div key={a.id} className="flex items-center gap-3">
                  <span className="text-xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${a.earned ? '' : 'text-muted-foreground'}`}>{a.title}</p>
                    <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full ocean-gradient transition-all duration-500"
                        style={{ width: `${(a.progress / a.target) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.progress}/{a.target}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
