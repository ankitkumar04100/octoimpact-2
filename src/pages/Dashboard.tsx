import { useMemo, useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, Brain, Award, Sparkles, RefreshCw } from 'lucide-react';
import { TIER_COLORS } from '@/types';
import { Button } from '@/components/ui/button';
import StatsRow from '@/components/dashboard/StatsRow';
import EcoScoreChart from '@/components/dashboard/EcoScoreChart';
import MultiplierPanel from '@/components/dashboard/MultiplierPanel';
import DAOPreview from '@/components/dashboard/DAOPreview';
import OctomindChat from '@/components/chat/OctomindChat';

const CHART_COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];
const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { user, actions, insights, badges, tokenLogs, achievements, proposals, fetchAIInsights, authMode, vote } = useApp();
  const [aiLoading, setAiLoading] = useState(false);

  const carbonData = useMemo(() => {
    const cats: Record<string, number> = {};
    for (const a of actions) cats[a.category] = (cats[a.category] || 0) + a.co2Reduced;
    return Object.entries(cats).map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }));
  }, [actions]);

  useEffect(() => {
    if (user && authMode !== 'demo' && authMode !== 'guest' && insights.length === 0) {
      handleFetchAI();
    }
  }, [user, authMode]);

  const handleFetchAI = async () => {
    setAiLoading(true);
    try { await fetchAIInsights(); } finally { setAiLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
        <StatsRow user={user} />

        <div className="grid lg:grid-cols-3 gap-6">
          <EcoScoreChart actions={actions} />

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
              <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={handleFetchAI} disabled={aiLoading} title="Refresh AI Insights">
                <RefreshCw className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              </Button>
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {aiLoading && insights.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Sparkles className="h-4 w-4 animate-pulse" /> Generating AI insights...
                </div>
              )}
              <AnimatePresence>
                {insights.length > 0 ? insights.map(ins => (
                  <motion.div key={ins.id} className="glass-ocean rounded-xl p-3 text-sm leading-relaxed" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    {ins.type === 'action' && <span className="text-ocean-teal font-semibold">🎯 </span>}
                    {ins.type === 'goal' && <span className="text-ocean-blue font-semibold">🚀 </span>}
                    {ins.type === 'warning' && <span className="text-orange-500 font-semibold">⚠️ </span>}
                    {ins.type === 'tip' && <span className="text-ocean-cyan font-semibold">💡 </span>}
                    {ins.text}
                  </motion.div>
                )) : !aiLoading && (
                  <p className="text-muted-foreground text-sm">Insights will appear as you take actions</p>
                )}
              </AnimatePresence>
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

          {/* Multiplier Panel */}
          <MultiplierPanel user={user} />

          {/* Badge Shelf */}
          <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.25 }}>
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> NFT Badges
            </h3>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {badges.map(badge => (
                  <motion.div key={badge.id} className={`rounded-xl p-4 text-center bg-gradient-to-br ${TIER_COLORS[badge.tier]} text-primary-foreground`} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
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
                    <span className={`inline-block w-2 h-2 rounded-full ${a.blockchainStatus === 'confirmed' ? 'bg-ocean-green' : a.blockchainStatus === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-destructive'}`} />
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

          {/* DAO Preview */}
          <DAOPreview proposals={proposals} user={user} onVote={vote} />

          {/* Achievements */}
          <motion.div className="lg:col-span-2 glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
            <h3 className="font-display font-bold mb-4">Achievements</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements.map(a => (
                <div key={a.id} className="flex items-center gap-3 glass-ocean rounded-xl p-3">
                  <span className="text-xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${a.earned ? '' : 'text-muted-foreground'}`}>{a.title}</p>
                    <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                      <div className="h-full rounded-full ocean-gradient transition-all duration-500" style={{ width: `${Math.min(100, (a.progress / a.target) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.progress}/{a.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <OctomindChat />
    </div>
  );
}
