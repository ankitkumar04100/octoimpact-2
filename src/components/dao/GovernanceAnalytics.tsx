import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Vote, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DAOProposal, UserProfile } from '@/types';
import { Progress } from '@/components/ui/progress';

const COLORS = ['#0d9488', '#ef4444', '#94a3b8'];

interface Props {
  proposals: DAOProposal[];
  user: UserProfile;
}

export default function GovernanceAnalytics({ proposals, user }: Props) {
  const votedCount = proposals.filter(p => p.voters.includes(user.id)).length;
  const participationRate = proposals.length > 0 ? Math.round((votedCount / proposals.length) * 100) : 0;

  const outcomeData = useMemo(() => {
    const now = Date.now();
    const completed = proposals.filter(p => p.status !== 'active' || new Date(p.endTime).getTime() <= now);
    const passed = completed.filter(p => p.yesVotes > p.noVotes).length;
    const rejected = completed.filter(p => p.noVotes >= p.yesVotes && (p.yesVotes + p.noVotes > 0)).length;
    const noVotes = completed.filter(p => p.yesVotes + p.noVotes === 0).length;
    return [
      { name: 'Passed', value: passed, color: '#0d9488' },
      { name: 'Rejected', value: rejected, color: '#ef4444' },
      { name: 'No Votes', value: noVotes, color: '#94a3b8' },
    ].filter(d => d.value > 0);
  }, [proposals]);

  const votingStreak = useMemo(() => {
    const sorted = [...proposals]
      .filter(p => p.voters.includes(user.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted.length;
  }, [proposals, user.id]);

  const votingPower = Math.max(1, Math.floor(user.totalTokens / 10));
  const totalVotingPower = proposals.reduce((s, p) => s + p.yesVotes + p.noVotes, 0);
  const userInfluence = totalVotingPower > 0 ? Math.round((votedCount * votingPower / totalVotingPower) * 100) : 0;

  const recentActivity = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    return proposals.filter(p => new Date(p.createdAt).getTime() > thirtyDaysAgo);
  }, [proposals]);

  return (
    <section className="mb-8">
      <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-ocean-teal" /> Governance Analytics
      </h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-2xl p-4 text-center ocean-glow-hover">
          <p className="text-2xl font-display font-black ocean-gradient-text">{participationRate}%</p>
          <p className="text-[10px] text-muted-foreground">Participation Rate</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center ocean-glow-hover">
          <p className="text-2xl font-display font-black">{votingStreak}</p>
          <p className="text-[10px] text-muted-foreground">Voting Streak</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center ocean-glow-hover">
          <p className="text-2xl font-display font-black">{userInfluence}%</p>
          <p className="text-[10px] text-muted-foreground">Your Influence</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center ocean-glow-hover">
          <p className="text-2xl font-display font-black">{recentActivity.length}</p>
          <p className="text-[10px] text-muted-foreground">30-Day Proposals</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Outcome Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2 text-sm">
            <PieChartIcon className="h-4 w-4 text-ocean-cyan" /> Outcome Distribution
          </h3>
          {outcomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {outcomeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No completed proposals yet</p>
          )}
        </div>

        {/* Your Participation */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-ocean-teal" /> Your Engagement
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Proposals Voted</span>
                <span className="font-semibold">{votedCount}/{proposals.length}</span>
              </div>
              <Progress value={participationRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Vote Power Growth</span>
                <span className="font-semibold">{votingPower} weight</span>
              </div>
              <Progress value={Math.min((votingPower / 50) * 100, 100)} className="h-2" />
            </div>
            <div className="glass-ocean rounded-xl p-3 text-xs space-y-1">
              <p className="font-medium">📊 Governance Health</p>
              <p className="text-muted-foreground">
                {participationRate >= 80 ? '🟢 Excellent — you\'re an active governance participant!' :
                 participationRate >= 50 ? '🟡 Good — try voting on more proposals to increase influence.' :
                 '🔴 Low participation — vote more to shape community decisions!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
