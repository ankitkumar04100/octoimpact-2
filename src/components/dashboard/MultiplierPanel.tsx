import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { UserProfile } from '@/types';
import { getMultiplierDescription } from '@/engines/gamification';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function MultiplierPanel({ user }: { user: UserProfile }) {
  const multipliers = getMultiplierDescription(user);
  const totalBonus = Math.min(user.streak, 50) + Math.min(Math.round(user.energyPoints / 10), 30) + Math.min(Math.round(user.fsiScore / 5), 20);

  return (
    <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.15 }}>
      <h3 className="font-display font-bold mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-yellow-500" /> Active Multipliers
      </h3>
      <div className="text-center mb-4">
        <p className="text-4xl font-display font-black ocean-gradient-text">+{totalBonus}%</p>
        <p className="text-xs text-muted-foreground">Total Bonus</p>
      </div>
      <div className="space-y-2">
        {multipliers.length > 0 ? multipliers.map((m, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span>{m}</span>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground text-center">Start actions to unlock multipliers!</p>
        )}
      </div>
    </motion.div>
  );
}
