import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { User, Globe, Bell, Shield, LogOut, Download, Trash2, Settings, MessageSquare } from 'lucide-react';
import OctomindChat from '@/components/chat/OctomindChat';

export default function ProfilePage() {
  const { user, session, logout, actions, transactions, tokenLogs, badges } = useApp();
  const [locale, setLocale] = useState('en');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [persona, setPersona] = useState('coach');
  const [verbosity, setVerbosity] = useState('normal');
  const [digestOptIn, setDigestOptIn] = useState(false);

  if (!user) return null;

  const exportData = (type: 'actions' | 'transactions' | 'tokens') => {
    let csv = '';
    if (type === 'actions') {
      csv = 'Type,Category,CO2 Reduced,Tokens Earned,Date,Status\n';
      csv += actions.map(a =>
        `"${a.type}","${a.category}",${a.co2Reduced},${a.tokensEarned},"${a.timestamp.toISOString()}","${a.blockchainStatus}"`
      ).join('\n');
    } else if (type === 'transactions') {
      csv = 'Description,Amount,Category,Classification,Date,Carbon Intensity\n';
      csv += transactions.map(t =>
        `"${t.description}",${t.amount},"${t.category}","${t.classification}","${t.date.toISOString()}",${t.carbonIntensity}`
      ).join('\n');
    } else {
      csv = 'Amount,Action Type,TX Hash,NFT Issued,Date\n';
      csv += tokenLogs.map(l =>
        `${l.amount},"${l.actionType}","${l.txHash}",${l.nftIssued},"${l.timestamp.toISOString()}"`
      ).join('\n');
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `octoimpact-${type}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-3xl mx-auto">
        <motion.h1 className="text-3xl font-display font-black mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="ocean-gradient-text">Profile</span> & Settings
        </motion.h1>
        <p className="text-muted-foreground mb-8">Manage your account, preferences, and data.</p>

        {/* Profile Card */}
        <section className="mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-2xl ocean-gradient flex items-center justify-center text-2xl text-primary-foreground font-bold">
                {user.name ? user.name[0].toUpperCase() : '🐙'}
              </div>
              <div>
                <p className="text-lg font-display font-bold">{user.name || 'Anonymous'}</p>
                <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                <p className="text-xs text-muted-foreground">Joined {user.joinDate.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div><p className="text-xl font-black ocean-gradient-text">{user.ecoScore}</p><p className="text-[10px] text-muted-foreground">EcoScore</p></div>
              <div><p className="text-xl font-black">{user.totalTokens}</p><p className="text-[10px] text-muted-foreground">Tokens</p></div>
              <div><p className="text-xl font-black">{user.streak}</p><p className="text-[10px] text-muted-foreground">Streak</p></div>
              <div><p className="text-xl font-black">{badges.length}</p><p className="text-[10px] text-muted-foreground">Badges</p></div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-ocean-teal" /> Preferences
          </h2>
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Locale</p>
                  <p className="text-[10px] text-muted-foreground">Display language</p>
                </div>
              </div>
              <select className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm" value={locale} onChange={e => setLocale(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Timezone</p>
                  <p className="text-[10px] text-muted-foreground">For scheduling & reports</p>
                </div>
              </div>
              <select className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm" value={timezone} onChange={e => setTimezone(e.target.value)}>
                {['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo'].map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* OCTOMIND Settings */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-ocean-cyan" /> OCTOMIND Copilot
          </h2>
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Default Persona</p>
                <p className="text-[10px] text-muted-foreground">Set the AI copilot's default tone</p>
              </div>
              <select className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm" value={persona} onChange={e => setPersona(e.target.value)}>
                <option value="coach">🏋️ Coach</option>
                <option value="analyst">📊 Analyst</option>
                <option value="governance">🏛️ Governance</option>
                <option value="finops">💰 FinOps</option>
                <option value="scientist">🔬 Scientist</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Verbosity</p>
                <p className="text-[10px] text-muted-foreground">How detailed should responses be</p>
              </div>
              <select className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm" value={verbosity} onChange={e => setVerbosity(e.target.value)}>
                <option value="brief">Brief</option>
                <option value="normal">Normal</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-ocean-teal" /> Notifications
          </h2>
          <div className="glass rounded-2xl p-6">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium">Weekly Email Digest</p>
                <p className="text-[10px] text-muted-foreground">Receive a summary of your EcoScore, tokens, and achievements</p>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors ${digestOptIn ? 'bg-ocean-teal' : 'bg-muted'}`} onClick={() => setDigestOptIn(!digestOptIn)}>
                <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-primary-foreground shadow transition-transform ${digestOptIn ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          </div>
        </section>

        {/* Data & Exports */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-ocean-cyan" /> Data & Exports
          </h2>
          <div className="glass rounded-2xl p-6 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => exportData('actions')}>
                <Download className="h-3.5 w-3.5" /> Export Actions
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => exportData('transactions')}>
                <Download className="h-3.5 w-3.5" /> Export Transactions
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => exportData('tokens')}>
                <Download className="h-3.5 w-3.5" /> Export Token Logs
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">All exports contain only your data (RLS enforced).</p>
          </div>
        </section>

        {/* Security */}
        <section className="mb-8">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-ocean-teal" /> Security
          </h2>
          <div className="glass rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Session</p>
                <p className="text-[10px] text-muted-foreground">{session ? 'Authenticated via ' + (session.user.app_metadata?.provider || 'email') : 'Demo/Guest mode'}</p>
              </div>
              <Button variant="destructive" size="sm" className="gap-1.5 text-xs" onClick={logout}>
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Delete Account</p>
                <p className="text-[10px] text-muted-foreground">Request deletion of all your data</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/5">
                <Trash2 className="h-3.5 w-3.5" /> Request Deletion
              </Button>
            </div>
          </div>
        </section>
      </main>
      {user && <OctomindChat />}
    </div>
  );
}
