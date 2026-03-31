import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, TrendingUp, TrendingDown } from 'lucide-react';
import { SustainabilityAction } from '@/types';
import { computeEcoScore } from '@/engines/sustainability';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function EcoScoreChart({ actions }: { actions: SustainabilityAction[] }) {
  const { ecoData, weeklyDelta } = useMemo(() => {
    const sorted = [...actions].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const pts: { date: string; score: number }[] = [];
    for (let i = 0; i < sorted.length; i += Math.max(1, Math.floor(sorted.length / 12))) {
      const subset = sorted.slice(0, i + 1);
      pts.push({
        date: sorted[i].timestamp.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        score: computeEcoScore(subset),
      });
    }
    // Weekly delta
    const now = Date.now();
    const WEEK = 7 * 86400000;
    const thisWeek = actions.filter(a => now - a.timestamp.getTime() < WEEK);
    const lastWeek = actions.filter(a => now - a.timestamp.getTime() >= WEEK && now - a.timestamp.getTime() < 2 * WEEK);
    const delta = thisWeek.length > 0 && lastWeek.length > 0
      ? computeEcoScore(thisWeek) - computeEcoScore(lastWeek)
      : 0;
    return { ecoData: pts, weeklyDelta: delta };
  }, [actions]);

  return (
    <motion.div className="lg:col-span-2 glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold flex items-center gap-2">
          <Leaf className="h-5 w-5 text-ocean-teal" /> EcoScore Timeline
        </h3>
        {weeklyDelta !== 0 && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${weeklyDelta > 0 ? 'bg-ocean-green/10 text-ocean-green' : 'bg-destructive/10 text-destructive'}`}>
            {weeklyDelta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {weeklyDelta > 0 ? '+' : ''}{weeklyDelta} this week
          </span>
        )}
      </div>
      {ecoData.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={ecoData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(200 12% 48%)" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(200 12% 48%)" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey="score" stroke="hsl(180 65% 30%)" strokeWidth={3} dot={{ fill: 'hsl(180 65% 30%)', r: 4 }} activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(180 65% 30%)' }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-muted-foreground text-sm py-16 text-center">Log actions to see your EcoScore evolve</p>
      )}
    </motion.div>
  );
}
