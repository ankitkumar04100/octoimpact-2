import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Vote, Plus, Clock, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function DAOPage() {
  const { user, proposals, createProposal, vote } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState(7);

  if (!user) return null;

  const handleCreate = () => {
    if (!text.trim() || !desc.trim()) return;
    createProposal(text.trim(), desc.trim(), duration);
    setText('');
    setDesc('');
    setShowForm(false);
  };

  const active = proposals.filter(p => p.status === 'active' && new Date(p.endTime) > new Date());
  const completed = proposals.filter(p => p.status !== 'active' || new Date(p.endTime) <= new Date());
  const votingPower = Math.max(1, Math.floor(user.totalTokens / 10));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1 className="text-3xl font-display font-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="ocean-gradient-text">Impact</span>DAO
            </motion.h1>
            <p className="text-muted-foreground">Token-weighted governance for community sustainability decisions.</p>
          </div>
          <Button variant="ocean" onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" /> New Proposal
          </Button>
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
        {showForm && (
          <motion.div
            className="glass rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <h3 className="font-display font-bold mb-4">Create Proposal</h3>
            <div className="space-y-4">
              <input
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Proposal title..."
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={200}
              />
              <textarea
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none"
                placeholder="Description..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
                maxLength={1000}
              />
              <div className="flex items-center gap-4">
                <label className="text-sm text-muted-foreground">Duration:</label>
                <select
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                >
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
                <Button variant="ocean" onClick={handleCreate} disabled={!text.trim() || !desc.trim()}>
                  Submit Proposal
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Proposals */}
        <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-ocean-cyan" /> Active Proposals
        </h2>
        {active.length > 0 ? (
          <div className="space-y-4 mb-10">
            {active.map(p => {
              const total = p.yesVotes + p.noVotes;
              const yesPct = total > 0 ? (p.yesVotes / total) * 100 : 50;
              const hasVoted = p.voters.includes(user.id);
              const remaining = Math.max(0, Math.ceil((new Date(p.endTime).getTime() - Date.now()) / 86400000));

              return (
                <motion.div key={p.id} className="glass rounded-2xl p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold">{p.text}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                    </div>
                    <span className="text-xs bg-ocean-teal/10 text-ocean-teal px-2 py-1 rounded-full font-medium">
                      {remaining}d left
                    </span>
                  </div>

                  {/* Tally Bar */}
                  <div className="h-3 rounded-full bg-muted overflow-hidden mb-3">
                    <div className="h-full bg-ocean-green rounded-full transition-all" style={{ width: `${yesPct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-4">
                    <span>👍 {p.yesVotes} yes</span>
                    <span>👎 {p.noVotes} no</span>
                  </div>

                  {!hasVoted ? (
                    <div className="flex gap-2">
                      <Button variant="ocean" size="sm" onClick={() => vote(p.id, 'yes')} className="gap-1">
                        <ThumbsUp className="h-4 w-4" /> Vote Yes ({votingPower})
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => vote(p.id, 'no')} className="gap-1">
                        <ThumbsDown className="h-4 w-4" /> Vote No ({votingPower})
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-ocean-teal font-medium flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> You voted on this proposal
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">By {p.createdBy}</p>
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

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <h2 className="text-xl font-display font-bold mb-4">Completed</h2>
            <div className="space-y-3">
              {completed.map(p => (
                <div key={p.id} className="glass rounded-xl p-4 opacity-70">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{p.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.yesVotes > p.noVotes ? '✅ Passed' : '❌ Rejected'} • {p.yesVotes} yes / {p.noVotes} no
                      </p>
                    </div>
                    {p.yesVotes > p.noVotes ?
                      <CheckCircle className="h-5 w-5 text-ocean-green" /> :
                      <XCircle className="h-5 w-5 text-destructive" />
                    }
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
