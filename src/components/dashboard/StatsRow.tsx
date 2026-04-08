import { motion } from 'framer-motion';
import { TrendingUp, Coins, Flame, Leaf } from 'lucide-react';
import { UserProfile } from '@/types';
import { getLevelProgress } from '@/engines/gamification';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface StatsRowProps {
  user: UserProfile;
}

export default function StatsRow({ user }: StatsRowProps) {
  const levelInfo = getLevelProgress(user.totalTokens);

  const stats = [
    { icon: Leaf, label: 'EcoScore', value: user.ecoScore, suffix: '/100', color: 'text-ocean-teal' },
    { icon: Coins, label: 'Tokens', value: user.totalTokens, suffix: ` (+${user.todayTokens})`, color: 'text-ocean-cyan' },
    { icon: Flame, label: 'Streak', value: user.streak, suffix: ' days', color: 'text-orange-500' },
    { icon: TrendingUp, label: 'Level', value: levelInfo.level, suffix: ` (${Math.round(levelInfo.progress)}%)`, color: 'text-ocean-blue' },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      initial="hidden" animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {stats.map(s => (
        <motion.div key={s.label} variants={fade} className="glass rounded-2xl p-5 card-hover pulse-glow">
          <div className="flex items-center gap-2 mb-2">
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
          </div>
          <p className="text-3xl font-display font-black">
            {s.value}<span className="text-sm font-normal text-muted-foreground">{s.suffix}</span>
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
