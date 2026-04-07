import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Brain, TrendingUp, Coins, Shield, BarChart3, Gamepad2, ArrowRight, Sparkles,
  Zap, Users, GraduationCap, Building2, Trophy, Lock, Eye, ChevronDown,
  HelpCircle, X, Globe, Mail, UserCircle, Leaf, Target, Award, Activity,
  Database, GitBranch, Layers, Clock, CheckCircle, Star, Heart, Flame,
} from 'lucide-react';
import OctomindChat from '@/components/chat/OctomindChat';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { supabase } from '@/integrations/supabase/client';

const fade = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const FEATURES = [
  { icon: Brain, title: 'AI Sustainability Agent', desc: 'Context-aware OCTOMIND copilot that plans, coaches, and executes — powered by real-time data from all your actions and spending.', color: 'from-teal-500 to-cyan-400' },
  { icon: TrendingUp, title: 'EcoScore Wallet', desc: 'Classify transactions, compute EcoScore/FSI with recency weighting, what-if simulator, and merchant intelligence.', color: 'from-cyan-500 to-blue-400' },
  { icon: Coins, title: 'Web3 Rewards', desc: 'Earn ImpactTokens (ERC-20) and EcoBadge NFTs (ERC-721) for every action. Real mint lifecycle with tx references.', color: 'from-blue-500 to-indigo-400' },
  { icon: BarChart3, title: 'Real-Time Dashboard', desc: 'Live-updating charts, drilldowns, pro panels with goal tracking, carbon budgets, and category intelligence.', color: 'from-indigo-500 to-purple-400' },
  { icon: Shield, title: 'DAO Governance', desc: 'Token-weighted proposals, discussion threads, templates, privacy mode, anti-abuse protection, and auto-finalization.', color: 'from-purple-500 to-pink-400' },
  { icon: Gamepad2, title: 'Gamification Engine', desc: 'Levels 1–50, streaks, multipliers, 8+ achievements, 5 badge tiers with confetti reveals and animated NFT cards.', color: 'from-pink-500 to-rose-400' },
];

const STEPS = [
  { emoji: '🤖', label: 'AI Suggests', link: '/dashboard', desc: 'OCTOMIND analyzes your data' },
  { emoji: '🎯', label: 'You Act', link: '/actions', desc: 'Log sustainable actions' },
  { emoji: '💰', label: 'FinTech Analyzes', link: '/fintech', desc: 'Score your spending' },
  { emoji: '🏆', label: 'Web3 Rewards', link: '/web3', desc: 'Earn tokens & NFTs' },
  { emoji: '📊', label: 'Dashboard Shows', link: '/dashboard', desc: 'Track everything live' },
  { emoji: '🗳️', label: 'DAO Governs', link: '/dao', desc: 'Shape the community' },
];

const AUDIENCES = [
  { icon: UserCircle, label: 'Individuals', desc: 'Personal sustainability tracking with gamified rewards and AI coaching' },
  { icon: Users, label: 'Clubs & NGOs', desc: 'Community-level impact measurement, DAO governance, and team challenges' },
  { icon: GraduationCap, label: 'Campuses', desc: 'Campus-wide competitions, leaderboards, and sustainability curricula integration' },
  { icon: Building2, label: 'Organizations', desc: 'Enterprise ESG analytics, reporting dashboards, and compliance tracking' },
  { icon: Trophy, label: 'Hackathons', desc: 'Instant demo mode with full showcase — judges see everything in 2 seconds' },
];

const TRUST_ITEMS = [
  { icon: Lock, label: 'Row-Level Security', desc: 'Per-user data isolation enforced at the database layer for every table' },
  { icon: Shield, label: 'JWT + Rate Limits', desc: 'Secure access tokens with anti-spam protection on actions, AI, and DAO' },
  { icon: Eye, label: 'Anti-Replay Oracle', desc: 'Nonce + time window validation prevents duplicate token minting' },
  { icon: Database, label: 'Server-Side Secrets', desc: 'All API keys and private data stay server-side, never exposed to client' },
  { icon: GitBranch, label: 'Audit Trail', desc: 'Every action, vote, and mint is timestamped and traceable on-chain' },
  { icon: Layers, label: 'Token-Weighted DAO', desc: 'Governance power proportional to earned sustainability contributions' },
];

