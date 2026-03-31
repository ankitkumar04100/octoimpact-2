import { motion } from 'framer-motion';
import { Vote, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DAOProposal, UserProfile } from '@/types';

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface Props {
  proposals: DAOProposal[];
  user: UserProfile;
  onVote: (id: string, v: 'yes' | 'no') => void;
}

export default function DAOPreview({ proposals, user, onVote }: Props) {
  const active = proposals.filter(p => p.status === 'active' && new Date(p.endTime) > new Date()).slice(0, 2);
  const votingPower = Math.max(1, Math.floor(user.totalTokens / 10));

  return (
    <motion.div className="glass rounded-2xl p-6" variants={fade} initial="hidden" animate="show" transition={{ delay: 0.35 }}>
      <h3 className="font-display font-bold mb-4 flex items-center gap-2">
        <Vote className="h-5 w-5 text-ocean-blue" /> DAO Proposals
      </h3>
      <p className="text-xs text-muted-foreground mb-3">Voting power: <strong className="text-foreground">{votingPower}</strong> (from {user.totalTokens} tokens)</p>
      {active.length > 0 ? (
        <div className="space-y-3">
          {active.map(p => {
            const total = p.yesVotes + p.noVotes;
            const yesPct = total > 0 ? (p.yesVotes / total) * 100 : 50;
            const hasVoted = p.voters.includes(user.id);
            const remaining = Math.max(0, Math.ceil((new Date(p.endTime).getTime() - Date.now()) / 86400000));
            return (
              <div key={p.id} className="glass-ocean rounded-xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium flex-1 mr-2">{p.text}</p>
                  <span className="text-[10px] bg-ocean-teal/10 text-ocean-teal px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                    <Clock className="h-2.5 w-2.5" />{remaining}d
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <div className="h-full bg-ocean-green rounded-full transition-all" style={{ width: `${yesPct}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>👍 {p.yesVotes} / 👎 {p.noVotes}</span>
                  {!hasVoted ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => onVote(p.id, 'yes')}>
                        <ThumbsUp className="h-3 w-3 mr-0.5" /> Yes
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => onVote(p.id, 'no')}>
                        <ThumbsDown className="h-3 w-3 mr-0.5" /> No
                      </Button>
                    </div>
                  ) : (
                    <span className="text-ocean-teal font-medium">✓ Voted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No active proposals</p>
      )}
    </motion.div>
  );
}
