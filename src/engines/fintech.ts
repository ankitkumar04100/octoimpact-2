import { FinTechTransaction, TransactionType } from '@/types';

const GREEN_KEYWORDS = [
  'solar', 'organic', 'eco', 'recycle', 'electric', 'bike', 'public transit',
  'farmers market', 'thrift', 'renewable', 'green energy', 'plant-based',
  'vegan', 'compost', 'reusable', 'ev charging', 'sustainable', 'fair trade',
];
const CARBON_KEYWORDS = [
  'gas station', 'airline', 'fast fashion', 'plastic', 'disposable',
  'petroleum', 'coal', 'diesel', 'cruise', 'beef', 'suv', 'mining',
  'fossil', 'chemical', 'synthetic', 'palm oil',
];

export function classifyTransaction(description: string): TransactionType {
  const lower = description.toLowerCase();
  if (GREEN_KEYWORDS.some(k => lower.includes(k))) return 'green';
  if (CARBON_KEYWORDS.some(k => lower.includes(k))) return 'carbon-heavy';
  return 'neutral';
}

export function computeCarbonIntensity(classification: TransactionType, amount: number): number {
  switch (classification) {
    case 'green': return Math.max(0, 0.1 - amount * 0.0001);
    case 'carbon-heavy': return Math.min(1, 0.6 + amount * 0.0005);
    default: return 0.3 + Math.random() * 0.1;
  }
}

export function computeFSI(transactions: FinTechTransaction[]): number {
  if (transactions.length === 0) return 0;
  const now = Date.now();
  const WEEK = 7 * 24 * 60 * 60 * 1000;

  let greenWeight = 0;
  let totalWeight = 0;

  for (const tx of transactions) {
    const age = now - tx.date.getTime();
    const recency = Math.max(0, 1 - age / (8 * WEEK));
    const weight = tx.amount * (0.4 + 0.6 * recency);

    if (tx.classification === 'green') greenWeight += weight;
    else if (tx.classification === 'carbon-heavy') greenWeight -= weight * 0.5;
    totalWeight += Math.abs(weight);
  }

  if (totalWeight === 0) return 50;
  const ratio = (greenWeight / totalWeight + 1) / 2;
  return Math.min(Math.round(ratio * 100), 100);
}

export function computeEcoScoreFromTransactions(transactions: FinTechTransaction[]): number {
  const fsi = computeFSI(transactions);
  const greenCount = transactions.filter(t => t.classification === 'green').length;
  const total = transactions.length || 1;
  const greenRatio = greenCount / total;
  return Math.min(Math.round(fsi * 0.6 + greenRatio * 100 * 0.4), 100);
}

export function getCategoryStats(transactions: FinTechTransaction[]) {
  const stats: Record<string, {
    count: number;
    spend: number;
    avgCarbonIntensity: number;
    greenCount: number;
    carbonCount: number;
    neutralCount: number;
  }> = {};

  for (const tx of transactions) {
    const cat = tx.category || 'Other';
    if (!stats[cat]) {
      stats[cat] = { count: 0, spend: 0, avgCarbonIntensity: 0, greenCount: 0, carbonCount: 0, neutralCount: 0 };
    }
    stats[cat].count++;
    stats[cat].spend += tx.amount;
    stats[cat].avgCarbonIntensity += tx.carbonIntensity;
    if (tx.classification === 'green') stats[cat].greenCount++;
    else if (tx.classification === 'carbon-heavy') stats[cat].carbonCount++;
    else stats[cat].neutralCount++;
  }

  for (const key in stats) {
    stats[key].avgCarbonIntensity = stats[key].avgCarbonIntensity / stats[key].count;
  }

  return stats;
}

export function getWasteAlerts(transactions: FinTechTransaction[]): string[] {
  const alerts: string[] = [];
  const stats = getCategoryStats(transactions);

  for (const [category, data] of Object.entries(stats)) {
    if (data.carbonCount > data.greenCount && data.spend > 50) {
      alerts.push(`⚠️ High carbon spending in ${category}: $${data.spend.toFixed(0)} across ${data.carbonCount} transactions`);
    }
    if (data.avgCarbonIntensity > 0.6) {
      alerts.push(`🔴 ${category} has high carbon intensity (${(data.avgCarbonIntensity * 100).toFixed(0)}%) — consider greener alternatives`);
    }
  }

  const totalCarbon = transactions.filter(t => t.classification === 'carbon-heavy').length;
  const totalGreen = transactions.filter(t => t.classification === 'green').length;
  if (totalCarbon > totalGreen * 2) {
    alerts.push('📊 Your carbon-heavy transactions outnumber green ones 2:1 — time to shift spending patterns');
  }

  return alerts;
}

export function parseCSVTransactions(csvText: string, userId: string): FinTechTransaction[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('name') || h.includes('merchant'));
  const amtIdx = headers.findIndex(h => h.includes('amount') || h.includes('value'));
  const dateIdx = headers.findIndex(h => h.includes('date'));
  const catIdx = headers.findIndex(h => h.includes('categ') || h.includes('type'));

  if (descIdx === -1 || amtIdx === -1) return [];

  return lines.slice(1).map((line, i) => {
    const cols = line.split(',').map(c => c.trim());
    const description = cols[descIdx] || 'Unknown';
    const amount = Math.abs(parseFloat(cols[amtIdx] || '0'));
    const classification = classifyTransaction(description);
    const category = catIdx >= 0 ? cols[catIdx] : description.split(' ')[0];

    return {
      id: `tx-${Date.now()}-${i}`,
      userId,
      description,
      amount,
      category: category || 'General',
      classification,
      date: dateIdx >= 0 ? new Date(cols[dateIdx]) : new Date(),
      carbonIntensity: computeCarbonIntensity(classification, amount),
    };
  }).filter(tx => tx.amount > 0);
}
