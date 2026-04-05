import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const TICKER_MESSAGES = [
  (u: any) => u.streak >= 7 ? `🔥 ${u.streak}-day streak active! Consistency bonus +${u.streak}%` : null,
  (u: any) => `📊 EcoScore ${u.ecoScore}/100 — ${u.ecoScore >= 70 ? 'solid progress!' : 'room to grow'}`,
  (u: any, acts: any[]) => {
    const weekActs = acts.filter(a => Date.now() - a.timestamp.getTime() < 7 * 86400000);
    const co2 = weekActs.reduce((s: number, a: any) => s + a.co2Reduced, 0);
    return co2 > 0 ? `🌍 ${co2.toFixed(1)} kg CO₂ saved this week — ~${Math.round(co2 * 0.44)} car-free miles` : null;
  },
  (u: any) => u.totalTokens > 0 ? `💎 ${u.totalTokens} ImpactTokens earned — ${u.totalTokens >= 500 ? 'Platinum tier!' : `${500 - u.totalTokens} to Platinum`}` : null,
  (u: any) => `⚡ Level ${u.level} — ${u.energyPoints.toFixed(0)} energy points accumulated`,
  (_u: any, acts: any[]) => {
    const cats: Record<string, number> = {};
    acts.forEach(a => cats[a.category] = (cats[a.category] || 0) + a.co2Reduced);
    const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
    return top ? `🏆 Top category: ${top[0]} (${top[1].toFixed(1)} kg CO₂ saved)` : null;
  },
  (u: any) => u.fsiScore > 0 ? `💰 FSI Score: ${u.fsiScore}/100 — ${u.fsiScore >= 60 ? 'eco-friendly spending!' : 'optimize your green spend ratio'}` : null,
];

export default function AITicker() {
  const { user, actions } = useApp();
  const [index, setIndex] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);

  const buildMessages = useCallback(() => {
    if (!user) return [];
    return TICKER_MESSAGES
      .map(fn => fn(user, actions))
      .filter((m): m is string => !!m);
  }, [user, actions]);

  useEffect(() => {
    setMessages(buildMessages());
  }, [buildMessages]);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages.length]);

  if (!user || messages.length === 0) return null;

  return (
    <div className="glass-ocean rounded-2xl px-5 py-3 mb-6 overflow-hidden relative">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-ocean-cyan shrink-0 animate-pulse" />
        <span className="text-[10px] font-bold text-ocean-teal uppercase tracking-wider shrink-0">AI Ticker</span>
        <div className="flex-1 overflow-hidden h-5 relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              className="text-sm font-medium absolute inset-0 whitespace-nowrap"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {messages[index]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
