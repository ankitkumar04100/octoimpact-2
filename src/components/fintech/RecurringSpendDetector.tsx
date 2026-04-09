import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { FinTechTransaction } from '@/types';

interface Props {
  transactions: FinTechTransaction[];
}

interface RecurringMerchant {
  name: string;
  count: number;
  totalSpend: number;
  avgAmount: number;
  classification: string;
  avgCarbonIntensity: number;
  frequency: string;
}

export default function RecurringSpendDetector({ transactions }: Props) {
  const recurring = useMemo((): RecurringMerchant[] => {
    const merchants: Record<string, { amounts: number[]; classifications: string[]; carbonIntensities: number[]; dates: number[] }> = {};
    
    for (const tx of transactions) {
      const key = tx.description.toLowerCase().trim();
      if (!merchants[key]) merchants[key] = { amounts: [], classifications: [], carbonIntensities: [], dates: [] };
      merchants[key].amounts.push(tx.amount);
      merchants[key].classifications.push(tx.classification);
      merchants[key].carbonIntensities.push(tx.carbonIntensity);
      merchants[key].dates.push(tx.date.getTime());
    }

    return Object.entries(merchants)
      .filter(([_, d]) => d.amounts.length >= 2)
      .map(([name, d]) => {
        const totalSpend = d.amounts.reduce((s, a) => s + a, 0);
        const avgAmount = totalSpend / d.amounts.length;
        const avgCarbonIntensity = d.carbonIntensities.reduce((s, c) => s + c, 0) / d.carbonIntensities.length;
        const topClassification = d.classifications.sort((a, b) =>
          d.classifications.filter(c => c === b).length - d.classifications.filter(c => c === a).length
        )[0];

        // Estimate frequency
        const sortedDates = [...d.dates].sort();
        let avgGapDays = 7;
        if (sortedDates.length >= 2) {
          const gaps = sortedDates.slice(1).map((d, i) => (d - sortedDates[i]) / 86400000);
          avgGapDays = gaps.reduce((s, g) => s + g, 0) / gaps.length;
        }
        const frequency = avgGapDays <= 2 ? 'Daily' : avgGapDays <= 9 ? 'Weekly' : avgGapDays <= 20 ? 'Bi-weekly' : 'Monthly';

        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count: d.amounts.length,
          totalSpend,
          avgAmount,
          classification: topClassification,
          avgCarbonIntensity,
          frequency,
        };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 8);
  }, [transactions]);

  if (recurring.length === 0) return null;

  const carbonHeavyRecurring = recurring.filter(r => r.classification === 'carbon-heavy');

  return (
    <section className="mb-8">
      <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
        <RefreshCw className="h-5 w-5 text-ocean-cyan" /> Recurring Spend Detector
      </h2>
      <div className="glass rounded-2xl p-6">
        {carbonHeavyRecurring.length > 0 && (
          <div className="glass-ocean rounded-xl p-3 mb-4 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-orange-600">{carbonHeavyRecurring.length} carbon-heavy subscription{carbonHeavyRecurring.length > 1 ? 's' : ''} detected</p>
              <p className="text-muted-foreground">
                Total recurring carbon-heavy spend: ${carbonHeavyRecurring.reduce((s, r) => s + r.totalSpend, 0).toFixed(0)}
              </p>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {recurring.map(r => (
            <motion.div
              key={r.name}
              className="flex items-center justify-between py-3 border-b border-border/30 last:border-0"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  r.classification === 'green' ? 'bg-ocean-green' :
                  r.classification === 'carbon-heavy' ? 'bg-destructive' : 'bg-muted-foreground'
                }`} />
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground">{r.frequency} • {r.count} transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">${r.totalSpend.toFixed(0)}</p>
                <p className="text-[10px] text-muted-foreground">~${r.avgAmount.toFixed(0)}/tx</p>
                {r.classification === 'carbon-heavy' && (
                  <p className="text-[10px] text-destructive font-medium">
                    Carbon: {(r.avgCarbonIntensity * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
