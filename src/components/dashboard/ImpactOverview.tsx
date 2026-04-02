import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Zap, Leaf, Flame, BarChart3 } from 'lucide-react';
import { UserProfile, SustainabilityAction, ACTION_TYPES } from '@/types';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface Props {
  user: UserProfile;
  actions: SustainabilityAction[];
}

export default function ImpactOverview({ user, actions }: Props) {
  const weekActions = useMemo(() =>
    actions.filter(a => Date.now() - a.timestamp.getTime() < 7 * 86400000), [actions]);
  const prevWeekActions = useMemo(() =>
    actions.filter(a => {
      const age = Date.now() - a.timestamp.getTime();
      return age >= 7 * 86400000 && age < 14 * 86400000;
    }), [actions]);

  const weekCo2 = weekActions.reduce((s, a) => s + a.co2Reduced, 0);
  const prevWeekCo2 = prevWeekActions.reduce((s, a) => s + a.co2Reduced, 0);
  const co2Delta = weekCo2 - prevWeekCo2;

  // CO2 equivalence
  const carMilesEquiv = Math.round(weekCo2 / 0.404 * 10) / 10; // ~0.404 kg CO2 per mile

  // Best/worst category this week
  const catBreakdown = useMemo(() => {
    const cats: Record<string, { co2: number; count: number }> = {};
    weekActions.forEach(a => {
      if (!cats[a.category]) cats[a.category] = { co2: 0, count: 0 };
      cats[a.category].co2 += a.co2Reduced;
      cats[a.category].count++;
    });
    const sorted = Object.entries(cats).sort((a, b) => b[1].co2 - a[1].co2);
    return { best: sorted[0], worst: sorted[sorted.length - 1], all: sorted };
  }, [weekActions]);

  // Consistency per category
  const consistency = useMemo(() => {
    const cats: Record<string, number[]> = {};
    actions.slice(0, 50).forEach(a => {
      if (!cats[a.category]) cats[a.category] = [];
      cats[a.category].push(a.timestamp.getTime());
    });
    const scores: Record<string, number> = {};
    for (const [cat, times] of Object.entries(cats)) {
      if (times.length < 2) { scores[cat] = times.length * 20; continue; }
      const gaps = times.slice(0, -1).map((t, i) => times[i] - times[i + 1]);
      const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
      const idealGap = 86400000; // 1 day
      scores[cat] = Math.min(100, Math.round((idealGap / Math.max(avgGap, idealGap)) * 100 * Math.min(times.length / 5, 1)));
    }
    return scores;
  }, [actions]);

  // Most consistent / most missed
  const sortedConsistency = Object.entries(consistency).sort((a, b) => b[1] - a[1]);
  const mostConsistent = sortedConsistency[0];
  const allCategories = ['transport', 'energy', 'diet', 'lifestyle', 'home', 'shopping'];
  const missedCategories = allCategories.filter(c => !consistency[c] || consistency[c] < 10);

  const TrendIcon = co2Delta > 0 ? TrendingUp : co2Delta < 0 ? TrendingDown : Minus;

  return (
    <div className="space-y-6">
      {/* Enhanced Stats */}
      <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show">
        <h3 className="font-display font-bold mb-4 flex items-center gap-2">
          <Leaf className="h-5 w-5 text-ocean-green" /> Weekly Impact Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-ocean rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-black ocean-gradient-text">{weekCo2.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO₂ saved</p>
            <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-medium ${co2Delta >= 0 ? 'text-ocean-green' : 'text-destructive'}`}>
              <TrendIcon className="h-3 w-3" /> {co2Delta >= 0 ? '+' : ''}{co2Delta.toFixed(1)} vs last week
            </div>
          </div>
          <div className="glass-ocean rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-black ocean-gradient-text">{carMilesEquiv}</p>
            <p className="text-xs text-muted-foreground">car-free miles equiv.</p>
          </div>
          <div className="glass-ocean rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-black ocean-gradient-text capitalize">
              {catBreakdown.best ? catBreakdown.best[0] : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Best category</p>
            {catBreakdown.best && (
              <p className="text-[10px] text-ocean-green font-medium">{catBreakdown.best[1].co2.toFixed(1)} kg</p>
            )}
          </div>
          <div className="glass-ocean rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-black ocean-gradient-text capitalize">
              {catBreakdown.worst && catBreakdown.all.length > 1 ? catBreakdown.worst[0] : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Needs attention</p>
            {missedCategories.length > 0 && (
              <p className="text-[10px] text-muted-foreground">{missedCategories.length} inactive</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Behavior Intelligence */}
      <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
        <h3 className="font-display font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-ocean-blue" /> Behavior & Habit Intelligence
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-3">Consistency Score by Category</p>
            {sortedConsistency.length > 0 ? sortedConsistency.map(([cat, score]) => (
              <div key={cat} className="mb-2">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="capitalize font-medium">{cat}</span>
                  <span className="font-semibold">{score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full ocean-gradient" style={{ width: `${score}%` }} />
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground">Log more actions to see patterns</p>
            )}
          </div>
          <div className="space-y-3">
            {mostConsistent && (
              <div className="glass-ocean rounded-xl p-3">
                <p className="text-xs font-medium">🎯 Most Consistent</p>
                <p className="text-sm font-bold capitalize mt-0.5">{mostConsistent[0]}</p>
                <p className="text-[10px] text-muted-foreground">{mostConsistent[1]}% consistency score</p>
              </div>
            )}
            {missedCategories.length > 0 && (
              <div className="glass-ocean rounded-xl p-3">
                <p className="text-xs font-medium">⚠️ Most Missed</p>
                <p className="text-sm font-bold capitalize mt-0.5">{missedCategories[0]}</p>
                <p className="text-[10px] text-muted-foreground">Try adding {missedCategories[0]} actions</p>
              </div>
            )}
            {catBreakdown.all.length > 0 && (
              <div className="glass-ocean rounded-xl p-3">
                <p className="text-xs font-medium">📊 Category Trend</p>
                {catBreakdown.all.slice(0, 3).map(([cat, d]) => (
                  <div key={cat} className="flex justify-between text-xs mt-1">
                    <span className="capitalize">{cat}</span>
                    <span className="font-semibold text-ocean-teal">{d.count} actions</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
