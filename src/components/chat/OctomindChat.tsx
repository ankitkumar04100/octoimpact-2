import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Sparkles, X, MessageSquare, Zap, BarChart3, Coins, Award, Vote, Target, HelpCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { computeActionImpact } from '@/engines/sustainability';
import { ACTION_TYPES } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolAction?: string;
}

const SLASH_COMMANDS = [
  { cmd: '/plan', icon: '🤖', desc: 'Get AI sustainability plan', label: 'Plan' },
  { cmd: '/log', icon: '🎯', desc: 'Log a sustainability action', label: 'Log Action' },
  { cmd: '/wallet', icon: '💰', desc: 'Check token balance', label: 'Wallet' },
  { cmd: '/badges', icon: '🏅', desc: 'View badge status', label: 'Badges' },
  { cmd: '/goals', icon: '🎯', desc: 'View weekly goals', label: 'Goals' },
  { cmd: '/help', icon: '❓', desc: 'List all commands', label: 'Help' },
];

const QUICK_CHIPS = [
  { label: '🤖 Plan', cmd: '/plan' },
  { label: '🚌 Log Transport', cmd: '/log public-transport' },
  { label: '💰 Wallet', cmd: '/wallet' },
  { label: '🏅 Badges', cmd: '/badges' },
];

type Persona = 'coach' | 'analyst' | 'governance' | 'finops' | 'scientist';

const PERSONAS: Record<Persona, { label: string; icon: string; desc: string }> = {
  coach: { label: 'Coach', icon: '🏋️', desc: 'Friendly & motivational' },
  analyst: { label: 'Analyst', icon: '📊', desc: 'Data-dense & precise' },
  governance: { label: 'Governance', icon: '🏛️', desc: 'DAO rules & strategy' },
  finops: { label: 'FinOps', icon: '💹', desc: 'Spend & intensity' },
  scientist: { label: 'Scientist', icon: '🔬', desc: 'CO₂ reasoning & evidence' },
};

