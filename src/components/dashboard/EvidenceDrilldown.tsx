import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, HelpCircle, ChevronRight } from 'lucide-react';
import { SustainabilityAction, FinTechTransaction } from '@/types';

interface Props {
  title: string;
  explanation: string;
  actions?: SustainabilityAction[];
  transactions?: FinTechTransaction[];
  computeDetail?: string;
}

export default function EvidenceDrilldown({ title, explanation, actions, transactions, computeDetail }: Props) {
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={() => setShowEvidence(!showEvidence)}
        className="text-[10px] text-ocean-teal hover:text-ocean-cyan transition-colors flex items-center gap-0.5 underline-offset-2 hover:underline"
        title="Show evidence"
      >
        <Eye className="h-3 w-3" /> Evidence
      </button>

      <div className="group relative">
        <HelpCircle className="h-3 w-3 text-muted-foreground/50 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 glass rounded-lg text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
          <p className="font-semibold text-foreground mb-0.5">{title}</p>
          <p>{explanation}</p>
        </div>
      </div>

      <AnimatePresence>
        {showEvidence && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowEvidence(false)}
          >
            <motion.div
              className="glass rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[70vh] overflow-y-auto shadow-xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-sm">{title} — Evidence</h3>
                <button onClick={() => setShowEvidence(false)} className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="glass-ocean rounded-xl p-3 mb-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Why this number?</p>
                <p>{explanation}</p>
                {computeDetail && <p className="mt-1 font-mono text-[10px]">{computeDetail}</p>}
              </div>

              {actions && actions.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-2">Contributing Actions ({actions.length})</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {actions.slice(0, 10).map(a => (
                      <div key={a.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-3 w-3 text-ocean-teal" />
                          <span className="capitalize">{a.type.replace(/-/g, ' ')}</span>
                        </div>
                        <div className="text-right text-muted-foreground">
                          <span>{a.co2Reduced.toFixed(1)} kg</span>
                          <span className="ml-2">+{a.tokensEarned}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {transactions && transactions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2">Contributing Transactions ({transactions.length})</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {transactions.slice(0, 10).map(t => (
                      <div key={t.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            t.classification === 'green' ? 'bg-ocean-green' :
                            t.classification === 'carbon-heavy' ? 'bg-destructive' : 'bg-muted-foreground'
                          }`} />
                          <span>{t.description}</span>
                        </div>
                        <span className="text-muted-foreground">${t.amount.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
