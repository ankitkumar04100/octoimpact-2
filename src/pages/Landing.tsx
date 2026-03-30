import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Coins, Shield, BarChart3, Gamepad2, ArrowRight } from 'lucide-react';
import octoHero from '@/assets/octo-hero.png';

const FEATURES = [
  { icon: Brain, title: 'AI Sustainability Agent', desc: 'Context-aware recommendations that adapt to your habits, streaks, and spending patterns.' },
  { icon: TrendingUp, title: 'EcoScore Wallet', desc: 'Classify transactions, compute your Financial Sustainability Index, and track carbon cost.' },
  { icon: Coins, title: 'Web3 Rewards', desc: 'Earn ImpactTokens (ERC-20) and EcoBadge NFTs for every sustainable action you take.' },
  { icon: BarChart3, title: 'Real-Time Dashboard', desc: 'Live-updating charts, scores, insights, and achievement tracking in one premium view.' },
  { icon: Shield, title: 'DAO Governance', desc: 'Create proposals, vote with token weight, and shape community sustainability goals.' },
  { icon: Gamepad2, title: 'Gamification', desc: 'Levels 1-50, streaks, multipliers, achievements, and animated badge reveals.' },
];

const STEPS = [
  { emoji: '🤖', label: 'AI Suggests' },
  { emoji: '🎯', label: 'You Act' },
  { emoji: '💰', label: 'FinTech Analyzes' },
  { emoji: '🏆', label: 'Web3 Rewards' },
  { emoji: '📊', label: 'Dashboard Shows' },
];

const fade = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export default function Landing() {
  const navigate = useNavigate();
  const { enterDemoMode, enterGuestMode } = useApp();

  const handleDemo = () => { enterDemoMode(); navigate('/dashboard'); };
  const handleGuest = () => { enterGuestMode(); navigate('/dashboard'); };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero */}
      <section className="relative hero-bg min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(180 65% 30%) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div initial="hidden" animate="visible" variants={fade} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-8">
              <motion.img
                src={octoHero}
                alt="OctoImpact AI Octopus"
                className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
                width={256}
                height={256}
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
            <p className="mt-3 text-sm text-muted-foreground/70">
              Build habits • Earn tokens • Track impact • Govern together
            </p>
          </motion.div>

          {/* KPIs */}
          <motion.div
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {[
              { label: 'EcoScore', value: '76', suffix: '/100' },
              { label: 'Tokens Earned', value: '152', suffix: '' },
              { label: 'CO₂ Saved', value: '47', suffix: ' kg' },
              { label: 'Active Users', value: '2.4', suffix: 'K' },
            ].map(kpi => (
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
            <Button variant="hero" size="xl" onClick={handleDemo} className="gap-2">
              ⚡ Fast Demo <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="glass" size="lg" onClick={handleGuest}>
              👤 Guest Mode
            </Button>
            <Button variant="outline" size="lg" disabled className="opacity-60">
              📧 Email Login
            </Button>
            <Button variant="outline" size="lg" disabled className="opacity-60">
              🔗 Google Login
            </Button>
          </motion.div>
          <p className="mt-3 text-xs text-muted-foreground/60">2 seconds to wow • No signup required</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            <h2 className="text-4xl md:text-5xl font-display font-black">
              Powered by <span className="ocean-gradient-text">Intelligence</span>
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
                <div className="h-12 w-12 rounded-xl ocean-gradient flex items-center justify-center mb-5 group-hover:animate-pulse-glow">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 hero-bg">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 className="text-4xl font-display font-black mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade}>
            The <span className="ocean-gradient-text">Closed Loop</span>
          </motion.h2>
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

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-border/50">
        <p className="text-2xl mb-2">🐙</p>
        <p className="text-sm text-muted-foreground">
          OctoImpact 2.0 — AI + FinTech + Web3 Sustainability Engine
        </p>
        <p className="text-xs text-muted-foreground/50 mt-2">
          Built with conviction for a greener future
        </p>
      </footer>
    </div>
  );
}
