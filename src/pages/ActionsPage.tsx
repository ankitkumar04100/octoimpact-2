import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTION_TYPES } from '@/types';
import { computeActionImpact } from '@/engines/sustainability';
import { Check, Sparkles, Flame, Undo2 } from 'lucide-react';
import OctomindChat from '@/components/chat/OctomindChat';

export default function ActionsPage() {
  const { user, actions, logAction } = useApp();
  const [lastAction, setLastAction] = useState<{ type: string; tokens: number; co2: number; id: string; time: number } | null>(null);

  // Streak heatmap (last 28 days)
  const heatmapData = useMemo(() => {
    const days: { date: string; count: number; day: number }[] = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 86400000;
      const count = actions.filter(a => a.timestamp.getTime() >= dayStart && a.timestamp.getTime() < dayEnd).length;
      days.push({ date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), count, day: d.getDay() });
    }
    return days;
  }, [actions]);

  // Smart suggestions
  const suggestions = useMemo(() => {
    if (!user) return [];
    const recentTypes = new Set(actions.slice(0, 10).map(a => a.type));
    return Object.entries(ACTION_TYPES)
      .filter(([type]) => !recentTypes.has(type))
      .slice(0, 3)
      .map(([type, cfg]) => {
        const est = computeActionImpact(type, user);
        return { type, label: cfg.label, icon: cfg.icon, tokens: est.tokens, co2: est.co2 };
      });
  }, [user, actions]);

  if (!user) return null;

  const handleAction = (type: string) => {
    const result = computeActionImpact(type, user);
    logAction(type);
    setLastAction({ type, tokens: result.tokens, co2: result.co2, id: `act-${Date.now()}`, time: Date.now() });
    setTimeout(() => setLastAction(null), 4000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-5xl mx-auto">
        <motion.h1 className="text-3xl font-display font-black mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Log an <span className="ocean-gradient-text">Action</span>
        </motion.h1>
        <p className="text-muted-foreground mb-6">Each action is scored, rewarded with tokens, and recorded on-chain.</p>

        {/* Feedback Toast */}
        <AnimatePresence>
          {lastAction && (
            <motion.div
              className="fixed top-20 right-4 z-50 glass-ocean rounded-2xl p-5 shadow-xl max-w-xs"
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl ocean-gradient flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-sm">+{lastAction.tokens} ImpactTokens!</p>
                  <p className="text-xs text-muted-foreground">{lastAction.co2} kg CO₂ saved • ⛓️ Minting...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-ocean-cyan" /> Suggested for You
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {suggestions.map(s => (
                <motion.button
                  key={s.type}
                  onClick={() => handleAction(s.type)}
                  className="glass-ocean rounded-xl px-4 py-3 text-left shrink-0 min-w-[160px] card-hover"
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-xs font-semibold mt-1">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">~{s.co2} kg CO₂ • {s.tokens} tokens</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Streak Heatmap */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-500" /> Streak Heatmap (28 days)
            <span className="ml-2 text-xs font-semibold text-foreground">{user.streak} day streak 🔥</span>
          </h3>
          <div className="grid grid-cols-7 gap-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[9px] text-muted-foreground font-medium">{d}</div>
            ))}
            {/* Pad start */}
            {Array.from({ length: heatmapData[0]?.day || 0 }).map((_, i) => (
              <div key={`pad-${i}`} className="h-8 rounded-md" />
            ))}
            {heatmapData.map((d, i) => (
              <motion.div
                key={i}
                className={`h-8 rounded-md flex items-center justify-center text-[9px] font-medium transition-colors ${
                  d.count === 0 ? 'bg-muted' :
                  d.count <= 1 ? 'bg-ocean-teal/20 text-ocean-teal' :
                  d.count <= 3 ? 'bg-ocean-teal/40 text-ocean-teal' :
                  'bg-ocean-teal/70 text-primary-foreground'
                }`}
                title={`${d.date}: ${d.count} actions`}
                whileHover={{ scale: 1.15 }}
              >
                {d.count > 0 ? d.count : ''}
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 justify-end">
            <span className="text-[9px] text-muted-foreground">Less</span>
            {[0, 1, 2, 4].map(n => (
              <div key={n} className={`h-3 w-3 rounded-sm ${
                n === 0 ? 'bg-muted' : n === 1 ? 'bg-ocean-teal/20' : n === 2 ? 'bg-ocean-teal/40' : 'bg-ocean-teal/70'
              }`} />
            ))}
            <span className="text-[9px] text-muted-foreground">More</span>
          </div>
        </div>

        {/* Action Grid */}
        <h3 className="text-sm font-medium text-muted-foreground mb-3">All Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {Object.entries(ACTION_TYPES).map(([type, cfg]) => {
            const est = computeActionImpact(type, user);
            return (
              <motion.button
                key={type}
                onClick={() => handleAction(type)}
                className="glass rounded-2xl p-5 text-left card-hover group cursor-pointer"
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-3xl block mb-3">{cfg.icon}</span>
                <p className="font-semibold text-sm mb-1">{cfg.label}</p>
                <p className="text-xs text-muted-foreground">
                  ~{est.co2} kg CO₂ • {est.tokens} tokens
                </p>
                <div className="mt-3 text-xs font-medium text-ocean-teal opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Check className="h-3 w-3" /> Tap to log
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Recent History */}
        <h2 className="text-xl font-display font-bold mb-4">Action History</h2>
        <div className="glass rounded-2xl divide-y divide-border/50">
          {actions.slice(0, 12).map(a => (
            <div key={a.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${a.blockchainStatus === 'confirmed' ? 'bg-ocean-green' : 'bg-amber-400 animate-pulse'}`} />
                <div>
                  <p className="text-sm font-medium">{a.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                  <p className="text-xs text-muted-foreground">{a.timestamp.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ocean-teal">+{a.tokensEarned}</p>
                <p className="text-xs text-muted-foreground">{a.blockchainStatus}</p>
              </div>
            </div>
          ))}
          {actions.length === 0 && (
            <p className="p-8 text-center text-muted-foreground text-sm">No actions logged yet. Tap an action above to get started!</p>
          )}
        </div>
      </main>
      <OctomindChat />
    </div>
  );
}
