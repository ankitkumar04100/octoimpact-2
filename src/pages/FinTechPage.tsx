import { useState, useMemo, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { parseCSVTransactions, getCategoryStats, getWasteAlerts, computeFSI, computeEcoScoreFromTransactions } from '@/engines/fintech';
import { Upload, AlertTriangle, TrendingUp, DollarSign, Leaf, Sparkles } from 'lucide-react';
import OctomindChat from '@/components/chat/OctomindChat';

const COLORS = ['#0d9488', '#06b6d4', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export default function FinTechPage() {
  const { user, transactions, addTransactions, insights } = useApp();
  const [dragOver, setDragOver] = useState(false);

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
    e.preventDefault();
    setDragOver(false);
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

  // Eco-efficiency: green spend vs total spend
  const ecoEfficiency = useMemo(() => {
    const greenSpend = transactions.filter(t => t.classification === 'green').reduce((s, t) => s + t.amount, 0);
    const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);
    return totalSpend > 0 ? Math.round((greenSpend / totalSpend) * 100) : 0;
  }, [transactions]);

  if (!user) return null;

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

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Classification Pie */}
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

          {/* Category Bar with Carbon Intensity */}
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
                    <div key={i} className="glass rounded-xl p-4 text-sm border-l-4 border-orange-400">
                      {alert}
                    </div>
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
                    <div key={ins.id} className="glass-ocean rounded-xl p-4 text-sm">
                      {ins.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transaction List */}
        {transactions.length > 0 && (
          <div>
            <h3 className="font-display font-bold mb-3">Transactions</h3>
            <div className="glass rounded-2xl divide-y divide-border/50">
              {transactions.slice(0, 20).map(tx => (
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
