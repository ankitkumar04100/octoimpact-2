import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Zap, TrendingUp, Coins, Vote, LogOut, RotateCcw, ArrowUpRight } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/actions', label: 'Actions', icon: Zap },
  { to: '/fintech', label: 'FinTech', icon: TrendingUp },
  { to: '/web3', label: 'Web3', icon: Coins },
  { to: '/dao', label: 'DAO', icon: Vote },
];

export default function Navbar() {
  const { user, authMode, logout, resetDemo } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleSwitchToReal = () => {
    navigate('/auth');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🐙</span>
          <span className="font-display font-bold text-lg ocean-gradient-text hidden sm:inline">
            OctoImpact
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant={location.pathname === to ? 'default' : 'ghost'}
                size="sm"
                className="gap-1.5"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <div className="h-8 w-8 rounded-full ocean-gradient flex items-center justify-center text-primary-foreground text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm">
              <p className="font-medium leading-tight">{user.name}</p>
              <p className="text-muted-foreground text-xs">
                {authMode === 'demo' ? 'Demo' : authMode === 'guest' ? 'Guest' : authMode === 'google' ? 'Google' : 'User'}
              </p>
            </div>
          </div>
          {(authMode === 'demo' || authMode === 'guest') && (
            <Button variant="ghost" size="sm" onClick={resetDemo} title="Reset Demo">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {(authMode === 'demo' || authMode === 'guest') && (
            <Button variant="ocean" size="sm" onClick={handleSwitchToReal} className="gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> Switch to Real
            </Button>
          )}
          {authMode !== 'demo' && authMode !== 'guest' && (
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
