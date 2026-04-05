import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, Leaf, Coins, Award, BarChart3, Vote } from 'lucide-react';
import OctomindChat from '@/components/chat/OctomindChat';

export default function ReportsPage() {
  const { user, actions, transactions, tokenLogs, badges, proposals } = useApp();

  const weekActions = useMemo(() =>
    actions.filter(a => Date.now() - a.timestamp.getTime() < 7 * 86400000),
    [actions]
  );
  const weekCo2 = weekActions.reduce((s, a) => s + a.co2Reduced, 0);
  const weekTokens = weekActions.reduce((s, a) => s + a.tokensEarned, 0);
  const votedCount = proposals.filter(p => user && p.voters.includes(user.id)).length;

  const topActions = useMemo(() => {
    const counts: Record<string, number> = {};
    weekActions.forEach(a => counts[a.type] = (counts[a.type] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [weekActions]);

  const exportReport = () => {
    if (!user) return;
    const report = [
      `OctoImpact 2.0 — Weekly Sustainability Report`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `User: ${user.name}`,
      ``,
      `=== Summary ===`,
      `EcoScore: ${user.ecoScore}/100`,
      `FSI Score: ${user.fsiScore}/100`,
      `Total Tokens: ${user.totalTokens}`,
      `Current Streak: ${user.streak} days`,
      `Level: ${user.level}`,
      ``,
      `=== This Week ===`,
      `Actions Logged: ${weekActions.length}`,
      `CO₂ Saved: ${weekCo2.toFixed(1)} kg`,
      `Tokens Earned: ${weekTokens}`,
      `Badges Earned: ${badges.length}`,
      `DAO Votes Cast: ${votedCount}`,
      ``,
      `=== Top Actions ===`,
      ...topActions.map(([type, count]) => `  ${type}: ${count}x`),
      ``,
      `=== Transactions ===`,
      `Total: ${transactions.length}`,
      `Green: ${transactions.filter(t => t.classification === 'green').length}`,
      `Neutral: ${transactions.filter(t => t.classification === 'neutral').length}`,
      `Carbon-Heavy: ${transactions.filter(t => t.classification === 'carbon-heavy').length}`,
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'octoimpact-weekly-report.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <motion.h1 className="text-3xl font-display font-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="ocean-gradient-text">Weekly</span> Report
            </motion.h1>
            <p className="text-muted-foreground">Your sustainability performance summary.</p>
          </div>
          <Button variant="ocean" className="gap-2" onClick={exportReport}>
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-5 text-center ocean-glow-hover">
              <TrendingUp className="h-5 w-5 mx-auto mb-2 text-ocean-teal" />
              <p className="text-3xl font-display font-black ocean-gradient-text">{user.ecoScore}</p>
              <p className="text-xs text-muted-foreground">EcoScore</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center ocean-glow-hover">
              <Leaf className="h-5 w-5 mx-auto mb-2 text-ocean-green" />
              <p className="text-3xl font-display font-black">{weekCo2.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">kg CO₂ this week</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center ocean-glow-hover">
              <Coins className="h-5 w-5 mx-auto mb-2 text-ocean-cyan" />
              <p className="text-3xl font-display font-black">{weekTokens}</p>
              <p className="text-xs text-muted-foreground">Tokens this week</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center ocean-glow-hover">
              <Award className="h-5 w-5 mx-auto mb-2 text-amber-500" />
              <p className="text-3xl font-display font-black">{badges.length}</p>
              <p className="text-xs text-muted-foreground">Badges earned</p>
            </div>
          </div>
        </section>

        {/* Week Details */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-ocean-teal" /> Week Breakdown
          </h2>
          <div className="glass rounded-2xl p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold mb-3">Top Actions</p>
                {topActions.length > 0 ? topActions.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-sm capitalize">{type.replace(/-/g, ' ')}</span>
                    <span className="text-sm font-bold">{count}×</span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No actions this week</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold mb-3">DAO Participation</p>
                <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                  <span className="text-sm">Votes Cast</span>
                  <span className="text-sm font-bold">{votedCount}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/30">
                  <span className="text-sm">Vote Power</span>
                  <span className="text-sm font-bold">{Math.max(1, Math.floor(user.totalTokens / 10))}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-sm">Active Proposals</span>
                  <span className="text-sm font-bold">{proposals.filter(p => p.status === 'active').length}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Equivalences */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4">Impact Equivalences</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5 text-center">
              <p className="text-2xl mb-1">🚗</p>
              <p className="text-lg font-black">{Math.round(weekCo2 * 3.9)}</p>
              <p className="text-[10px] text-muted-foreground">km of driving avoided</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center">
              <p className="text-2xl mb-1">🌳</p>
              <p className="text-lg font-black">{(weekCo2 / 22).toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground">trees equivalent (yearly)</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center">
              <p className="text-2xl mb-1">💡</p>
              <p className="text-lg font-black">{Math.round(weekCo2 * 2.3)}</p>
              <p className="text-[10px] text-muted-foreground">hours of LED light saved</p>
            </div>
          </div>
        </section>
      </main>
      {user && <OctomindChat />}
    </div>
  );
}
