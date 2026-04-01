import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Plus, Clock, CheckCircle, ThumbsUp, ThumbsDown, Info, Search, EyeOff, Eye } from 'lucide-react';
import OctomindChat from '@/components/chat/OctomindChat';

export default function DAOPage() {
  const { user, proposals, createProposal, vote } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState(7);
  const [category, setCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Live countdown timer
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const handleCreate = () => {
    if (!text.trim() || !desc.trim()) return;
    createProposal(text.trim(), desc.trim(), duration);
    setText(''); setDesc(''); setShowForm(false);
  };

  const active = proposals.filter(p => p.status === 'active' && new Date(p.endTime).getTime() > now);
  const completed = proposals.filter(p => p.status !== 'active' || new Date(p.endTime).getTime() <= now);
  const votingPower = Math.max(1, Math.floor(user.totalTokens / 10));
  const votedProposalIds = proposals.filter(p => p.voters.includes(user.id)).map(p => p.id);

  const filteredCompleted = useMemo(() => {
    if (!searchTerm) return completed;
    const lower = searchTerm.toLowerCase();
    return completed.filter(p => p.text.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower));
  }, [completed, searchTerm]);

  const formatTime = (endTime: Date) => {
    const ms = new Date(endTime).getTime() - now;
    if (ms <= 0) return 'Ended';
    const hours = Math.floor(ms / 3600000);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) return `${days}d ${remainingHours}h`;
    return `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <motion.h1 className="text-3xl font-display font-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="ocean-gradient-text">Impact</span>DAO
            </motion.h1>
            <p className="text-muted-foreground">Token-weighted governance for community sustainability decisions.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPrivacyMode(!privacyMode)} title={privacyMode ? 'Show identities' : 'Mask identities'}>
              {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ocean" onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" /> New Proposal
            </Button>
          </div>
        </div>

        {/* How it works */}
        <div className="glass-ocean rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Info className="h-4 w-4 text-ocean-teal mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p><strong className="text-foreground">Voting Power = OCTI Balance ÷ 10</strong></p>
            <p className="mt-1">Your tokens directly influence governance outcomes. Double voting is prevented. Proposals auto-finalize at end time.</p>
            {privacyMode && <p className="mt-1 text-ocean-teal font-medium">🔒 Privacy mode ON — identities are masked in the UI. Token weighting remains intact.</p>}
          </div>
        </div>

        {/* Voting Power */}
        <div className="glass-ocean rounded-2xl p-5 mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Your Voting Power</p>
            <p className="text-xs text-muted-foreground">Based on {user.totalTokens} ImpactTokens (1 vote per 10 tokens)</p>
          </div>
          <p className="text-3xl font-display font-black ocean-gradient-text">{votingPower}</p>
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div className="glass rounded-2xl p-6 mb-8" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <h3 className="font-display font-bold mb-4">Create Proposal</h3>
              <div className="space-y-4">
                <input
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Proposal title..."
                  value={text} onChange={e => setText(e.target.value)} maxLength={200}
                />
                <textarea
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none"
                  placeholder="Description..."
                  value={desc} onChange={e => setDesc(e.target.value)} maxLength={1000}
                />
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Category</label>
                    <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="general">General</option>
                      <option value="funding">Funding</option>
                      <option value="policy">Policy</option>
                      <option value="community">Community</option>
                      <option value="infrastructure">Infrastructure</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Duration</label>
                    <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                      <option value={1}>1 day</option>
                      <option value={3}>3 days</option>
                      <option value={7}>7 days</option>
                      <option value={14}>14 days</option>
                      <option value={30}>30 days</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button variant="ocean" onClick={handleCreate} disabled={!text.trim() || !desc.trim()}>Submit</Button>
                    <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Proposals */}
        <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-ocean-cyan" /> Active Proposals ({active.length})
        </h2>
        {active.length > 0 ? (
          <div className="space-y-4 mb-10">
            {active.map(p => {
              const total = p.yesVotes + p.noVotes;
              const yesPct = total > 0 ? (p.yesVotes / total) * 100 : 50;
              const hasVoted = p.voters.includes(user.id);

              return (
                <motion.div key={p.id} className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold">{p.text}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                    </div>
                    <span className="text-xs bg-ocean-teal/10 text-ocean-teal px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" /> {formatTime(p.endTime)}
                    </span>
                  </div>

                  <div className="h-4 rounded-full bg-muted overflow-hidden mb-2 relative">
                    <motion.div className="h-full bg-ocean-green rounded-full" initial={{ width: 0 }} animate={{ width: `${yesPct}%` }} transition={{ duration: 0.5 }} />
                    {total > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground/70">
                        {Math.round(yesPct)}% YES
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-4">
                    <span>👍 {p.yesVotes} yes ({total > 0 ? Math.round(yesPct) : 0}%)</span>
                    <span>👎 {p.noVotes} no ({total > 0 ? Math.round(100 - yesPct) : 0}%)</span>
                  </div>

                  {!hasVoted ? (
                    <div className="flex gap-2">
                      <Button variant="ocean" size="sm" onClick={() => vote(p.id, 'yes')} className="gap-1.5">
                        <ThumbsUp className="h-4 w-4" /> Vote Yes ({votingPower})
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => vote(p.id, 'no')} className="gap-1.5">
                        <ThumbsDown className="h-4 w-4" /> Vote No ({votingPower})
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-ocean-teal font-medium flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> You voted on this proposal (weight: {votingPower})
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    By {privacyMode ? 'Anonymous' : p.createdBy} • {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 text-center mb-10">
            <Vote className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No active proposals. Create one to get started!</p>
          </div>
        )}

        {/* Your Votes */}
        {votedProposalIds.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-display font-bold mb-4">Your Votes ({votedProposalIds.length})</h2>
            <div className="space-y-2">
              {proposals.filter(p => votedProposalIds.includes(p.id)).map(p => (
                <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.text}</p>
                    <p className="text-xs text-muted-foreground">{p.yesVotes} yes / {p.noVotes} no</p>
                  </div>
                  <span className="text-xs text-ocean-teal font-medium">✓ Voted (weight: {votingPower})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold">Completed ({completed.length})</h2>
              {completed.length > 3 && (
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    className="rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="space-y-3">
              {filteredCompleted.map(p => {
                const passed = p.yesVotes > p.noVotes;
                return (
                  <div key={p.id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{p.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {passed ? '✅ Passed' : '❌ Rejected'} • {p.yesVotes} yes / {p.noVotes} no
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${passed ? 'bg-ocean-green/10 text-ocean-green' : 'bg-destructive/10 text-destructive'}`}>
                        {passed ? 'PASSED' : 'REJECTED'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <OctomindChat />
    </div>
  );
}
