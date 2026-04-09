import { motion } from 'framer-motion';
import { X, ExternalLink, Shield, Sparkles, Lock } from 'lucide-react';
import { Badge, TIER_COLORS } from '@/types';
import { Button } from '@/components/ui/button';
import { BADGE_THRESHOLDS } from '@/engines/tokenomics';

const RARITY_MAP: Record<string, { label: string; color: string; pct: string }> = {
  bronze: { label: 'Common', color: 'text-amber-600', pct: '~40% of users' },
  silver: { label: 'Uncommon', color: 'text-slate-400', pct: '~20% of users' },
  gold: { label: 'Rare', color: 'text-yellow-500', pct: '~8% of users' },
  platinum: { label: 'Epic', color: 'text-cyan-400', pct: '~3% of users' },
  legendary: { label: 'Legendary', color: 'text-purple-500', pct: '<1% of users' },
};

const UNLOCK_EFFECTS: Record<string, string> = {
  bronze: '🔓 Unlocks: +2% token multiplier on all actions',
  silver: '🔓 Unlocks: +5% token multiplier + access to premium ocean theme',
  gold: '🔓 Unlocks: +8% multiplier + reduced DAO proposal threshold',
  platinum: '🔓 Unlocks: +12% multiplier + create proposals with 0 minimum tokens',
  legendary: '🔓 Unlocks: +20% multiplier + exclusive Legendary dashboard theme + priority AI insights',
};

interface Props {
  badge: Badge;
  onClose: () => void;
}

export default function NFTDetailModal({ badge, onClose }: Props) {
  const rarity = RARITY_MAP[badge.tier] || RARITY_MAP.bronze;
  const unlock = UNLOCK_EFFECTS[badge.tier] || '';
  const threshold = BADGE_THRESHOLDS.find(t => t.id === badge.id);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="max-w-md w-full mx-4 rounded-2xl overflow-hidden shadow-2xl"
        initial={{ scale: 0.85, rotateY: -15 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className={`bg-gradient-to-br ${TIER_COLORS[badge.tier]} p-8 text-primary-foreground text-center relative`}>
          <button onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
            <X className="h-4 w-4" />
          </button>
          <motion.p
            className="text-6xl mb-3"
            animate={{ y: [0, -6, 0], rotate: [0, 3, 0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🏅
          </motion.p>
          <h2 className="text-xl font-display font-black">{badge.name}</h2>
          <p className="text-sm opacity-80 mt-1">{badge.description}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={`text-xs font-bold ${rarity.color} bg-white/20 px-2.5 py-1 rounded-full`}>
              {rarity.label}
            </span>
            <span className="text-xs opacity-70">{rarity.pct}</span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-background p-6 space-y-4">
          {/* Criteria */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Criteria
            </h3>
            <p className="text-sm">{threshold?.description || badge.description}</p>
          </div>

          {/* Mint Info */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" /> Mint Details
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minted</span>
                <span className="font-medium">{badge.earnedAt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token ID</span>
                <span className="font-mono text-xs">{badge.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Standard</span>
                <span className="font-medium">ERC-721</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tier</span>
                <span className="font-bold capitalize">{badge.tier}</span>
              </div>
            </div>
          </div>

          {/* Unlock Effect */}
          <div className="glass-ocean rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-ocean-teal" /> Unlock Effect
            </h3>
            <p className="text-sm font-medium text-ocean-teal">{unlock}</p>
          </div>

          <Button variant="ocean" className="w-full gap-2" onClick={onClose}>
            <Lock className="h-4 w-4" /> Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