export default function OctomindChat() {
  const { user, actions, badges, tokenLogs, transactions, proposals, insights, logAction, fetchAIInsights, createProposal, vote } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [persona, setPersona] = useState<Persona>('coach');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // Init greeting
  useEffect(() => {
    if (isOpen && messages.length === 0 && user) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: `🐙 Hey ${user.name.split(' ')[0]}! I'm **OCTOMIND** — your Omni-Octo Copilot.\n\nI can help you with:\n- 🤖 **/plan** — AI sustainability plan\n- 🎯 **/log <action>** — Log actions instantly\n- 💰 **/wallet** — Token balance & stats\n- 🏅 **/badges** — Badge status & next goals\n- 🏛️ **/propose "title" hours** — Create DAO proposals\n- 🗳️ **/vote yes|no** — Vote on proposals\n- 📊 **/report** — Weekly summary\n- ❓ **/help** — All commands\n\nTry typing a command or just chat naturally!`,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, user]);

  const addAssistantMsg = useCallback((content: string, toolAction?: string) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      toolAction,
    }]);
  }, []);

  const handleCommand = useCallback(async (text: string) => {
    if (!user) return;
    const lower = text.toLowerCase().trim();

    // /plan
    if (lower === '/plan') {
      setIsThinking(true);
      try {
        await fetchAIInsights();
        const tonePrefix = persona === 'analyst' ? '📊' : persona === 'scientist' ? '🔬' : '🐙';
        addAssistantMsg(
          `${tonePrefix} **Your Sustainability Plan is Ready!**\n\nI've analyzed your profile (EcoScore: ${user.ecoScore}/100, Streak: ${user.streak} days, Level ${user.level}) and generated fresh insights.\n\n✅ Check your **Dashboard → AI Insights** panel for:\n- 3–5 personalized daily actions with CO₂ points\n- Weekly insight based on your trends\n- Your next concrete step\n\n${user.streak >= 7 ? `🔥 Your ${user.streak}-day streak is earning you bonus multipliers!` : '💡 Build a streak for bonus rewards!'}`,
          'plan'
        );
      } catch {
        addAssistantMsg('⚠️ Couldn\'t fetch AI plan right now. Your local insights are still available on the Dashboard.');
      }
      setIsThinking(false);
      return;
    }

    // /log <action>
    if (lower.startsWith('/log ')) {
      const actionType = lower.replace('/log ', '').trim().replace(/ /g, '-');
      const cfg = ACTION_TYPES[actionType];
      if (!cfg) {
        const available = Object.entries(ACTION_TYPES).map(([k, v]) => `- \`${k}\` — ${v.label} (${v.icon})`).join('\n');
        addAssistantMsg(`❌ Unknown action type: \`${actionType}\`\n\nAvailable actions:\n${available}`);
        return;
      }
      const result = computeActionImpact(actionType, user);
      logAction(actionType);
      addAssistantMsg(
        `✅ **${cfg.icon} ${cfg.label} Logged!**\n\n` +
        `🪙 **+${result.tokens} ImpactTokens** earned\n` +
        `🌍 **${result.co2} kg CO₂** saved\n` +
        `📈 Impact: ${result.impact} points\n\n` +
        `⛓️ Minting... → Confirmed ✓\n` +
        `${user.streak >= 6 ? `\n🏅 *You're ${7 - (user.streak % 7)} actions away from your next streak badge!*` : ''}`,
        'log'
      );
      return;
    }

    // /wallet
    if (lower === '/wallet') {
      const recentMints = tokenLogs.slice(0, 3).map(l => `  +${l.amount} — ${l.actionType.replace(/-/g, ' ')}`).join('\n');
      addAssistantMsg(
        `💰 **Wallet Overview**\n\n` +
        `**${user.totalTokens}** ImpactTokens (ERC-20)\n` +
        `📅 Today: **+${user.todayTokens}** tokens\n` +
        `🏅 NFTs: **${badges.length}** EcoBadges\n` +
        `📊 Level: **${user.level}**\n` +
        `🔗 Wallet: \`${user.walletAddress}\`\n\n` +
        `**Recent Mints:**\n${recentMints || '  No mints yet'}\n\n` +
        `Visit **Web3** page for full transaction history.`,
        'wallet'
      );
      return;
    }

    // /badges
    if (lower === '/badges') {
      const owned = badges.map(b => `  🏅 **${b.name}** (${b.tier.toUpperCase()}) — ${b.description}`).join('\n');
      const nextBadge = user.streak < 7 ? `🎯 **Next:** 7-Day Streak Badge — ${7 - user.streak} more days needed` :
        user.streak < 30 ? `🎯 **Next:** 30-Day Streak Badge — ${30 - user.streak} more days needed` :
        user.totalTokens < 500 ? `🎯 **Next:** Platinum Earner — ${500 - user.totalTokens} more tokens needed` :
        '🌟 You\'re a champion! Keep pushing for Legendary status.';
      addAssistantMsg(
        `🏅 **Badge Status**\n\n` +
        `**Owned (${badges.length}):**\n${owned || '  None yet — keep going!'}\n\n${nextBadge}`,
        'badges'
      );
      return;
    }

    // /propose
    if (lower.startsWith('/propose ')) {
      const match = text.match(/\/propose\s+"([^"]+)"\s+(\d+)/i);
      if (!match) {
        addAssistantMsg('📝 Usage: `/propose "Your proposal title" 72` (hours)\n\nExample: `/propose "Add campus shuttle route" 72`');
        return;
      }
      createProposal(match[1], match[1], Math.ceil(Number(match[2]) / 24));
      addAssistantMsg(
        `🏛️ **Proposal Created!**\n\n` +
        `📋 "${match[1]}"\n` +
        `⏳ Duration: ${match[2]} hours\n` +
        `🗳️ Voting is open — share with the community!\n\n` +
        `Your voting power: **${Math.max(1, Math.floor(user.totalTokens / 10))}** (based on ${user.totalTokens} tokens)`,
        'propose'
      );
      return;
    }

    // /vote
    if (lower.startsWith('/vote ')) {
      const choice = lower.includes('yes') ? 'yes' : lower.includes('no') ? 'no' : null;
      if (!choice) { addAssistantMsg('🗳️ Usage: `/vote yes` or `/vote no`'); return; }
      const activeProps = proposals.filter(p => p.status === 'active' && new Date(p.endTime) > new Date());
      if (activeProps.length === 0) { addAssistantMsg('🏛️ No active proposals to vote on right now.'); return; }
      const prop = activeProps[0];
      if (prop.voters.includes(user.id)) { addAssistantMsg(`✋ You've already voted on "${prop.text}"`); return; }
      vote(prop.id, choice);
      const weight = Math.max(1, Math.floor(user.totalTokens / 10));
      addAssistantMsg(
        `🗳️ **Vote Cast!**\n\n` +
        `📋 "${prop.text}"\n` +
        `👆 Your vote: **${choice.toUpperCase()}** (weight: ${weight})\n` +
        `📊 Updated tallies visible on the DAO page.`,
        'vote'
      );
      return;
    }

    // /goals
    if (lower === '/goals') {
      const weekActions = actions.filter(a => Date.now() - a.timestamp.getTime() < 7 * 86400000);
      const weekCo2 = weekActions.reduce((s, a) => s + a.co2Reduced, 0);
      const weekTokens = weekActions.reduce((s, a) => s + a.tokensEarned, 0);
      addAssistantMsg(
        `🎯 **Weekly Progress**\n\n` +
        `📊 Actions: **${weekActions.length}** this week\n` +
        `🌍 CO₂ Saved: **${weekCo2.toFixed(1)} kg**\n` +
        `🪙 Tokens Earned: **${weekTokens}**\n` +
        `🔥 Streak: **${user.streak} days**\n\n` +
        `${weekActions.length < 5 ? '💡 Try to log at least 5 actions this week for consistency bonus!' : '🌟 Great pace! Keep diversifying your action categories.'}`,
        'goals'
      );
      return;
    }

    // /report
    if (lower === '/report' || lower === '/report week') {
      const weekActions = actions.filter(a => Date.now() - a.timestamp.getTime() < 7 * 86400000);
      const cats: Record<string, number> = {};
      weekActions.forEach(a => cats[a.category] = (cats[a.category] || 0) + 1);
      const catBreakdown = Object.entries(cats).map(([k, v]) => `  ${k}: ${v}`).join('\n');
      addAssistantMsg(
        `📊 **Weekly Report**\n\n` +
        `🌍 EcoScore: **${user.ecoScore}/100**\n` +
        `💰 FSI: **${user.fsiScore}/100**\n` +
        `🔥 Streak: **${user.streak} days**\n` +
        `🪙 Total Tokens: **${user.totalTokens}**\n` +
        `🏅 Badges: **${badges.length}**\n\n` +
        `**This Week's Actions (${weekActions.length}):**\n${catBreakdown || '  None yet'}\n\n` +
        `${insights.length > 0 ? `**Latest AI Insight:** ${insights[0].text}` : ''}`,
        'report'
      );
      return;
    }

    // /help
    if (lower === '/help') {
      addAssistantMsg(
        `❓ **OCTOMIND Commands**\n\n` +
        `🤖 \`/plan\` — AI sustainability plan (3-5 actions with CO₂ points)\n` +
        `🎯 \`/log <action>\` — Log action (e.g. \`/log cycling\`)\n` +
        `💰 \`/wallet\` — Token balance & stats\n` +
        `🏅 \`/badges\` — Badge status & next goals\n` +
        `🏛️ \`/propose "title" hours\` — Create DAO proposal\n` +
        `🗳️ \`/vote yes|no\` — Vote on active proposal\n` +
        `🎯 \`/goals\` — Weekly progress\n` +
        `📊 \`/report\` — Weekly summary\n` +
        `❓ \`/help\` — This list\n\n` +
        `Or just chat naturally — I understand questions about sustainability, your progress, and more!`,
        'help'
      );
      return;
    }

    // Natural language — use AI
    setIsThinking(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          ecoScore: user.ecoScore, fsiScore: user.fsiScore,
          streak: user.streak, level: user.level, totalTokens: user.totalTokens,
          recentActions: actions.slice(0, 10).map(a => ({ type: a.type, category: a.category, co2: a.co2Reduced })),
          categories: Object.fromEntries(
            [...new Set(actions.map(a => a.category))].map(c => [c, actions.filter(a => a.category === c).length])
          ),
          alerts: [],
        },
      });
      if (data && !data.error) {
        const toneEmoji = persona === 'analyst' ? '📊' : persona === 'scientist' ? '🔬' : persona === 'governance' ? '🏛️' : persona === 'finops' ? '💹' : '🐙';
        let response = `${toneEmoji} `;
        if (data.weeklyInsight) response += data.weeklyInsight + '\n\n';
        if (data.nextStep) response += `**Next Step:** ${data.nextStep}\n\n`;
        if (data.dailyActions?.length > 0) {
          response += '**Suggested Actions:**\n';
          data.dailyActions.forEach((a: any) => {
            response += `- ${a.action} (~${a.co2Points} CO₂ pts)\n`;
          });
        }
        addAssistantMsg(response);
      } else {
        addAssistantMsg(`🐙 I'd love to help with that! Try one of my slash commands like \`/plan\` or \`/log cycling\` for direct actions, or ask me about your sustainability progress.`);
      }
    } catch {
      addAssistantMsg(`🐙 I'm having trouble connecting to the AI engine right now. Try a slash command like \`/plan\` or \`/wallet\` instead!`);
    }
    setIsThinking(false);
  }, [user, actions, badges, tokenLogs, proposals, insights, logAction, fetchAIInsights, createProposal, vote, persona, addAssistantMsg]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }]);
    setInput('');
    setShowSlashMenu(false);
    await handleCommand(trimmed);
  }, [input, isThinking, handleCommand]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    setShowSlashMenu(val === '/');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full ocean-gradient shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open OCTOMIND chat"
          >
            <Brain className="h-6 w-6 text-primary-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] glass rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border/50"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div className="ocean-gradient px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-foreground">OCTOMIND</h3>
                  <p className="text-[10px] text-primary-foreground/70">
                    {isThinking ? '🧠 Thinking...' : '🟢 Online'} • {PERSONAS[persona].icon} {PERSONAS[persona].label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-primary-foreground transition-colors"
                  onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                  title="Switch persona"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-primary-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Persona Menu */}
            <AnimatePresence>
              {showPersonaMenu && (
                <motion.div
                  className="absolute top-14 right-4 z-10 glass rounded-xl p-2 shadow-lg border border-border/50"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {Object.entries(PERSONAS).map(([key, p]) => (
                    <button
                      key={key}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${persona === key ? 'bg-primary/10 font-semibold' : 'hover:bg-muted'}`}
                      onClick={() => { setPersona(key as Persona); setShowPersonaMenu(false); }}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                      <span className="text-muted-foreground ml-auto">{p.desc}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Context Chips */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0 border-b border-border/30">
              <span className="text-[10px] bg-ocean-teal/10 text-ocean-teal px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
                🌍 {user.ecoScore}/100
              </span>
              <span className="text-[10px] bg-ocean-cyan/10 text-ocean-cyan px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
                🪙 {user.totalTokens} OCTI
              </span>
              <span className="text-[10px] bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
                🔥 {user.streak}d streak
              </span>
              <span className="text-[10px] bg-ocean-blue/10 text-ocean-blue px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
                🏅 {badges.length} NFTs
              </span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'ocean-gradient text-primary-foreground rounded-br-md'
                      : 'glass-ocean rounded-bl-md'
                  }`}>
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                        part.startsWith('**') && part.endsWith('**')
                          ? <strong key={i}>{part.slice(2, -2)}</strong>
                          : part.split(/(`[^`]+`)/g).map((sub, j) =>
                              sub.startsWith('`') && sub.endsWith('`')
                                ? <code key={`${i}-${j}`} className="bg-background/30 px-1 rounded text-xs font-mono">{sub.slice(1, -1)}</code>
                                : sub
                            )
                      )}
                    </div>
                    <p className="text-[9px] opacity-50 mt-1">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </motion.div>
              ))}
              {isThinking && (
                <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="glass-ocean rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-ocean-teal" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Chips */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {QUICK_CHIPS.map(chip => (
                  <button
                    key={chip.cmd}
                    className="text-xs bg-ocean-teal/8 hover:bg-ocean-teal/15 text-ocean-teal px-3 py-1.5 rounded-full transition-colors font-medium"
                    onClick={() => { setInput(chip.cmd); }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Slash Menu */}
            <AnimatePresence>
              {showSlashMenu && (
                <motion.div
                  className="mx-4 mb-1 glass rounded-xl p-1.5 shadow-lg border border-border/50"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  {SLASH_COMMANDS.map(sc => (
                    <button
                      key={sc.cmd}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 hover:bg-muted transition-colors"
                      onClick={() => { setInput(sc.cmd + ' '); setShowSlashMenu(false); inputRef.current?.focus(); }}
                    >
                      <span>{sc.icon}</span>
                      <span className="font-mono font-medium">{sc.cmd}</span>
                      <span className="text-muted-foreground ml-auto">{sc.desc}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border/30 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                  placeholder="Type / for commands or chat..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  aria-label="Chat message input"
                />
                <Button
                  variant="ocean"
                  size="icon"
                  className="h-10 w-10 rounded-xl shrink-0"
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
