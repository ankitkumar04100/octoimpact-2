import { useState, useMemo, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTION_TYPES } from '@/types';
import { computeActionImpact } from '@/engines/sustainability';
import { Check, Sparkles, Flame, Undo2, Plus, X, Filter, Clock, Gauge } from 'lucide-react';
import OctomindChat from '@/components/chat/OctomindChat';

const ACTION_DIFFICULTY: Record<string, { time: string; difficulty: 'Easy' | 'Medium' | 'Hard' }> = {
  'public-transport': { time: '30-60 min', difficulty: 'Easy' },
  'cycling': { time: '20-45 min', difficulty: 'Medium' },
  'walking': { time: '15-30 min', difficulty: 'Easy' },
  'carpooling': { time: '15 min setup', difficulty: 'Easy' },
  'power-saving': { time: '2 min', difficulty: 'Easy' },
  'ac-optimization': { time: '5 min', difficulty: 'Easy' },
  'veg-day': { time: 'Full day', difficulty: 'Medium' },
  'no-plastic': { time: 'Full day', difficulty: 'Hard' },
  'reusable-bottle': { time: '1 min', difficulty: 'Easy' },
  'led-bulbs': { time: '10 min', difficulty: 'Medium' },
  'water-conservation': { time: '5 min', difficulty: 'Easy' },
  'eco-shopping': { time: '30 min', difficulty: 'Medium' },
};

const ACTION_PACKS = [
  { name: '🎓 Student Pack', types: ['walking', 'reusable-bottle', 'power-saving', 'veg-day'] },
  { name: '🏠 Hostel Pack', types: ['water-conservation', 'power-saving', 'no-plastic', 'led-bulbs'] },
  { name: '♻️ No-Plastic Week', types: ['no-plastic', 'reusable-bottle', 'eco-shopping'] },
  { name: '🚌 Transport Switch', types: ['public-transport', 'cycling', 'walking', 'carpooling'] },
];

