import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { TIER_COLORS } from '@/types';
import { Wallet, Coins, Image, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Web3Page() {
  const { user, badges, tokenLogs } = useApp();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(user.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-5xl mx-auto">
        <motion.h1 className="text-3xl font-display font-black mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="ocean-gradient-text">Web3</span> Wallet
        </motion.h1>
        <p className="text-muted-foreground mb-8">Your ImpactTokens, EcoBadge NFTs, and on-chain activity.</p>

        {/* Wallet Card */}
        <motion.div className="glass-ocean rounded-2xl p-8 mb-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-6 w-6 text-ocean-teal" />
                <span className="font-display font-bold text-lg">Custodial Wallet</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <code className="text-sm font-mono bg-background/50 px-3 py-1.5 rounded-lg">{user.walletAddress}</code>
                <Button variant="ghost" size="icon" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
                {copied && <span className="text-xs text-ocean-teal">Copied!</span>}
              </div>
              <p className="text-xs text-muted-foreground">Testnet • Encrypted custodial wallet</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-display font-black ocean-gradient-text">{user.totalTokens}</p>
              <p className="text-sm text-muted-foreground">ImpactTokens (ERC-20)</p>
            </div>
          </div>
        </motion.div>

        {/* Token Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Earned', value: user.totalTokens },
            { label: 'Today', value: user.todayTokens },
            { label: 'NFTs Minted', value: badges.length },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-5 text-center">
              <p className="text-2xl font-display font-black">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* NFT Badge Gallery */}
        <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
          <Image className="h-5 w-5 text-ocean-cyan" /> EcoBadge NFTs
        </h2>
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {badges.map((badge, i) => (
              <motion.div
                key={badge.id}
                className={`rounded-2xl p-6 text-center bg-gradient-to-br ${TIER_COLORS[badge.tier]} text-primary-foreground shadow-lg`}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: i * 0.1 }}
              >
                <p className="text-4xl mb-3">🏅</p>
                <p className="font-bold text-sm">{badge.name}</p>
                <p className="text-xs opacity-80 mt-1">{badge.description}</p>
                <div className="mt-3 text-xs opacity-70">
                  <p>{badge.tier.toUpperCase()}</p>
                  <p className="font-mono mt-1">{badge.tokenId.slice(0, 16)}...</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center mb-8">
            <p className="text-4xl mb-4">🏅</p>
            <p className="text-muted-foreground">Complete milestones to earn EcoBadge NFTs</p>
            <p className="text-xs text-muted-foreground mt-2">7-day streak → Bronze • 30-day → Silver • 500 tokens → Platinum</p>
          </div>
        )}

        {/* Transaction History */}
        <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
          <ExternalLink className="h-5 w-5" /> On-Chain Activity
        </h2>
        <div className="glass rounded-2xl divide-y divide-border/50">
          {tokenLogs.slice(0, 15).map(log => (
            <div key={log.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">+{log.amount} ImpactTokens</p>
                <p className="text-xs text-muted-foreground">{log.actionType.replace(/-/g, ' ')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-muted-foreground">{log.txHash.slice(0, 14)}...</p>
                <p className="text-xs text-muted-foreground">{log.timestamp.toLocaleString()}</p>
              </div>
            </div>
          ))}
          {tokenLogs.length === 0 && (
            <p className="p-8 text-center text-muted-foreground text-sm">No on-chain activity yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
