import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return (
    <div className="min-h-screen hero-bg flex items-center justify-center">
      <div className="glass rounded-3xl p-8 text-center max-w-md">
        <p className="text-lg font-display font-bold mb-2">Invalid Reset Link</p>
        <p className="text-muted-foreground text-sm">This link may have expired. Request a new password reset.</p>
        <Button variant="ocean" className="mt-4" onClick={() => navigate('/auth')}>Back to Login</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🐙</span>
          <h1 className="text-2xl font-display font-black mt-3">Set New Password</h1>
        </div>
        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" type="password" placeholder="New password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button variant="ocean" className="w-full h-12" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
