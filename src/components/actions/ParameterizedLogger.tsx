import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Clock, Droplets, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PARAM_CONFIG: Record<string, { label: string; unit: string; icon: React.ReactNode; min: number; max: number; step: number; default: number }> = {
  'walking': { label: 'Distance', unit: 'km', icon: <Ruler className="h-3.5 w-3.5" />, min: 0.5, max: 20, step: 0.5, default: 2 },
  'cycling': { label: 'Distance', unit: 'km', icon: <Ruler className="h-3.5 w-3.5" />, min: 1, max: 50, step: 1, default: 5 },
  'public-transport': { label: 'Duration', unit: 'min', icon: <Clock className="h-3.5 w-3.5" />, min: 10, max: 120, step: 5, default: 30 },
  'power-saving': { label: 'Hours saved', unit: 'hrs', icon: <Clock className="h-3.5 w-3.5" />, min: 1, max: 12, step: 1, default: 2 },
  'ac-optimization': { label: 'Hours adjusted', unit: 'hrs', icon: <Clock className="h-3.5 w-3.5" />, min: 1, max: 8, step: 1, default: 3 },
  'water-conservation': { label: 'Liters saved', unit: 'L', icon: <Droplets className="h-3.5 w-3.5" />, min: 5, max: 200, step: 5, default: 20 },
  'veg-day': { label: 'Meals', unit: 'meals', icon: <UtensilsCrossed className="h-3.5 w-3.5" />, min: 1, max: 5, step: 1, default: 3 },
  'eco-shopping': { label: 'Amount', unit: '$', icon: <ShoppingBag className="h-3.5 w-3.5" />, min: 5, max: 500, step: 5, default: 30 },
};

export function getParamMultiplier(actionType: string, paramValue: number): number {
  const cfg = PARAM_CONFIG[actionType];
  if (!cfg) return 1;
  return Math.max(0.5, Math.min(paramValue / cfg.default, 3));
}

export function hasParameters(actionType: string): boolean {
  return actionType in PARAM_CONFIG;
}

interface Props {
  actionType: string;
  actionLabel: string;
  actionIcon: string;
  onConfirm: (paramValue: number, multiplier: number) => void;
  onCancel: () => void;
}

export default function ParameterizedLogger({ actionType, actionLabel, actionIcon, onConfirm, onCancel }: Props) {
  const cfg = PARAM_CONFIG[actionType];
  const [value, setValue] = useState(cfg?.default ?? 1);

  if (!cfg) {
    onConfirm(1, 1);
    return null;
  }

  const multiplier = getParamMultiplier(actionType, value);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="glass rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">{actionIcon}</span>
          <div>
            <p className="font-display font-bold">{actionLabel}</p>
            <p className="text-xs text-muted-foreground">Set parameters for accurate impact</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                {cfg.icon} {cfg.label}
              </label>
              <span className="text-sm font-bold ocean-gradient-text">{value} {cfg.unit}</span>
            </div>
            <input
              type="range"
              min={cfg.min}
              max={cfg.max}
              step={cfg.step}
              value={value}
              onChange={e => setValue(Number(e.target.value))}
              className="w-full accent-ocean-teal"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{cfg.min} {cfg.unit}</span>
              <span>{cfg.max} {cfg.unit}</span>
            </div>
          </div>

          <div className="glass-ocean rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">Impact multiplier</p>
            <p className="text-2xl font-display font-black ocean-gradient-text">{multiplier.toFixed(1)}×</p>
            <p className="text-[10px] text-muted-foreground">
              {multiplier > 1.2 ? '🚀 Above average effort!' : multiplier < 0.8 ? '💡 Every bit counts' : '✅ Standard impact'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <Button variant="ocean" className="flex-1" onClick={() => onConfirm(value, multiplier)}>
            Log Action ({multiplier.toFixed(1)}×)
          </Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
