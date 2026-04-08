import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Scale, AlertTriangle, Target, BarChart3 } from 'lucide-react';
import { UserProfile, SustainabilityAction, FinTechTransaction } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface Props {
  user: UserProfile;
  actions: SustainabilityAction[];
  transactions: FinTechTransaction[];
}

export default function AdvancedKPIs({ user, actions, transactions }: Props) {
  const weekActions = useMemo(() =>
    actions.filter(a => Date.now() - a.timestamp.getTime() < 7 * 86400000), [actions]);

  const weekCo2 = useMemo(() =>
    weekActions.reduce((s, a) => s + a.co2Reduced, 0), [weekActions]);

  // Impact Velocity: EcoScore change per day over last 7 days
  const impactVelocity = useMemo(() => {
    if (actions.length < 2) return 0;
    const weekAgo = Date.now() - 7 * 86400000;
    const recentActions = actions.filter(a => a.timestamp.getTime() > weekAgo);
    const dailyImpact = recentActions.reduce((s, a) => s + a.impactValue, 0) / 7;
    return Math.round(dailyImpact * 10) / 10;
  }, [actions]);

  // Consistency Index: how regularly user logs (0-100)
  const consistencyIndex = useMemo(() => {
    if (actions.length < 2) return 0;
    const last14 = actions.filter(a => Date.now() - a.timestamp.getTime() < 14 * 86400000);
    const days = new Set(last14.map(a => new Date(a.timestamp).toDateString()));
    return Math.min(Math.round((days.size / 14) * 100), 100);
  }, [actions]);

  // Balance Score: how evenly user acts across categories
  const balanceScore = useMemo(() => {
    const cats: Record<string, number> = {};
    const allCats = ['transport', 'energy', 'diet', 'lifestyle', 'home'];
    weekActions.forEach(a => { cats[a.category] = (cats[a.category] || 0) + 1; });
    if (weekActions.length === 0) return 0;
    const total = weekActions.length;
    const ideal = total / allCats.length;
    const deviation = allCats.reduce((s, c) => s + Math.abs((cats[c] || 0) - ideal), 0);
    const maxDeviation = total * (1 - 1 / allCats.length) * 2;
    return maxDeviation > 0 ? Math.round((1 - deviation / maxDeviation) * 100) : 0;
  }, [weekActions]);

  // Risk Flags
  const riskFlags = useMemo(() => {
    const flags: string[] = [];
    const carbonHeavyTx = transactions.filter(t => t.classification === 'carbon-heavy' &&
      Date.now() - t.date.getTime() < 7 * 86400000);
    if (carbonHeavyTx.length > 3) flags.push('Carbon-heavy week');
    if (user.streak > 0 && user.streak < 3) flags.push('Streak at risk');
    const failedMints = actions.filter(a => a.blockchainStatus === 'error').length;
    if (failedMints > 0) flags.push(`${failedMints} mint failure${failedMints > 1 ? 's' : ''}`);
    if (transactions.length > 0 && transactions.length < 10) flags.push('Low data coverage');
    return flags;
  }, [actions, transactions, user.streak]);

  // Goal Completion Rate (weekly: 7 actions target)
  const goalRate = useMemo(() =>
    Math.min(Math.round((weekActions.length / 7) * 100), 100), [weekActions]);

  // CO2 equivalence
  const treeDaysEquiv = Math.round(weekCo2 / 0.06); // ~0.06 kg CO2 per tree per day

  const kpis = [
    {
      icon: Zap, label: 'Impact Velocity', value: `${impactVelocity}`,
      suffix: '/day', color: 'text-ocean-cyan',
      tooltip: 'Average daily impact points from your actions over the last 7 days',
    },
    {
      icon: BarChart3, label: 'Consistency', value: `${consistencyIndex}`,
      suffix: '/100', color: 'text-ocean-teal',
      tooltip: 'How many of the last 14 days had at least one logged action',
    },
    {
      icon: Scale, label: 'Balance', value: `${balanceScore}`,
      suffix: '/100', color: 'text-ocean-blue',
      tooltip: 'How evenly your actions spread across transport, energy, diet, lifestyle, and home',
    },
    {
      icon: AlertTriangle, label: 'Risk Flags', value: `${riskFlags.length}`,
      suffix: '', color: riskFlags.length > 0 ? 'text-orange-500' : 'text-ocean-green',
      tooltip: riskFlags.length > 0 ? riskFlags.join(' • ') : 'No active risks — keep it up!',
    },
    {
      icon: Target, label: 'Goal Rate', value: `${goalRate}`,
      suffix: '%', color: 'text-ocean-green',
      tooltip: `${weekActions.length}/7 actions this week. ${goalRate >= 100 ? 'Goal achieved!' : `${7 - weekActions.length} more to go.`}`,
    },
    {
      icon: TrendingUp, label: 'CO₂ Saved', value: weekCo2.toFixed(1),
      suffix: ' kg', color: 'text-ocean-teal',
      tooltip: `Equivalent to ${treeDaysEquiv} tree-days of carbon absorption`,
    },
  ];

  return (
    <TooltipProvider>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
      >
        {kpis.map(k => (
          <Tooltip key={k.label}>
            <TooltipTrigger asChild>
              <motion.div variants={fade} className="glass rounded-2xl p-4 pulse-glow ocean-glow-hover cursor-help">
                <div className="flex items-center gap-1.5 mb-1">
                  <k.icon className={`h-3.5 w-3.5 ${k.color}`} />
                  <span className="text-[10px] text-muted-foreground font-medium">{k.label}</span>
                </div>
                <p className="text-xl font-display font-black">
                  {k.value}<span className="text-[10px] font-normal text-muted-foreground">{k.suffix}</span>
                </p>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px] text-xs">
              {k.tooltip}
            </TooltipContent>
          </Tooltip>
        ))}
      </motion.div>
    </TooltipProvider>
  );
}
