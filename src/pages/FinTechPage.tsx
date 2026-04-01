import { useState, useMemo, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { parseCSVTransactions, getCategoryStats, getWasteAlerts, computeFSI, computeEcoScoreFromTransactions } from '@/engines/fintech';
import { Upload, AlertTriangle, TrendingUp, DollarSign, Leaf, Sparkles, Settings, Calculator, Search } from 'lucide-react';
import OctomindChat from '@/components/chat/OctomindChat';

const COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export default function FinTechPage() {
  const { user, transactions, addTransactions, insights } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simReduction, setSimReduction] = useState(30);
  const [simCategory, setSimCategory] = useState('Food');
  const [searchTerm, setSearchTerm] = useState('');
  const [mappingRules, setMappingRules] = useState<{ keyword: string; category: string; classification: string }[]>([
    { keyword: 'metro', category: 'Transport', classification: 'green' },
    { keyword: 'uber', category: 'Transport', classification: 'neutral' },
  ]);
  const [newRuleKeyword, setNewRuleKeyword] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Transport');
  const [newRuleClass, setNewRuleClass] = useState('green');

  const handleFile = useCallback((file: File) => {
    if (!user) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSVTransactions(text, user.id);
      if (parsed.length > 0) addTransactions(parsed);
    };
    reader.readAsText(file);
  }, [user, addTransactions]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) handleFile(file);
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const fsi = useMemo(() => computeFSI(transactions), [transactions]);
  const ecoFromTx = useMemo(() => computeEcoScoreFromTransactions(transactions), [transactions]);
  const catStats = useMemo(() => getCategoryStats(transactions), [transactions]);
  const alerts = useMemo(() => getWasteAlerts(transactions), [transactions]);

  const catChartData = useMemo(() =>
    Object.entries(catStats).map(([name, d]) => ({ name, spend: d.spend, carbon: Math.round(d.avgCarbonIntensity * 100) })),
  [catStats]);

  const classifData = useMemo(() => {
    const g = transactions.filter(t => t.classification === 'green').length;
    const n = transactions.filter(t => t.classification === 'neutral').length;
    const c = transactions.filter(t => t.classification === 'carbon-heavy').length;
    return [
      { name: 'Green', value: g, color: '#0d9488' },
      { name: 'Neutral', value: n, color: '#94a3b8' },
      { name: 'Carbon-Heavy', value: c, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [transactions]);

  const ecoEfficiency = useMemo(() => {
    const greenSpend = transactions.filter(t => t.classification === 'green').reduce((s, t) => s + t.amount, 0);
    const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);
    return totalSpend > 0 ? Math.round((greenSpend / totalSpend) * 100) : 0;
  }, [transactions]);

  // What-if simulation
  const simResult = useMemo(() => {
    if (transactions.length === 0) return null;
    const simTxs = transactions.map(t => {
      if (t.category === simCategory && t.classification === 'carbon-heavy') {
        return { ...t, amount: t.amount * (1 - simReduction / 100), carbonIntensity: t.carbonIntensity * 0.7 };
      }
      return t;
    });
    const newFsi = computeFSI(simTxs);
    const newEco = computeEcoScoreFromTransactions(simTxs);
    return { newFsi, newEco, fsiDelta: newFsi - fsi, ecoDelta: newEco - ecoFromTx };
  }, [transactions, simCategory, simReduction, fsi, ecoFromTx]);

  // Filtered transactions
  const filteredTx = useMemo(() => {
    if (!searchTerm) return transactions;
    const lower = searchTerm.toLowerCase();
    return transactions.filter(t => t.description.toLowerCase().includes(lower) || t.category.toLowerCase().includes(lower));
  }, [transactions, searchTerm]);

  if (!user) return null;

  const addMappingRule = () => {
    if (!newRuleKeyword.trim()) return;
    setMappingRules(prev => [...prev, { keyword: newRuleKeyword.toLowerCase(), category: newRuleCategory, classification: newRuleClass }]);
    setNewRuleKeyword('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-6xl mx-auto">
        <motion.h1 className="text-3xl font-display font-black mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="ocean-gradient-text">EcoScore</span> Wallet
        </motion.h1>
        <p className="text-muted-foreground mb-8">Upload transactions, classify spending, and track your Financial Sustainability Index.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { icon: TrendingUp, label: 'FSI Score', value: fsi, color: 'text-ocean-teal' },
            { icon: Leaf, label: 'Tx EcoScore', value: ecoFromTx, color: 'text-ocean-green' },
            { icon: DollarSign, label: 'Transactions', value: transactions.length, color: 'text-ocean-cyan' },
            { icon: Sparkles, label: 'Eco-Efficiency', value: `${ecoEfficiency}%`, color: 'text-ocean-blue' },
            { icon: AlertTriangle, label: 'Alerts', value: alerts.length, color: 'text-orange-500' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-3xl font-display font-black">{s.value}</p>
            </div>
          ))}
        </div>

        {/* CSV Upload */}
        <div
          className={`glass rounded-2xl p-8 mb-8 text-center border-2 border-dashed transition-colors cursor-pointer ${
            dragOver ? 'border-ocean-teal bg-ocean-teal/5' : 'border-border'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('csv-input')?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold">Drop a CSV file or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">Columns: description, amount, date (optional), category (optional)</p>
          <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={onInputChange} />
        </div>

        {/* Tools Row */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Button variant={showMapping ? 'ocean' : 'outline'} size="sm" className="gap-1.5" onClick={() => setShowMapping(!showMapping)}>
            <Settings className="h-3.5 w-3.5" /> Mapping Editor
          </Button>
          <Button variant={showSimulator ? 'ocean' : 'outline'} size="sm" className="gap-1.5" onClick={() => setShowSimulator(!showSimulator)}>
            <Calculator className="h-3.5 w-3.5" /> What-If Simulator
          </Button>
        </div>

        {/* Mapping Editor */}
        <AnimatePresence>
          {showMapping && (
            <motion.div className="glass rounded-2xl p-6 mb-8" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-ocean-teal" /> Merchant Mapping Rules
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Add rules to automatically classify transactions by keyword.</p>
              <div className="space-y-2 mb-4">
                {mappingRules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="bg-muted px-2 py-1 rounded text-xs font-mono">{rule.keyword}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-xs">{rule.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rule.classification === 'green' ? 'bg-ocean-green/10 text-ocean-green' :
                      rule.classification === 'carbon-heavy' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                    }`}>{rule.classification}</span>
                    <button className="text-xs text-muted-foreground hover:text-destructive ml-auto" onClick={() => setMappingRules(prev => prev.filter((_, j) => j !== i))}>×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <input className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm flex-1 min-w-[120px]" placeholder="Keyword..." value={newRuleKeyword} onChange={e => setNewRuleKeyword(e.target.value)} />
                <select className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm" value={newRuleCategory} onChange={e => setNewRuleCategory(e.target.value)}>
                  {['Transport', 'Food', 'Shopping', 'Energy', 'Office', 'General'].map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm" value={newRuleClass} onChange={e => setNewRuleClass(e.target.value)}>
                  <option value="green">Green</option>
                  <option value="neutral">Neutral</option>
                  <option value="carbon-heavy">Carbon-Heavy</option>
                </select>
                <Button variant="ocean" size="sm" onClick={addMappingRule} disabled={!newRuleKeyword.trim()}>Add</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* What-If Simulator */}
        <AnimatePresence>
          {showSimulator && (
            <motion.div className="glass rounded-2xl p-6 mb-8" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <h3 className="font-display font-bold mb-4 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-ocean-cyan" /> What-If Simulator
              </h3>
              <p className="text-xs text-muted-foreground mb-4">See how changes to your spending would affect your scores.</p>
              <div className="flex gap-4 items-end flex-wrap mb-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Category</label>
                  <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" value={simCategory} onChange={e => setSimCategory(e.target.value)}>
                    {Object.keys(catStats).map(c => <option key={c}>{c}</option>)}
                    {Object.keys(catStats).length === 0 && <option>Food</option>}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Reduce carbon-heavy by</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={10} max={80} value={simReduction} onChange={e => setSimReduction(Number(e.target.value))} className="w-32" />
                    <span className="text-sm font-bold">{simReduction}%</span>
                  </div>
                </div>
              </div>
              {simResult && transactions.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-ocean rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground">Predicted FSI</p>
                    <p className="text-2xl font-display font-black">{simResult.newFsi}</p>
                    <p className={`text-xs font-semibold ${simResult.fsiDelta >= 0 ? 'text-ocean-green' : 'text-destructive'}`}>
                      {simResult.fsiDelta >= 0 ? '+' : ''}{simResult.fsiDelta}
                    </p>
                  </div>
                  <div className="glass-ocean rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground">Predicted EcoScore</p>
                    <p className="text-2xl font-display font-black">{simResult.newEco}</p>
                    <p className={`text-xs font-semibold ${simResult.ecoDelta >= 0 ? 'text-ocean-green' : 'text-destructive'}`}>
                      {simResult.ecoDelta >= 0 ? '+' : ''}{simResult.ecoDelta}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Upload transactions to run simulations</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {classifData.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold mb-4">Spending Classification</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={classifData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {classifData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {catChartData.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold mb-4">Spend vs Carbon Intensity</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={catChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="spend" fill="hsl(180 65% 30%)" radius={[4, 4, 0, 0]} name="Spend ($)" />
                  <Bar dataKey="carbon" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} name="Carbon %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Alerts + AI Tips */}
        {(alerts.length > 0 || insights.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {alerts.length > 0 && (
              <div>
                <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" /> Waste Alerts
                </h3>
                <div className="space-y-2">
                  {alerts.map((alert, i) => (
                    <div key={i} className="glass rounded-xl p-4 text-sm border-l-4 border-orange-400">{alert}</div>
                  ))}
                </div>
              </div>
            )}
            {insights.length > 0 && (
              <div>
                <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-ocean-cyan" /> AI FinTech Tips
                </h3>
                <div className="space-y-2">
                  {insights.filter(i => i.type === 'tip' || i.type === 'warning').slice(0, 3).map(ins => (
                    <div key={ins.id} className="glass-ocean rounded-xl p-4 text-sm">{ins.text}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transaction List */}
        {transactions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold">Transactions ({transactions.length})</h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  className="rounded-xl border border-input bg-background pl-8 pr-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="glass rounded-2xl divide-y divide-border/50">
              {filteredTx.slice(0, 20).map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${
                      tx.classification === 'green' ? 'bg-ocean-green' :
                      tx.classification === 'carbon-heavy' ? 'bg-destructive' : 'bg-muted-foreground'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.category} • {tx.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${tx.amount.toFixed(2)}</p>
                    <p className={`text-xs ${
                      tx.classification === 'green' ? 'text-ocean-green' :
                      tx.classification === 'carbon-heavy' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>{tx.classification}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <OctomindChat />
    </div>
  );
}
