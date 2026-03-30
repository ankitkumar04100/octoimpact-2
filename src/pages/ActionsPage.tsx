import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTION_TYPES } from '@/types';
import { computeActionImpact } from '@/engines/sustainability';
import { Check, Sparkles } from 'lucide-react';

export default function ActionsPage() {
  const { user, actions, logAction } = useApp();
  const [lastAction, setLastAction] = useState<{ type: string; tokens: number; co2: number } | null>(null);

  if (!user) return null;

  const handleAction = (type: string) => {
    const result = computeActionImpact(type, user);
    logAction(type);
    setLastAction({ type, tokens: result.tokens, co2: result.co2 });
    setTimeout(() => setLastAction(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-5xl mx-auto">
        <motion.h1 className="text-3xl font-display font-black mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Log an <span className="ocean-gradient-text">Action</span>
        </motion.h1>
        <p className="text-muted-foreground mb-8">Each action is scored, rewarded with tokens, and recorded on-chain.</p>

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
                  <p className="text-xs text-muted-foreground">{lastAction.co2} kg CO₂ saved</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {Object.entries(ACTION_TYPES).map(([type, cfg]) => (
            <motion.button
              key={type}
              onClick={() => handleAction(type)}
              className="glass rounded-2xl p-5 text-left card-hover group cursor-pointer"
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-3xl block mb-3">{cfg.icon}</span>
              <p className="font-semibold text-sm mb-1">{cfg.label}</p>
              <p className="text-xs text-muted-foreground">
                ~{cfg.co2Reduction} kg CO₂ • {cfg.baseTokens} tokens
              </p>
              <div className="mt-3 text-xs font-medium text-ocean-teal opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Check className="h-3 w-3" /> Tap to log
              </div>
            </motion.button>
          ))}
        </div>

        {/* Recent History */}
        <h2 className="text-xl font-display font-bold mb-4">Action History</h2>
        <div className="glass rounded-2xl divide-y divide-border/50">
          {actions.slice(0, 12).map(a => (
            <div key={a.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${a.blockchainStatus === 'confirmed' ? 'bg-ocean-green' : 'bg-yellow-400 animate-pulse'}`} />
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
    </div>
  );
}