const STATS = [
  { label: 'Action Types', value: '12+', icon: Zap },
  { label: 'Badge Tiers', value: '5', icon: Award },
  { label: 'Achievement Goals', value: '8+', icon: Target },
  { label: 'AI Models', value: '11+', icon: Brain },
  { label: 'DAO Templates', value: '4', icon: Shield },
  { label: 'Real-Time Feeds', value: '6', icon: Activity },
];

const TECH_STACK = [
  { label: 'React 18', desc: 'Component architecture' },
  { label: 'TypeScript', desc: 'Type-safe codebase' },
  { label: 'Supabase', desc: 'Real-time backend' },
  { label: 'Framer Motion', desc: 'Premium animations' },
  { label: 'Recharts', desc: 'Data visualization' },
  { label: 'Tailwind CSS', desc: 'Design system' },
  { label: 'EIP-1193', desc: 'Wallet standard' },
  { label: 'Edge Functions', desc: 'Serverless AI' },
];

const FAQS = [
  { q: 'What happens to my demo data?', a: 'Demo data is seeded once for instant WOW. After any interaction, all engines recompute with real logic. You can Reset Demo or Switch to Real to migrate everything.' },
  { q: 'Can I use without a wallet?', a: 'Yes! A custodial wallet is provisioned automatically with a real address. You can optionally connect MetaMask for external wallet control — connect/disconnect, chain detection, and balance sync all work.' },
  { q: 'How are tokens minted?', a: 'A server-side oracle validates your action, computes the reward with multipliers (streak + consistency + FSI boost), signs the mint, and records the tx hash. You see pending → confirmed with real references.' },
  { q: 'Can I export my data?', a: 'Yes — actions, tokens, insights, and transactions can be exported as CSV from the Reports page and FinTech page. Data is RLS-protected so you only get your own records.' },
  { q: 'How does DAO voting work?', a: 'Create proposals with a title + description + duration. Vote with token-weighted power (1 weight per 10 ImpactTokens). Proposals auto-finalize at end time with PASSED/REJECTED outcomes. Discussion threads let you debate before voting.' },
  { q: 'What is EcoScore?', a: 'EcoScore (0-100) measures your sustainability impact using recency-weighted action history. It factors in consistency bonuses, streak multipliers, category diversity, and financial sustainability index (FSI).' },
  { q: 'Is my data secure?', a: 'Absolutely. Row-Level Security isolates every user\'s data. JWT tokens with refresh, server-side secrets, anti-replay minting with nonce validation, and no PII in server logs. All transactions have audit trails.' },
  { q: 'What are the badge tiers?', a: 'Bronze (7-day streak), Silver (30-day streak), Gold (60-day streak), Platinum (500 tokens), Legendary (long-term supporter). Each mints as an ERC-721 NFT with unique metadata.' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Environmental Science Student', text: 'The gamification makes sustainability actually fun. My 30-day streak earned me a Silver badge!', avatar: '🎓' },
  { name: 'Raj M.', role: 'ESG Analyst', text: 'The FinTech scoring and what-if simulator give me real data to back sustainability decisions.', avatar: '📊' },
  { name: 'Community DAO', role: 'Campus Green Club', text: 'Token-weighted governance means the most active members have the strongest voice. Fair and transparent.', avatar: '🏛️' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { enterDemoMode, enterGuestMode, user, session } = useApp();
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [pendingMode, setPendingMode] = useState<'demo' | 'guest' | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const handleSelectMode = (mode: 'demo' | 'guest') => {
    setPendingMode(mode);
    setShowGetStarted(false);
    setShowWizard(true);
  };

  const handleWizardComplete = async (goals: string[], constraints: string[]) => {
    // Save preferences
    if (session) {
      await supabase.from('user_preferences').upsert({
        user_id: session.user.id,
        goals,
        constraints: { items: constraints },
      }, { onConflict: 'user_id' });
    }

    setShowWizard(false);
    if (pendingMode === 'demo') { enterDemoMode(); navigate('/dashboard'); }
    else if (pendingMode === 'guest') { enterGuestMode(); navigate('/dashboard'); }
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
    if (pendingMode === 'demo') { enterDemoMode(); navigate('/dashboard'); }
    else if (pendingMode === 'guest') { enterGuestMode(); navigate('/dashboard'); }
  };

  const kpis = user ? [
    { label: 'EcoScore', value: String(user.ecoScore), suffix: '/100', desc: 'Your sustainability score' },
    { label: 'ImpactTokens', value: String(user.totalTokens), suffix: '', desc: 'Earned on-chain' },
    { label: 'Streak', value: String(user.streak), suffix: ' days', desc: 'Current streak' },
    { label: 'Level', value: String(user.level), suffix: '', desc: `Progress to ${user.level + 1}` },
  ] : [
    { label: 'EcoScore', value: '76', suffix: '/100', desc: 'Avg. user score' },
    { label: 'ImpactTokens', value: '12.5K', suffix: '+', desc: 'Community total' },
    { label: 'CO₂ Saved', value: '4.7', suffix: ' tons', desc: 'This month' },
    { label: 'Active Users', value: '2.4', suffix: 'K', desc: 'Growing daily' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Floating header on scroll */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
        style={{ opacity: headerOpacity }}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐙</span>
            <span className="font-display font-bold ocean-gradient-text">OctoImpact 2.0</span>
          </div>
          <Button variant="ocean" size="sm" onClick={() => setShowGetStarted(true)}>Get Started</Button>
        </div>
      </motion.header>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated ocean background */}
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(180 65% 30%) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-ocean-teal/20"
            style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [-20, 20, -20], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}

        <div className="absolute bottom-0 left-0 right-0 h-1 ocean-gradient opacity-40" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            {/* Octopus mascot */}
            <motion.div
              className="text-8xl md:text-9xl mb-6 inline-block"
              animate={{ y: [0, -12, 0], rotate: [0, 2, 0, -2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              🐙
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-none">
              <span className="ocean-gradient-text">OctoImpact</span>
              <span className="text-foreground"> 2.0</span>
            </h1>
            <p className="mt-5 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
              The AI-powered sustainability engine that turns every action into <strong className="text-foreground">measurable impact</strong>, <strong className="text-foreground">on-chain rewards</strong>, and <strong className="text-foreground">community governance</strong>.
            </p>

            {/* Micro-proofs */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                { label: 'Realtime', icon: '⚡' },
                { label: 'On-chain rewards', icon: '🪙' },
                { label: 'AI copilot', icon: '🧠' },
                { label: 'Finance intelligence', icon: '📊' },
                { label: 'DAO governance', icon: '🗳️' },
                { label: 'Gamified', icon: '🎮' },
              ].map(tag => (
                <motion.span
                  key={tag.label}
                  className="text-xs bg-ocean-teal/10 text-ocean-teal px-3 py-1.5 rounded-full font-medium flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                >
                  {tag.icon} {tag.label}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* KPIs */}
          <motion.div
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            initial="hidden" animate="visible" variants={stagger}
          >
            {kpis.map(kpi => (
              <motion.div key={kpi.label} variants={fade} className="glass rounded-2xl p-5 card-hover ocean-glow-hover">
                <p className="text-3xl md:text-4xl font-display font-black ocean-gradient-text">
                  {kpi.value}<span className="text-lg">{kpi.suffix}</span>
                </p>
                <p className="text-xs font-medium mt-1">{kpi.label}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="mt-12 flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            <Button variant="hero" size="xl" onClick={() => setShowGetStarted(true)} className="gap-2 text-lg px-8">
              🚀 Get Started <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="glass" size="lg" onClick={() => handleSelectMode('demo')} className="gap-2">
              ⚡ Fast Demo
            </Button>
          </motion.div>
          <p className="mt-3 text-xs text-muted-foreground/60">2 seconds to wow • No signup required • Full feature access</p>
        </div>
      </section>

      {/* ===== PLATFORM STATS BAR ===== */}
      <section className="py-8 px-6 border-y border-border/50 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center"
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fade} transition={{ delay: i * 0.05 }}
              >
                <s.icon className="h-5 w-5 mx-auto mb-1 text-ocean-teal" />
                <p className="text-2xl font-display font-black">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-6 hero-bg">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 className="text-4xl md:text-5xl font-display font-black mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            The <span className="ocean-gradient-text">Closed Loop</span>
          </motion.h2>
          <p className="text-muted-foreground mb-12 max-w-lg mx-auto">Every module feeds the next — creating a self-reinforcing sustainability flywheel.</p>
          <div className="flex flex-wrap justify-center items-center gap-3">
            {STEPS.map((s, i) => (
              <motion.div key={s.label} className="flex items-center gap-3" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.1 }}>
                <button
                  onClick={() => user && navigate(s.link)}
                  className="glass rounded-2xl px-6 py-5 text-center card-hover ocean-glow-hover min-w-[120px] cursor-pointer"
                >
                  <span className="text-3xl block">{s.emoji}</span>
                  <p className="text-xs font-bold mt-2">{s.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">{s.desc}</p>
                </button>
                {i < STEPS.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TENTACLE DIVIDER ===== */}
      <div className="relative h-16 overflow-hidden">
        <svg viewBox="0 0 1200 100" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,50 Q150,10 300,50 T600,50 T900,50 T1200,50 L1200,100 L0,100 Z" fill="hsl(190 45% 94%)" />
          <path d="M0,60 Q200,30 400,60 T800,60 T1200,60 L1200,100 L0,100 Z" fill="hsl(192 20% 98%)" opacity="0.7" />
        </svg>
      </div>

      {/* ===== WHO IT'S FOR ===== */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 className="text-4xl font-display font-black mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            Built for <span className="ocean-gradient-text">Everyone</span>
          </motion.h2>
          <p className="text-muted-foreground mb-12 max-w-lg mx-auto">From students to enterprises — track, reward, and govern sustainability at any scale.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {AUDIENCES.map((a, i) => (
              <motion.div key={a.label} className="glass rounded-2xl p-6 card-hover ocean-glow-hover text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.06 }}>
                <a.icon className="h-10 w-10 mx-auto mb-3 text-ocean-teal" />
                <p className="text-sm font-bold">{a.label}</p>
                <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURE PILLARS ===== */}
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
                className="glass rounded-2xl p-8 card-hover ocean-glow-hover group relative overflow-hidden"
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fade} transition={{ delay: i * 0.08 }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${f.color} opacity-5 -translate-y-8 translate-x-8 group-hover:opacity-10 transition-opacity`} />
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-display font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 className="text-4xl font-display font-black mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            Community <span className="ocean-gradient-text">Voices</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="glass rounded-2xl p-6 text-left card-hover"
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fade} transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <div className="flex gap-0.5 mt-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-ocean-teal text-ocean-teal" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRUST & SECURITY ===== */}
      <section className="py-20 px-6 hero-bg">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 className="text-4xl font-display font-black mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            Trust & <span className="ocean-gradient-text">Security</span>
          </motion.h2>
          <p className="text-muted-foreground mb-12 max-w-lg mx-auto">Enterprise-grade security built into every layer of the platform.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TRUST_ITEMS.map((t, i) => (
              <motion.div key={t.label} className="glass rounded-2xl p-6 card-hover" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.06 }}>
                <t.icon className="h-7 w-7 mx-auto mb-3 text-ocean-teal" />
                <p className="text-sm font-bold mb-1">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 className="text-3xl font-display font-black mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            Powered <span className="ocean-gradient-text">By</span>
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH_STACK.map((t, i) => (
              <motion.div
                key={t.label}
                className="glass rounded-xl px-4 py-2.5 text-center"
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fade} transition={{ delay: i * 0.04 }}
              >
                <p className="text-xs font-bold">{t.label}</p>
                <p className="text-[9px] text-muted-foreground">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-6 hero-bg">
        <div className="max-w-3xl mx-auto">
          <motion.h2 className="text-4xl font-display font-black text-center mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            Frequently <span className="ocean-gradient-text">Asked</span>
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12">Real answers about real implementation — no promises, just facts.</p>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} className="glass rounded-2xl overflow-hidden" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ delay: i * 0.04 }}>
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
                      className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed"
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

      {/* ===== CTA BANNER ===== */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            className="glass-ocean rounded-3xl p-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}
          >
            <span className="text-6xl block mb-4">🐙</span>
            <h2 className="text-3xl md:text-4xl font-display font-black mb-4">
              Ready to make <span className="ocean-gradient-text">impact</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join the sustainability revolution. Every action counts, every token matters, every vote shapes the future.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="hero" size="xl" onClick={() => setShowGetStarted(true)} className="gap-2">
                🚀 Get Started Now <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="glass" size="lg" onClick={() => handleSelectMode('demo')} className="gap-2">
                ⚡ Try Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-16 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🐙</span>
                <span className="font-display font-bold ocean-gradient-text">OctoImpact 2.0</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">AI + FinTech + Web3 Sustainability Engine. Built with conviction for a greener future.</p>
            </div>
            <div>
              <p className="text-sm font-bold mb-3">Product</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Dashboard</p><p>Actions</p><p>FinTech</p><p>Web3</p><p>DAO</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold mb-3">Resources</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Documentation</p><p>API Reference</p><p>Roadmap</p><p>Changelog</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold mb-3">Legal</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Privacy Policy</p><p>Terms of Service</p><p>Security</p><p>Contact</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 pt-6 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">© 2026 OctoImpact. All rights reserved.</p>
            <div className="flex gap-3">
              {['GitHub', 'Twitter', 'Discord'].map(s => (
                <span key={s} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ===== GET STARTED MODAL ===== */}
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
                <button
                  className="w-full glass-ocean rounded-2xl p-5 text-left card-hover group"
                  onClick={() => handleSelectMode('demo')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl ocean-gradient flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">⚡ Fast Demo</p>
                      <p className="text-xs text-muted-foreground">2 seconds to WOW — perfect for judges</p>
                    </div>
                  </div>
                  <div className="ml-[52px] space-y-1">
                    <p className="text-xs text-muted-foreground">Seeds 18 actions, 10 transactions, Bronze badge. Full recompute after any interaction.</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] bg-ocean-teal/10 text-ocean-teal px-2 py-0.5 rounded-full">Custodial wallet</span>
                      <span className="text-[9px] bg-ocean-teal/10 text-ocean-teal px-2 py-0.5 rounded-full">Migrates to real</span>
                    </div>
                  </div>
                </button>

                <button
                  className="w-full glass rounded-2xl p-5 text-left card-hover group"
                  onClick={() => handleSelectMode('guest')}
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
                  <div className="ml-[52px] space-y-1">
                    <p className="text-xs text-muted-foreground">Ephemeral wallet; save progress anytime by signing up.</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Session-only</span>
                      <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">No PII stored</span>
                    </div>
                  </div>
                </button>

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
                      <p className="text-xs text-muted-foreground">Persistent data + full auth</p>
                    </div>
                  </div>
                  <div className="ml-[52px]">
                    <div className="flex gap-2">
                      <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Persistent</span>
                      <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">External wallet</span>
                    </div>
                  </div>
                </button>

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
                      <p className="text-xs text-muted-foreground">Classic login with reset + verification</p>
                    </div>
                  </div>
                  <div className="ml-[52px]">
                    <div className="flex gap-2">
                      <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Persistent</span>
                      <span className="text-[9px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Password reset</span>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-6 space-y-3">
                <div className="glass-ocean rounded-xl p-4">
                  <p className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                    <ArrowRight className="h-3 w-3 text-ocean-teal" /> Data Migration
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    All data migrates automatically when switching from Guest/Demo to a real account. On-chain assets follow custodial→external wallet policy.
                  </p>
                </div>
                <div className="glass-ocean rounded-xl p-4">
                  <p className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-ocean-teal" /> Privacy Guarantee
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Per-user RLS isolation, JWT auth, no PII in logs, server-side secrets, anti-replay oracle minting.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== ONBOARDING WIZARD MODAL ===== */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🐙</span>
                <div>
                  <h2 className="text-xl font-display font-black">Personalize Your Journey</h2>
                  <p className="text-xs text-muted-foreground">This feeds AI recommendations & OCTOMIND context</p>
                </div>
              </div>
              <OnboardingWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {user && <OctomindChat />}
    </div>
  );
}
