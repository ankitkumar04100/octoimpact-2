import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, TrendingUp, Coins, Shield, BarChart3, Gamepad2, ArrowRight, Sparkles,
  Zap, Users, GraduationCap, Building2, Trophy, Lock, Eye, ChevronDown,
  HelpCircle, X, Check, Globe, Mail, UserCircle,
} from 'lucide-react';
import octoHero from '@/assets/octo-hero.png';
import OctomindChat from '@/components/chat/OctomindChat';

const fade = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

const FEATURES = [
  { icon: Brain, title: 'AI Sustainability Agent', desc: 'Context-aware OCTOMIND copilot that plans, coaches, and executes — powered by real data.' },
  { icon: TrendingUp, title: 'EcoScore Wallet', desc: 'Classify transactions, compute EcoScore/FSI, and track carbon cost with recency weighting.' },
  { icon: Coins, title: 'Web3 Rewards', desc: 'Earn ImpactTokens (ERC-20) and EcoBadge NFTs (ERC-721) for every sustainable action.' },
  { icon: BarChart3, title: 'Real-Time Dashboard', desc: 'Live-updating charts, scores, insights, achievements, and drill-downs in one premium view.' },
  { icon: Shield, title: 'DAO Governance', desc: 'Create proposals, vote with token weight, and shape community sustainability goals.' },
  { icon: Gamepad2, title: 'Gamification', desc: 'Levels 1–50, streaks, multipliers, achievements, and animated badge reveals.' },
];

const STEPS = [
  { emoji: '🤖', label: 'AI Suggests' },
  { emoji: '🎯', label: 'You Act' },
  { emoji: '💰', label: 'FinTech Analyzes' },
  { emoji: '🏆', label: 'Web3 Rewards' },
  { emoji: '📊', label: 'Dashboard Shows' },
];

const AUDIENCES = [
  { icon: UserCircle, label: 'Individuals & Students', desc: 'Personal sustainability tracking with gamified rewards' },
  { icon: Users, label: 'Clubs & NGOs', desc: 'Community-level impact measurement and governance' },
  { icon: GraduationCap, label: 'Campuses', desc: 'Campus-wide challenges, leaderboards, and team competitions' },
  { icon: Building2, label: 'Organizations & ESG', desc: 'Enterprise sustainability analytics and reporting' },
  { icon: Trophy, label: 'Hackathons & Judges', desc: 'Instant demo mode with full feature showcase' },
];

const TRUST_ITEMS = [
  { icon: Lock, label: 'Row-Level Security', desc: 'Per-user data isolation enforced at the database layer' },
  { icon: Shield, label: 'JWT + Rate Limits', desc: 'Secure access tokens with anti-spam protection' },
  { icon: Eye, label: 'Anti-Replay Oracle', desc: 'Nonce + time window minting prevents duplicate rewards' },
  { icon: Coins, label: 'Token-Weighted DAO', desc: 'Governance power proportional to earned contributions' },
];

