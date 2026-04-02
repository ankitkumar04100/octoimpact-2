import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, Brain, Award, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { TIER_COLORS } from '@/types';
import { Button } from '@/components/ui/button';
import StatsRow from '@/components/dashboard/StatsRow';
import EcoScoreChart from '@/components/dashboard/EcoScoreChart';
import MultiplierPanel from '@/components/dashboard/MultiplierPanel';
import DAOPreview from '@/components/dashboard/DAOPreview';
import ImpactOverview from '@/components/dashboard/ImpactOverview';
import BadgeCollections from '@/components/dashboard/BadgeCollections';
import SubDashboard from '@/components/dashboard/SubDashboard';
import OctomindChat from '@/components/chat/OctomindChat';

const CHART_COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];
const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const SECTION_NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'insights', label: 'Insights' },
  { id: 'activity', label: 'Activity' },
  { id: 'badges', label: 'Badges' },
  { id: 'governance', label: 'Governance' },
  { id: 'pro', label: 'Pro Panels' },
];

export default function Dashboard() {
  const { user, actions, insights, badges, tokenLogs, achievements, proposals, transactions, fetchAIInsights, vote } = useApp();
  const [aiLoading, setAiLoading] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const carbonData = useMemo(() => {
    const cats: Record<string, number> = {};
    for (const a of actions) cats[a.category] = (cats[a.category] || 0) + a.co2Reduced;
    return Object.entries(cats).map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }));
  }, [actions]);

  const handleFetchAI = async () => {
    setAiLoading(true);
    try { await fetchAIInsights(); } finally { setAiLoading(false); }
  };

  const toggle = (id: string) => setCollapsed(p => ({ ...p, [id]: !p[id] }));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-5xl mx-auto">
        {/* Sticky Section Nav (desktop) */}
        <div className="hidden lg:fixed lg:right-6 lg:top-24 lg:flex lg:flex-col lg:gap-1 lg:z-40">
          {SECTION_NAV.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-[10px] px-3 py-1.5 rounded-full bg-background/80 backdrop-blur border border-border/50 text-muted-foreground hover:text-foreground hover:border-ocean-teal/30 transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* Section: Overview */}
        <section id="overview" className="mb-8">
          <SectionHeader title="Overview" subtitle="Your sustainability command center" id="overview" collapsed={collapsed.overview} onToggle={() => toggle('overview')} />
          {!collapsed.overview && (
            <div className="space-y-6">
              <StatsRow user={user} />
              <ImpactOverview user={user} actions={actions} />
              <div className="grid lg:grid-cols-2 gap-6">
                <EcoScoreChart actions={actions} />
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
              </div>
              <MultiplierPanel user={user} />
            </div>
          )}
        </section>

        {/* Section: Insights */}
        <section id="insights" className="mb-8">
          <SectionHeader title="AI Insights" subtitle="Context-aware recommendations powered by OCTOMIND" id="insights" collapsed={collapsed.insights} onToggle={() => toggle('insights')} />
          {!collapsed.insights && (
            <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-ocean-cyan" /> AI Insights
                </h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFetchAI} disabled={aiLoading} title="Refresh AI Insights">
                  <RefreshCw className={`h-3.5 w-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {aiLoading && insights.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Sparkles className="h-4 w-4 animate-pulse" /> Generating AI insights...
                  </div>
                )}
                <AnimatePresence>
                  {insights.length > 0 ? insights.map(ins => (
                    <motion.div key={ins.id} className="glass-ocean rounded-xl p-4 text-sm leading-relaxed" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
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
          )}
        </section>

        {/* Section: Activity */}
        <section id="activity" className="mb-8">
          <SectionHeader title="Activity" subtitle="Token mints, recent actions, and on-chain events" id="activity" collapsed={collapsed.activity} onToggle={() => toggle('activity')} />
          {!collapsed.activity && (
            <div className="space-y-6">
              {/* Token Activity */}
              <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show">
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

              {/* Recent Actions */}
              <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
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
            </div>
          )}
        </section>

        {/* Section: Badges */}
        <section id="badges" className="mb-8">
          <SectionHeader title="Badges & Achievements" subtitle="Your NFT badge collection and progress milestones" id="badges" collapsed={collapsed.badges} onToggle={() => toggle('badges')} />
          {!collapsed.badges && (
            <BadgeCollections user={user} badges={badges} actions={actions} />
          )}
        </section>

        {/* Section: Governance */}
        <section id="governance" className="mb-8">
          <SectionHeader title="Governance" subtitle="DAO proposals and token-weighted voting" id="governance" collapsed={collapsed.governance} onToggle={() => toggle('governance')} />
          {!collapsed.governance && (
            <DAOPreview proposals={proposals} user={user} onVote={vote} />
          )}
        </section>

        {/* Section: Pro Panels */}
        <section id="pro" className="mb-8">
          <SectionHeader title="Pro Panels" subtitle="Advanced analytics, challenges, and category deep dives" id="pro" collapsed={collapsed.pro} onToggle={() => toggle('pro')} />
          {!collapsed.pro && (
            <SubDashboard user={user} actions={actions} transactions={transactions} />
          )}
        </section>
      </main>
      <OctomindChat />
    </div>
  );
}

function SectionHeader({ title, subtitle, id, collapsed, onToggle }: { title: string; subtitle: string; id: string; collapsed?: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between mb-4 group text-left">
      <div>
        <h2 className="text-2xl font-display font-black flex items-center gap-2">
          <span className="ocean-gradient-text">{title}</span>
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
        {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </div>
    </button>
  );
}
