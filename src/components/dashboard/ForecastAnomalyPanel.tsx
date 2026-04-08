import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Activity, Eye } from 'lucide-react';
import { UserProfile, SustainabilityAction, FinTechTransaction } from '@/types';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface Props {
  user: UserProfile;
  actions: SustainabilityAction[];
  transactions: FinTechTransaction[];
}

export default function ForecastAnomalyPanel({ user, actions, transactions }: Props) {
  // EcoScore Forecast: linear trend from last 14 days of actions
  const forecast = useMemo(() => {
    const last14 = actions.filter(a => Date.now() - a.timestamp.getTime() < 14 * 86400000);
    const dailyImpact = last14.length > 0 ? last14.reduce((s, a) => s + a.impactValue, 0) / 14 : 0;
    const projectedDelta = Math.round(dailyImpact * 7 * 0.3); // 30% of raw impact translates to score
    const currentEco = user.ecoScore;
    const low = Math.max(0, Math.min(100, currentEco + projectedDelta - 5));
    const high = Math.min(100, currentEco + projectedDelta + 5);
    const confidence = last14.length >= 10 ? 'High' : last14.length >= 5 ? 'Medium' : 'Low';
    const signals = [];
    if (user.streak > 3) signals.push(`${user.streak}-day streak`);
    if (last14.length > 0) signals.push(`${last14.length} actions (14d)`);
    if (transactions.length > 0) signals.push(`${transactions.length} transactions`);
    return { low, high, confidence, signals, projectedDelta };
  }, [actions, transactions, user]);

  // CO2 forecast by category
  const co2Forecast = useMemo(() => {
    const cats: Record<string, number> = {};
    const last14 = actions.filter(a => Date.now() - a.timestamp.getTime() < 14 * 86400000);
    last14.forEach(a => { cats[a.category] = (cats[a.category] || 0) + a.co2Reduced; });
    return Object.entries(cats)
      .map(([cat, co2]) => ({ cat, weekProjection: Math.round((co2 / 14) * 7 * 10) / 10 }))
      .sort((a, b) => b.weekProjection - a.weekProjection)
      .slice(0, 4);
  }, [actions]);

  // Anomaly detection
  const anomalies = useMemo(() => {
    const items: { type: 'warning' | 'alert'; message: string; fix: string }[] = [];

    // Sudden EcoScore concern
    const recentActions = actions.filter(a => Date.now() - a.timestamp.getTime() < 3 * 86400000);
    const olderActions = actions.filter(a => {
      const age = Date.now() - a.timestamp.getTime();
      return age >= 3 * 86400000 && age < 10 * 86400000;
    });
    if (olderActions.length > 0 && recentActions.length === 0) {
      items.push({ type: 'alert', message: 'No actions in 3 days — EcoScore may drop', fix: 'Log an action now to maintain momentum' });
    }

    // Carbon-heavy spending spike
    const recentCarbonTx = transactions.filter(t => t.classification === 'carbon-heavy' && Date.now() - t.date.getTime() < 7 * 86400000);
    const olderCarbonTx = transactions.filter(t => t.classification === 'carbon-heavy' && Date.now() - t.date.getTime() >= 7 * 86400000 && Date.now() - t.date.getTime() < 14 * 86400000);
    if (recentCarbonTx.length > olderCarbonTx.length + 2) {
      items.push({ type: 'warning', message: `Carbon-heavy spending up: ${recentCarbonTx.length} vs ${olderCarbonTx.length} last week`, fix: 'Check FinTech page for merchant swaps' });
    }

    // Streak break probability
    if (user.streak > 0 && recentActions.length === 0) {
      items.push({ type: 'alert', message: `${user.streak}-day streak at risk — no action today`, fix: 'Quick-log a reusable bottle or walking action' });
    }

    // Mint failures
    const recentFails = actions.filter(a => a.blockchainStatus === 'error' && Date.now() - a.timestamp.getTime() < 7 * 86400000);
    if (recentFails.length > 0) {
      items.push({ type: 'warning', message: `${recentFails.length} mint failure${recentFails.length > 1 ? 's' : ''} this week`, fix: 'Visit Web3 page to retry failed mints' });
    }

    return items;
  }, [actions, transactions, user.streak]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Forecast Panel */}
      <motion.div className="glass rounded-2xl p-6 ocean-glow-hover" variants={fade} initial="hidden" animate="show">
        <h3 className="font-display font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-ocean-cyan" /> 7-Day Forecast
        </h3>
        <div className="glass-ocean rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">EcoScore Prediction</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              forecast.confidence === 'High' ? 'bg-ocean-green/10 text-ocean-green' :
              forecast.confidence === 'Medium' ? 'bg-ocean-cyan/10 text-ocean-cyan' :
              'bg-muted text-muted-foreground'
            }`}>{forecast.confidence} confidence</span>
          </div>
          <p className="text-3xl font-display font-black ocean-gradient-text">
            {forecast.low}–{forecast.high}
          </p>
          <p className={`text-xs mt-1 font-medium ${forecast.projectedDelta >= 0 ? 'text-ocean-green' : 'text-destructive'}`}>
            {forecast.projectedDelta >= 0 ? '↑' : '↓'} {Math.abs(forecast.projectedDelta)} projected change
          </p>
        </div>

        {forecast.signals.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
              <Eye className="h-3 w-3" /> Signals used
            </p>
            <div className="flex flex-wrap gap-1">
              {forecast.signals.map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
              ))}
            </div>
          </div>
        )}

        {co2Forecast.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">CO₂ forecast by category</p>
            {co2Forecast.map(f => (
              <div key={f.cat} className="flex justify-between text-xs py-1 border-b border-border/30 last:border-0">
                <span className="capitalize">{f.cat}</span>
                <span className="font-semibold text-ocean-teal">{f.weekProjection} kg</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Anomaly Detector */}
      <motion.div className="glass rounded-2xl p-6 ocean-glow-hover" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
        <h3 className="font-display font-bold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-500" /> Anomaly Detector
        </h3>
        {anomalies.length > 0 ? (
          <div className="space-y-3">
            {anomalies.map((a, i) => (
              <div key={i} className={`rounded-xl p-4 text-sm ${
                a.type === 'alert' ? 'bg-destructive/5 border border-destructive/20' : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${a.type === 'alert' ? 'text-destructive' : 'text-orange-500'}`} />
                  <div>
                    <p className="font-medium text-xs">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">💡 {a.fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">✅</span>
            <p className="text-sm font-medium text-ocean-green">All clear!</p>
            <p className="text-xs text-muted-foreground mt-1">No anomalies detected. You're on track.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