const FAQS = [
  { q: 'What happens to my demo data?', a: 'Demo data is seeded once for instant WOW. After any interaction, all engines recompute with real logic. You can Reset Demo or Switch to Real to migrate everything.' },
  { q: 'Can I use without a wallet?', a: 'Yes! A custodial wallet is provisioned automatically. You can optionally connect MetaMask for external wallet control.' },
  { q: 'How are tokens minted?', a: 'A server-side oracle validates your action, computes the reward, and signs the mint. You see pending → success/error with a real transaction reference.' },
  { q: 'Can I export my data?', a: 'Yes — actions, tokens, insights, and transactions can be exported as CSV. Data is RLS-protected so you only get your own records.' },
  { q: 'How does DAO work?', a: 'Create proposals with a title + duration. Vote with token-weighted power (1 vote per 10 ImpactTokens). Proposals auto-finalize at end time with PASSED/REJECTED outcomes.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { enterDemoMode, enterGuestMode, user } = useApp();
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleDemo = () => { enterDemoMode(); navigate('/dashboard'); };
  const handleGuest = () => { enterGuestMode(); navigate('/dashboard'); };

  const kpis = user ? [
    { label: 'EcoScore', value: String(user.ecoScore), suffix: '/100', desc: 'Your score' },
    { label: 'Tokens Earned', value: String(user.totalTokens), suffix: '', desc: 'ImpactTokens' },
    { label: 'Streak', value: String(user.streak), suffix: ' days', desc: 'Current streak' },
    { label: 'Level', value: String(user.level), suffix: '', desc: `Level ${user.level}` },
  ] : [
    { label: 'EcoScore', value: '76', suffix: '/100', desc: 'Avg. user score' },
    { label: 'Tokens Earned', value: '12.5K', suffix: '+', desc: 'Community total' },
    { label: 'CO₂ Saved', value: '4.7', suffix: ' tons', desc: 'This month' },
    { label: 'Active Users', value: '2.4', suffix: 'K', desc: 'Growing daily' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero */}
      <section className="relative hero-bg min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(180 65% 30%) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-1 ocean-gradient opacity-40" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-8">
              <motion.img
                src={octoHero}
                alt="OctoImpact Royal Octopus — AI-powered sustainability mascot"
                className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
                width={256} height={256}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-none">
              <span className="ocean-gradient-text">OctoImpact</span>
              <span className="text-foreground"> 2.0</span>
            </h1>
            <p className="mt-5 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
              AI + FinTech + Web3 Sustainability Engine
            </p>

            {/* Micro-proofs */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {['Realtime', 'On-chain trust', 'Gamified rewards', 'DAO governance'].map(tag => (
                <span key={tag} className="text-xs bg-ocean-teal/10 text-ocean-teal px-3 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* KPIs */}
          <motion.div
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {kpis.map(kpi => (
              <motion.div key={kpi.label} variants={fade} className="glass rounded-2xl p-4 card-hover">
                <p className="text-3xl md:text-4xl font-display font-black ocean-gradient-text">
                  {kpi.value}<span className="text-lg">{kpi.suffix}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="mt-12 flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            <Button variant="hero" size="xl" onClick={() => setShowGetStarted(true)} className="gap-2">
              🚀 Get Started <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="glass" size="lg" onClick={handleDemo} className="gap-2">
              ⚡ Fast Demo
            </Button>
          </motion.div>
          <p className="mt-3 text-xs text-muted-foreground/60">2 seconds to wow • No signup required</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 hero-bg">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 className="text-4xl font-display font-black mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            The <span className="ocean-gradient-text">Closed Loop</span>
          </motion.h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">AI suggests → You act → FinTech analyzes → Web3 rewards → Dashboard visualizes → AI learns</p>
          <div className="flex flex-wrap justify-center items-center gap-3">
            {STEPS.map((s, i) => (
              <motion.div key={s.label} className="flex items-center gap-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.1 }}>
                <div className="glass rounded-2xl px-6 py-4 text-center card-hover">
                  <span className="text-3xl">{s.emoji}</span>
                  <p className="text-xs font-semibold mt-2">{s.label}</p>
                </div>
                {i < STEPS.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative h-2 overflow-hidden">
        <div className="absolute inset-0 ocean-gradient opacity-30" />
      </div>

      {/* Who It's For */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 className="text-4xl font-display font-black mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            Who It's <span className="ocean-gradient-text">For</span>
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {AUDIENCES.map((a, i) => (
              <motion.div key={a.label} className="glass rounded-2xl p-5 card-hover text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.06 }}>
                <a.icon className="h-8 w-8 mx-auto mb-3 text-ocean-teal" />
                <p className="text-xs font-bold">{a.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 hero-bg">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h2 className="text-4xl md:text-5xl font-display font-black">
              Product <span className="ocean-gradient-text">Pillars</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Six interconnected modules working together to make sustainability measurable, rewarding, and fun.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass rounded-2xl p-8 card-hover group"
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fade} transition={{ delay: i * 0.08 }}
              >
                <div className="h-12 w-12 rounded-xl ocean-gradient flex items-center justify-center mb-5 group-hover:animate-pulse-glow transition-shadow">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 className="text-4xl font-display font-black mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            Trust & <span className="ocean-gradient-text">Security</span>
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_ITEMS.map((t, i) => (
              <motion.div key={t.label} className="glass rounded-2xl p-5 card-hover" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.08 }}>
                <t.icon className="h-6 w-6 mx-auto mb-3 text-ocean-teal" />
                <p className="text-xs font-bold mb-1">{t.label}</p>
                <p className="text-[10px] text-muted-foreground">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 hero-bg">
        <div className="max-w-3xl mx-auto">
          <motion.h2 className="text-4xl font-display font-black text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <span className="ocean-gradient-text">FAQ</span>
          </motion.h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} className="glass rounded-2xl overflow-hidden" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.05 }}>
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-ocean-teal shrink-0" /> {faq.q}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      className="px-5 pb-5 text-sm text-muted-foreground"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-border/50">
        <p className="text-2xl mb-2">🐙</p>
        <p className="text-sm text-muted-foreground">OctoImpact 2.0 — AI + FinTech + Web3 Sustainability Engine</p>
        <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground/60">
          <span>Docs</span><span>Privacy</span><span>Security</span><span>Roadmap</span><span>Contact</span>
        </div>
        <p className="text-xs text-muted-foreground/50 mt-3">Built with conviction for a greener future</p>
      </footer>

      {/* Get Started Modal */}
      <AnimatePresence>
        {showGetStarted && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowGetStarted(false)}
          >
            <motion.div
              className="glass rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-display font-black">Get Started</h2>
                  <p className="text-sm text-muted-foreground">Choose how you'd like to explore OctoImpact</p>
                </div>
                <button onClick={() => setShowGetStarted(false)} className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Fast Demo */}
                <button
                  className="w-full glass-ocean rounded-2xl p-5 text-left card-hover group"
                  onClick={() => { setShowGetStarted(false); handleDemo(); }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl ocean-gradient flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">⚡ Fast Demo</p>
                      <p className="text-xs text-muted-foreground">2 seconds to WOW</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground ml-[52px]">
                    Seed 18 actions, 10 transactions, Bronze badge. After any interaction → full recompute.
                  </p>
                </button>

                {/* Guest */}
                <button
                  className="w-full glass rounded-2xl p-5 text-left card-hover group"
                  onClick={() => { setShowGetStarted(false); handleGuest(); }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">👤 Continue as Guest</p>
                      <p className="text-xs text-muted-foreground">Zero friction, full features</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground ml-[52px]">
                    Ephemeral wallet; save progress anytime by signing up. All data migrates.
                  </p>
                </button>

                {/* Google */}
                <button
                  className="w-full glass rounded-2xl p-5 text-left card-hover group"
                  onClick={() => { setShowGetStarted(false); navigate('/auth'); }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">🔗 Sign in with Google</p>
                      <p className="text-xs text-muted-foreground">Full features + persistent data</p>
                    </div>
                  </div>
                </button>

                {/* Email */}
                <button
                  className="w-full glass rounded-2xl p-5 text-left card-hover group"
                  onClick={() => { setShowGetStarted(false); navigate('/auth'); }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">📧 Email & Password</p>
                      <p className="text-xs text-muted-foreground">Classic login with password reset</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Migration & Privacy Notes */}
              <div className="mt-6 space-y-3">
                <div className="glass-ocean rounded-xl p-4">
                  <p className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-ocean-teal" /> Data Migration (Guest/Demo → Real)
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    All actions, insights, transactions, tokens, badges, and DAO votes migrate automatically. On-chain assets follow the custodial→external wallet policy.
                  </p>
                </div>
                <div className="glass-ocean rounded-xl p-4">
                  <p className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-ocean-teal" /> Privacy & Security
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Per-user RLS isolation, JWT auth, no PII in logs, server-side secrets only, anti-replay oracle minting.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {user && <OctomindChat />}
    </div>
  );
}
