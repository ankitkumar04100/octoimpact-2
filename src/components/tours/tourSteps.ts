import type { TourStep } from './GuidedTour';

export const DASHBOARD_TOUR: TourStep[] = [
  { target: '#overview', title: 'Overview', description: 'Your EcoScore, token balance, streak, and level at a glance. These update in real-time as you take actions.', icon: '📊' },
  { target: '#insights', title: 'AI Insights', description: 'OCTOMIND generates context-aware recommendations based on your activity, spending, and streak. Refresh anytime.', icon: '🧠' },
  { target: '#activity', title: 'Activity Feed', description: 'Every action you log appears here with token rewards and CO₂ savings. Minting status shows pending → confirmed.', icon: '⚡' },
  { target: '#badges', title: 'Badges & NFTs', description: 'Earn EcoBadge NFTs for milestones: 7-day streak (Bronze), 30-day (Silver), 500 tokens (Platinum). Confetti bursts on mint!', icon: '🏅' },
  { target: '#governance', title: 'DAO Governance', description: 'Vote on proposals with token-weighted power (1 weight per 10 OCTI). Proposals auto-finalize at deadline.', icon: '🗳️' },
  { target: '#pro', title: 'Pro Panels', description: 'Deep analytics: goal tracker, carbon budget, challenges, category intelligence, and data quality metrics.', icon: '🔬' },
];

export const ACTIONS_TOUR: TourStep[] = [
  { title: 'Smart Suggestions', description: 'AI picks the best actions for you based on recent activity and current multipliers. CO₂ and token estimates shown.', icon: '✨' },
  { title: 'Streak Heatmap', description: '28-day heatmap shows your consistency. Longer streaks unlock multiplier bonuses and badge milestones.', icon: '🔥' },
  { title: 'Action Library', description: 'Browse all actions by category with difficulty ratings and time estimates. Tap to log instantly.', icon: '📚' },
  { title: 'Custom Templates', description: 'Create your own action templates with custom categories and impact values. They appear in suggestions too.', icon: '➕' },
];

export const FINTECH_TOUR: TourStep[] = [
  { title: 'Financial Scores', description: 'FSI (Financial Sustainability Index) measures how green your spending is. EcoScore from transactions uses recency weighting.', icon: '📈' },
  { title: 'Mapping Editor', description: 'Create rules to auto-classify transactions (e.g. "uber" → Transport/neutral). Coverage % updates live.', icon: '⚙️' },
  { title: 'What-If Simulator', description: 'Model spending changes and see predicted FSI/EcoScore deltas. Uses the same scoring pipeline as real computation.', icon: '🧮' },
  { title: 'Eco Budget', description: 'Set a green spending target and track progress. AI tips suggest merchant swaps for maximum savings.', icon: '🎯' },
];

export const WEB3_TOUR: TourStep[] = [
  { title: 'Wallet Management', description: 'Your custodial wallet is auto-provisioned. Optionally connect MetaMask for external wallet control.', icon: '👛' },
  { title: 'Token Utility', description: 'OCTI tokens power DAO voting (1 weight per 10 tokens), unlock themes at 100+, and contribute to badge milestones.', icon: '🪙' },
  { title: 'NFT Gallery', description: 'EcoBadge NFTs show rarity, mint date, criteria, and tx reference. Spring animations on hover!', icon: '🖼️' },
];

export const DAO_TOUR: TourStep[] = [
  { title: 'Voting Power', description: 'Your vote weight = total OCTI tokens ÷ 10 (minimum 1). More tokens = more governance influence.', icon: '⚖️' },
  { title: 'Proposal Templates', description: 'Use templates to quickly draft proposals: new action types, reward weight changes, badge milestones, or challenges.', icon: '📝' },
  { title: 'Discussion Threads', description: 'Comment on proposals with sanitized input. Discuss before voting. Your own comments can be deleted.', icon: '💬' },
  { title: 'Anti-Abuse', description: 'Double voting is prevented. Proposals auto-finalize at end time. Token threshold ensures skin-in-the-game.', icon: '🛡️' },
];
