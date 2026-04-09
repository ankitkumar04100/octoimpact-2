import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { TIER_COLORS } from '@/types';
import type { Badge } from '@/types';
import { Wallet, Coins, Image, ExternalLink, Copy, Shield, LinkIcon, Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import OctomindChat from '@/components/chat/OctomindChat';
import GuidedTour from '@/components/tours/GuidedTour';
import { WEB3_TOUR } from '@/components/tours/tourSteps';
import FloatingParticles from '@/components/animations/FloatingParticles';
import NFTDetailModal from '@/components/web3/NFTDetailModal';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function Web3Page() {
  const { user, badges, tokenLogs } = useApp();
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'all' | 'nft' | 'token'>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const wallet = useWallet();

  if (!user) return null;

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
  };

  const totalMinted = tokenLogs.reduce((s, l) => s + l.amount, 0);
  const filteredLogs = filter === 'all' ? tokenLogs :
    filter === 'nft' ? tokenLogs.filter(l => l.nftIssued) :
    tokenLogs.filter(l => !l.nftIssued);

  const pendingCount = tokenLogs.filter(l => l.txHash.startsWith('0x')).length;
  const successCount = tokenLogs.length;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingParticles />
      <AnimatePresence>
        {selectedBadge && <NFTDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}
      </AnimatePresence>
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-5xl mx-auto">
        <motion.h1 className="text-3xl font-display font-black mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="ocean-gradient-text">Web3</span> Trust Hub
        </motion.h1>
        <p className="text-muted-foreground mb-8">Your ImpactTokens, EcoBadge NFTs, wallet, and on-chain activity.</p>

        {/* --- Section: Wallet Management --- */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4">Wallet Management</h2>

          {/* Custodial Wallet */}
          <motion.div className="glass-ocean rounded-2xl p-6 mb-4" variants={fade} initial="hidden" animate="show">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="h-5 w-5 text-ocean-teal" />
                  <span className="font-display font-bold">Custodial Wallet</span>
                  <span className="text-[10px] bg-ocean-teal/10 text-ocean-teal px-2 py-0.5 rounded-full font-medium">Testnet</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <code className="text-sm font-mono bg-background/50 px-3 py-1.5 rounded-lg">{user.walletAddress}</code>
                  <Button variant="ghost" size="icon" onClick={() => copyAddress(user.walletAddress)} className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                  {copied && <span className="text-xs text-ocean-teal animate-fade-in-up">Copied!</span>}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Encrypted custodial wallet • Testnet chain
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-display font-black ocean-gradient-text">{user.totalTokens}</p>
                <p className="text-sm text-muted-foreground">ImpactTokens (ERC-20)</p>
              </div>
            </div>
          </motion.div>

          {/* MetaMask Connect */}
          <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.05 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-ocean-cyan" />
                <span className="font-display font-bold">External Wallet</span>
              </div>
              {wallet.connected ? (
                <Button variant="outline" size="sm" onClick={wallet.disconnect} className="gap-1.5 text-xs">
                  Disconnect
                </Button>
              ) : (
                <Button variant="ocean" size="sm" onClick={wallet.connect} className="gap-1.5 text-xs" disabled={!wallet.hasProvider}>
                  <LinkIcon className="h-3.5 w-3.5" />
                  {wallet.hasProvider ? 'Connect MetaMask' : 'Install MetaMask'}
                </Button>
              )}
            </div>

            {wallet.connected && wallet.address ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-ocean-green" />
                  <code className="text-sm font-mono">{wallet.shortAddress}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyAddress(wallet.address!)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Chain: <strong className="text-foreground">{wallet.chainName}</strong></span>
                  {wallet.balance && <span>Balance: <strong className="text-foreground">{wallet.balance} ETH</strong></span>}
                </div>
              </div>
            ) : !wallet.hasProvider ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span>MetaMask not detected. <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-ocean-teal underline">Install MetaMask</a> to connect an external wallet.</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Connect MetaMask to view your external wallet balance and transfer assets.</p>
            )}

            {wallet.error && (
              <div className="mt-2 text-xs text-destructive flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> {wallet.error}
              </div>
            )}
          </motion.div>
        </section>

        {/* --- Section: Token Stats --- */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4">Token Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Minted', value: totalMinted, icon: Coins },
              { label: 'Today', value: user.todayTokens, icon: Coins },
              { label: 'NFTs Minted', value: badges.length, icon: Image },
              { label: 'Transactions', value: tokenLogs.length, icon: ExternalLink },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-5 text-center">
                <s.icon className="h-4 w-4 mx-auto mb-2 text-ocean-cyan" />
                <p className="text-2xl font-display font-black">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- Section: Token Utility --- */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4">Token Utility</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5">
              <p className="text-2xl mb-2">🗳️</p>
              <p className="font-bold text-sm">DAO Voting Power</p>
              <p className="text-xs text-muted-foreground mt-1">1 vote weight per 10 OCTI tokens. Your current power: <strong>{Math.max(1, Math.floor(user.totalTokens / 10))}</strong></p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-2xl mb-2">🎨</p>
              <p className="font-bold text-sm">Theme Unlocks</p>
              <p className="text-xs text-muted-foreground mt-1">Earn 100+ tokens to unlock premium ocean themes and custom dashboard layouts.</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-2xl mb-2">🏅</p>
              <p className="font-bold text-sm">Badge Milestones</p>
              <p className="text-xs text-muted-foreground mt-1">Tokens contribute to Platinum (500) and Legendary (1000) badge thresholds.</p>
            </div>
          </div>
        </section>

        {/* --- Section: Safety Notice --- */}
        <section className="mb-8">
          <div className="glass-ocean rounded-2xl p-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-ocean-teal mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Testnet & Safety</p>
              <p>Tokens are minted on a local/testnet chain. Transaction references are real but not on mainnet. On switching to Real mode, demo assets are flagged off-chain and new mints go on-chain per the migration policy.</p>
            </div>
          </div>
        </section>

        {/* --- Section: NFT Badge Gallery --- */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Image className="h-5 w-5 text-ocean-cyan" /> EcoBadge NFTs
          </h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  className={`rounded-2xl p-6 bg-gradient-to-br ${TIER_COLORS[badge.tier]} text-primary-foreground shadow-lg relative overflow-hidden nft-card-spring cursor-pointer`}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -6, rotateY: 5 }}
                  onClick={() => setSelectedBadge(badge)}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity rounded-2xl" />
                  <p className="text-4xl mb-3 relative">🏅</p>
                  <p className="font-bold text-sm relative">{badge.name}</p>
                  <p className="text-xs opacity-80 mt-1 relative">{badge.description}</p>
                  <div className="mt-3 text-xs opacity-70 relative space-y-0.5">
                    <p className="font-semibold">{badge.tier.toUpperCase()}</p>
                    <p className="font-mono text-[10px]">{badge.tokenId.slice(0, 16)}...</p>
                    <p className="text-[10px]">{badge.earnedAt.toLocaleDateString()}</p>
                    <p className="text-[10px] underline">Click for details →</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-4xl mb-4">🏅</p>
              <p className="text-muted-foreground">Complete milestones to earn EcoBadge NFTs</p>
              <p className="text-xs text-muted-foreground mt-2">7-day streak → Bronze • 30-day → Silver • 500 tokens → Platinum</p>
            </div>
          )}
        </section>

        {/* --- Section: On-Chain Activity --- */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold flex items-center gap-2">
              <ExternalLink className="h-5 w-5" /> On-Chain Activity
            </h2>
            <div className="flex gap-1">
              {(['all', 'token', 'nft'] as const).map(f => (
                <button
                  key={f}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                    filter === f ? 'bg-ocean-teal text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'nft' ? 'NFTs' : 'Tokens'}
                </button>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl divide-y divide-border/50">
            {filteredLogs.slice(0, 20).map(log => (
              <div key={log.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${log.nftIssued ? 'bg-ocean-cyan' : 'bg-ocean-green'}`} />
                  <div>
                    <p className="text-sm font-medium">+{log.amount} ImpactTokens{log.nftIssued ? ' + NFT' : ''}</p>
                    <p className="text-xs text-muted-foreground">{log.actionType.replace(/-/g, ' ')}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">{log.txHash.slice(0, 14)}...</p>
                    <p className="text-xs text-muted-foreground">{log.timestamp.toLocaleString()}</p>
                  </div>
                  <button className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted/80" onClick={() => copyHash(log.txHash)} title="Copy hash">
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <p className="p-8 text-center text-muted-foreground text-sm">No on-chain activity yet</p>
            )}
          </div>
        </section>
      </main>
      <OctomindChat />
      <GuidedTour steps={WEB3_TOUR} tourKey="web3" />
    </div>
  );
}
