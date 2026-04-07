import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

const GOALS = [
  { id: 'transport', label: '🚌 Transport', desc: 'Reduce commute emissions' },
  { id: 'energy', label: '⚡ Energy', desc: 'Lower energy consumption' },
  { id: 'diet', label: '🥗 Diet', desc: 'Eat more sustainably' },
  { id: 'lifestyle', label: '♻️ Lifestyle', desc: 'Reduce waste & plastic' },
  { id: 'home', label: '🏠 Home', desc: 'Green your living space' },
  { id: 'save-money', label: '💰 Save Money', desc: 'Track eco-finance savings' },
];

const CONSTRAINTS = [
  { id: 'student', label: '🎓 Student Schedule', desc: 'Flexible timing, campus-based' },
  { id: 'commuter', label: '🚗 Daily Commuter', desc: '30+ min commute each way' },
  { id: 'remote', label: '🏠 Remote Worker', desc: 'Home-based, flexible schedule' },
  { id: 'vegetarian', label: '🥬 Vegetarian/Vegan', desc: 'Plant-based diet preference' },
  { id: 'budget-sensitive', label: '💸 Budget Sensitive', desc: 'Cost-conscious decisions' },
  { id: 'family', label: '👨‍👩‍👧 Family Household', desc: 'Multiple people, shared impact' },
];

interface Props {
  onComplete: (goals: string[], constraints: string[]) => void;
  onSkip: () => void;
}

export default function OnboardingWizard({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);

  const toggleGoal = (id: string) =>
    setSelectedGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const toggleConstraint = (id: string) =>
    setSelectedConstraints(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'ocean-gradient' : 'bg-muted'}`} />
        <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'ocean-gradient' : 'bg-muted'}`} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-lg font-display font-bold mb-1">What are your goals?</h3>
            <p className="text-xs text-muted-foreground mb-4">Select all that apply — this shapes AI suggestions and OCTOMIND context.</p>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`rounded-xl p-3 text-left transition-all border ${
                    selectedGoals.includes(g.id)
                      ? 'border-ocean-teal bg-ocean-teal/5 shadow-sm'
                      : 'border-border hover:border-ocean-teal/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{g.label}</span>
                    {selectedGoals.includes(g.id) && <Check className="h-3.5 w-3.5 text-ocean-teal" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-lg font-display font-bold mb-1">Your context</h3>
            <p className="text-xs text-muted-foreground mb-4">Help us tailor recommendations to your lifestyle.</p>
            <div className="grid grid-cols-2 gap-2">
              {CONSTRAINTS.map(c => (
                <button
                  key={c.id}
                  onClick={() => toggleConstraint(c.id)}
                  className={`rounded-xl p-3 text-left transition-all border ${
                    selectedConstraints.includes(c.id)
                      ? 'border-ocean-teal bg-ocean-teal/5 shadow-sm'
                      : 'border-border hover:border-ocean-teal/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{c.label}</span>
                    {selectedConstraints.includes(c.id) && <Check className="h-3.5 w-3.5 text-ocean-teal" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-2">
        {step === 1 ? (
          <button onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Skip for now
          </button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        )}

        {step === 1 ? (
          <Button variant="ocean" size="sm" onClick={() => setStep(2)} disabled={selectedGoals.length === 0} className="gap-1">
            Next <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button variant="ocean" size="sm" onClick={() => onComplete(selectedGoals, selectedConstraints)} className="gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Start My Journey
          </Button>
        )}
      </div>
    </div>
  );
}
