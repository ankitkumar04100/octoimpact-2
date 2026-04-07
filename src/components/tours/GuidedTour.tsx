import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TourStep {
  target?: string; // CSS selector
  title: string;
  description: string;
  icon?: string;
}

interface Props {
  steps: TourStep[];
  tourKey: string;
  onComplete?: () => void;
}

export default function GuidedTour({ steps, tourKey, onComplete }: Props) {
  const storageKey = `octo-tour-${tourKey}`;
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const done = localStorage.getItem(storageKey);
    if (!done) setVisible(true);
  }, [storageKey]);

  const updatePosition = useCallback(() => {
    const step = steps[current];
    if (step?.target) {
      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setPosition({ top: rect.bottom + 12, left: Math.min(rect.left, window.innerWidth - 340) });
        el.classList.add('ring-2', 'ring-ocean-teal/50', 'ring-offset-2', 'rounded-xl');
        return () => el.classList.remove('ring-2', 'ring-ocean-teal/50', 'ring-offset-2', 'rounded-xl');
      }
    }
    setPosition(null);
  }, [current, steps]);

  useEffect(() => {
    if (!visible) return;
    const cleanup = updatePosition();
    return () => { if (typeof cleanup === 'function') cleanup(); };
  }, [visible, updatePosition]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(storageKey, 'done');
    // Clean up highlights
    document.querySelectorAll('.ring-ocean-teal\\/50').forEach(el => {
      el.classList.remove('ring-2', 'ring-ocean-teal/50', 'ring-offset-2', 'rounded-xl');
    });
    onComplete?.();
  };

  const next = () => {
    // Remove highlight from current
    const step = steps[current];
    if (step?.target) {
      const el = document.querySelector(step.target);
      el?.classList.remove('ring-2', 'ring-ocean-teal/50', 'ring-offset-2', 'rounded-xl');
    }
    if (current < steps.length - 1) setCurrent(c => c + 1);
    else dismiss();
  };

  const prev = () => {
    const step = steps[current];
    if (step?.target) {
      const el = document.querySelector(step.target);
      el?.classList.remove('ring-2', 'ring-ocean-teal/50', 'ring-offset-2', 'rounded-xl');
    }
    if (current > 0) setCurrent(c => c - 1);
  };

  if (!visible) return null;

  const step = steps[current];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={dismiss} />

        {/* Tooltip */}
        <motion.div
          className="absolute z-[101] pointer-events-auto glass rounded-2xl p-5 shadow-2xl max-w-xs border border-ocean-teal/20"
          style={position ? { top: position.top, left: Math.max(12, position.left) } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          key={current}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {step.icon && <span className="text-lg">{step.icon}</span>}
              <h4 className="font-display font-bold text-sm">{step.title}</h4>
            </div>
            <button onClick={dismiss} className="h-6 w-6 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80">
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{current + 1} / {steps.length}</span>
            <div className="flex gap-1.5">
              {current > 0 && (
                <Button variant="ghost" size="sm" onClick={prev} className="h-7 px-2 text-xs gap-1">
                  <ArrowLeft className="h-3 w-3" /> Back
                </Button>
              )}
              <Button variant="ocean" size="sm" onClick={next} className="h-7 px-3 text-xs gap-1">
                {current < steps.length - 1 ? <>Next <ArrowRight className="h-3 w-3" /></> : <><Sparkles className="h-3 w-3" /> Done</>}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
