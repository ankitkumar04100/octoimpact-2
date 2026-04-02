import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, CheckCircle } from 'lucide-react';
import { Badge, UserProfile, TIER_COLORS } from '@/types';
import { BADGE_THRESHOLDS } from '@/engines/tokenomics';
import { ACHIEVEMENTS_CONFIG } from '@/engines/gamification';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface Props {
  user: UserProfile;
  badges: Badge[];
  actions: { type: string; category: string }[];
}

const COLLECTIONS = [
  {
    name: 'Streak Collection',
    icon: '🔥',
    badgeIds: ['bronze-streak', 'silver-streak', 'gold-streak'],
  },
  {
    name: 'Impact Collection',
    icon: '🌍',
    badgeIds: ['platinum-tokens', 'legendary'],
  },
];

const ACHIEVEMENT_COLLECTIONS = [
  {
    name: 'Finance Collection',
    icon: '💰',
    achievementIds: ['planet-protector'],
  },
  {
    name: 'Governance Collection',
    icon: '🏛️',
    achievementIds: ['eco-warrior'],
  },
];

export default function BadgeCollections({ user, badges, actions }: Props) {
  const earnedBadgeIds = new Set(badges.map(b => b.id));

  const badgeProgress = useMemo(() => {
    const progress: Record<string, { current: number; target: number; label: string }> = {};
    for (const t of BADGE_THRESHOLDS) {
      if (t.id === 'bronze-streak') progress[t.id] = { current: Math.min(user.streak, 7), target: 7, label: 'Streak days' };
      else if (t.id === 'silver-streak') progress[t.id] = { current: Math.min(user.streak, 30), target: 30, label: 'Streak days' };
      else if (t.id === 'gold-streak') progress[t.id] = { current: Math.min(user.streak, 60), target: 60, label: 'Streak days' };
      else if (t.id === 'platinum-tokens') progress[t.id] = { current: Math.min(user.totalTokens, 500), target: 500, label: 'Tokens' };
      else if (t.id === 'legendary') progress[t.id] = { current: Math.min(user.totalTokens, 1000), target: 1000, label: 'Tokens + 90d streak' };
    }
    return progress;
  }, [user]);

  return (
    <motion.div className="space-y-8" variants={fade} initial="hidden" animate="show">
      <div className="flex items-center gap-2 mb-2">
        <Award className="h-6 w-6 text-amber-500" />
        <h2 className="text-xl font-display font-bold">Badge Collections</h2>
      </div>

      {COLLECTIONS.map(col => (
        <div key={col.name} className="glass rounded-2xl p-6">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">{col.icon}</span> {col.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {col.badgeIds.map(bid => {
              const threshold = BADGE_THRESHOLDS.find(t => t.id === bid);
              if (!threshold) return null;
              const earned = earnedBadgeIds.has(bid);
              const prog = badgeProgress[bid];
              const earnedBadge = badges.find(b => b.id === bid);
              const pct = prog ? Math.min((prog.current / prog.target) * 100, 100) : 0;

              return (
                <motion.div
                  key={bid}
                  className={`rounded-2xl p-5 relative overflow-hidden ${
                    earned
                      ? `bg-gradient-to-br ${TIER_COLORS[threshold.tier]} text-primary-foreground`
                      : 'glass border-2 border-dashed border-border'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{earned ? '🏅' : '🔒'}</span>
                    {earned ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="font-bold text-sm">{threshold.name}</p>
                  <p className={`text-xs mt-1 ${earned ? 'opacity-80' : 'text-muted-foreground'}`}>
                    {threshold.description}
                  </p>
                  <p className={`text-[10px] mt-1 font-semibold ${earned ? 'opacity-70' : 'text-muted-foreground'}`}>
                    {threshold.tier.toUpperCase()}
                  </p>

                  {!earned && prog && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full ocean-gradient" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {prog.current}/{prog.target} {prog.label}
                      </p>
                    </div>
                  )}

                  {earned && earnedBadge && (
                    <div className="mt-2">
                      <p className="text-[10px] opacity-70">
                        Minted {earnedBadge.earnedAt.toLocaleDateString()}
                      </p>
                      <p className="text-[10px] opacity-60 font-mono">
                        {earnedBadge.tokenId.slice(0, 16)}...
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Achievements Grid */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-bold mb-4 flex items-center gap-2">
          <span className="text-xl">🏆</span> Achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS_CONFIG.map(a => {
            let progress = 0;
            if (a.id === 'first-step') progress = Math.min(actions.length, 1);
            else if (a.id === 'eco-warrior') progress = Math.min(actions.length, 50);
            else if (a.id === 'plastic-free') progress = Math.min(actions.filter(x => x.type === 'no-plastic').length, 7);
            else if (a.id === 'carbon-zero') progress = Math.min(user.ecoScore, 80);
            else if (a.id === 'energy-guardian') progress = Math.min(actions.filter(x => x.category === 'energy').length, 20);
            else if (a.id === 'planet-protector') progress = Math.min(user.totalTokens, 1000);

            const earned = progress >= a.target;
            const pct = Math.round((progress / a.target) * 100);

            return (
              <div key={a.id} className={`glass-ocean rounded-xl p-4 ${earned ? 'ring-2 ring-ocean-teal/30' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${earned ? 'text-ocean-teal' : ''}`}>
                      {a.title} {earned && '✅'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{a.description}</p>
                    <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                      <div className="h-full rounded-full ocean-gradient" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{progress}/{a.target}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