export default function ActionsPage() {
  const { user, actions, logAction } = useApp();
  const [lastAction, setLastAction] = useState<{ type: string; tokens: number; co2: number; id: string; time: number } | null>(null);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('lifestyle');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  const heatmapData = useMemo(() => {
    const days: { date: string; count: number; day: number; fullDate: string }[] = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayStart = d.getTime();
      const dayEnd = dayStart + 86400000;
      const count = actions.filter(a => a.timestamp.getTime() >= dayStart && a.timestamp.getTime() < dayEnd).length;
      days.push({ date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), count, day: d.getDay(), fullDate: d.toLocaleDateString() });
    }
    return days;
  }, [actions]);

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

  const badgeHint = useMemo(() => {
    if (!user) return null;
    if (user.streak >= 5 && user.streak < 7) return `🏅 ${7 - user.streak} more days for Bronze Streak Badge!`;
    if (user.totalTokens >= 400 && user.totalTokens < 500) return `🏅 ${500 - user.totalTokens} tokens until Platinum badge!`;
    return null;
  }, [user]);

  const filteredActionTypes = useMemo(() => {
    return Object.entries(ACTION_TYPES).filter(([_, cfg]) =>
      categoryFilter === 'all' || cfg.category === categoryFilter
    );
  }, [categoryFilter]);

  const categories = ['all', ...new Set(Object.values(ACTION_TYPES).map(c => c.category))];

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return actions;
    return actions.filter(a => a.category === historyFilter);
  }, [actions, historyFilter]);

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

        {badgeHint && (
          <motion.div className="glass-ocean rounded-2xl p-4 mb-6 text-sm font-medium" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            {badgeHint}
          </motion.div>
        )}

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

        {/* --- Section: Smart Suggestions --- */}
        {suggestions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-ocean-cyan" /> Suggested for You
            </h2>
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
          </section>
        )}

        {/* --- Section: Action Packs --- */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-3">Action Packs</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {ACTION_PACKS.map(pack => (
              <div key={pack.name} className="glass rounded-xl p-4">
                <p className="font-bold text-sm mb-2">{pack.name}</p>
                <div className="space-y-1">
                  {pack.types.map(t => {
                    const cfg = ACTION_TYPES[t];
                    return cfg ? (
                      <button key={t} onClick={() => handleAction(t)} className="text-xs text-muted-foreground hover:text-ocean-teal transition-colors block">
                        {cfg.icon} {cfg.label}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Section: Streak Heatmap --- */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" /> Streak Heatmap
            <span className="ml-2 text-xs font-semibold text-foreground">{user.streak} day streak 🔥</span>
          </h2>
          <div className="glass rounded-2xl p-5">
            <div className="grid grid-cols-7 gap-1.5">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[9px] text-muted-foreground font-medium">{d}</div>
              ))}
              {Array.from({ length: heatmapData[0]?.day || 0 }).map((_, i) => (
                <div key={`pad-${i}`} className="h-8 rounded-md" />
              ))}
              {heatmapData.map((d, i) => (
                <motion.div
                  key={i}
                  className={`h-8 rounded-md flex items-center justify-center text-[9px] font-medium cursor-default ${
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
        </section>

        {/* --- Section: All Actions --- */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-bold flex items-center gap-1.5">
                <Filter className="h-4 w-4" /> All Actions
              </h2>
              <div className="flex gap-1">
                {categories.map(c => (
                  <button
                    key={c}
                    className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                      categoryFilter === c ? 'bg-ocean-teal text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    onClick={() => setCategoryFilter(c)}
                  >
                    {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setShowAddCustom(!showAddCustom)}>
              <Plus className="h-3.5 w-3.5" /> Add Custom
            </Button>
          </div>

          <AnimatePresence>
            {showAddCustom && (
              <motion.div className="glass rounded-2xl p-5 mb-6" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <h4 className="text-sm font-bold mb-3">Create Custom Action Template</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Action name" value={customName} onChange={e => setCustomName(e.target.value)} />
                  <select className="rounded-xl border border-input bg-background px-3 py-2 text-sm" value={customCategory} onChange={e => setCustomCategory(e.target.value)}>
                    <option value="transport">Transport</option>
                    <option value="energy">Energy</option>
                    <option value="diet">Diet</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="home">Home</option>
                    <option value="shopping">Shopping</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="ocean" size="sm" disabled={!customName.trim()} onClick={() => { setCustomName(''); setShowAddCustom(false); }}>Save Template</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddCustom(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActionTypes.map(([type, cfg]) => {
              const est = computeActionImpact(type, user);
              const diff = ACTION_DIFFICULTY[type];
              return (
                <motion.button
                  key={type}
                  onClick={() => handleAction(type)}
                  className="glass rounded-2xl p-5 text-left card-hover group cursor-pointer"
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl block mb-2">{cfg.icon}</span>
                    {diff && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        diff.difficulty === 'Easy' ? 'bg-ocean-green/10 text-ocean-green' :
                        diff.difficulty === 'Medium' ? 'bg-ocean-cyan/10 text-ocean-cyan' :
                        'bg-orange-500/10 text-orange-500'
                      }`}>
                        {diff.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm mb-1">{cfg.label}</p>
                  <p className="text-xs text-muted-foreground">~{est.co2} kg CO₂ • {est.tokens} tokens</p>
                  {diff && (
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {diff.time}
                    </p>
                  )}
                  <div className="mt-3 text-xs font-medium text-ocean-teal opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Check className="h-3 w-3" /> Tap to log
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* --- Section: Action History --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold">Action History</h2>
            <div className="flex gap-1">
              {['all', ...new Set(actions.map(a => a.category))].map(c => (
                <button
                  key={c}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                    historyFilter === c ? 'bg-ocean-teal text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                  onClick={() => setHistoryFilter(c)}
                >
                  {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl divide-y divide-border/50">
            {filteredHistory.slice(0, 15).map(a => (
              <div key={a.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${a.blockchainStatus === 'confirmed' ? 'bg-ocean-green' : 'bg-amber-400 animate-pulse'}`} />
                  <div>
                    <p className="text-sm font-medium">{a.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                    <p className="text-xs text-muted-foreground">{a.timestamp.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ocean-teal">+{a.tokensEarned}</p>
                    <p className="text-xs text-muted-foreground">{a.co2Reduced.toFixed(1)} kg CO₂</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    a.blockchainStatus === 'confirmed' ? 'bg-ocean-green/10 text-ocean-green' : 'bg-amber-400/10 text-amber-600'
                  }`}>
                    {a.blockchainStatus}
                  </span>
                </div>
              </div>
            ))}
            {actions.length === 0 && (
              <p className="p-8 text-center text-muted-foreground text-sm">No actions logged yet. Tap an action above to get started!</p>
            )}
          </div>
        </section>
      </main>
      <OctomindChat />
      <GuidedTour steps={ACTIONS_TOUR} tourKey="actions" />
    </div>
  );
}
