import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'login' | 'signup' | 'reset';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Password reset email sent! Check your inbox.');
        setMode('login');
      } else if (mode === 'signup') {
        if (!name.trim()) { toast.error('Please enter your name'); setLoading(false); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); setLoading(false); return; }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Check your email for a confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-4">
      <motion.div
        className="glass rounded-3xl p-8 w-full max-w-md shadow-xl"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="text-center mb-8">
          <span className="text-4xl">🐙</span>
          <h1 className="text-2xl font-display font-black mt-3">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join OctoImpact' : 'Reset Password'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' ? 'Sign in to continue your journey' : mode === 'signup' ? 'Start your sustainability journey' : 'We\'ll send you a reset link'}
          </p>
        </div>

        {mode !== 'reset' && (
          <Button variant="outline" className="w-full mb-6 gap-2 h-12" onClick={handleGoogle} disabled={loading}>
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>
        )}

        {mode !== 'reset' && (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          {mode !== 'reset' && (
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <input className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              <button type="button" className="absolute right-3 top-3.5 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}
          <Button variant="ocean" className="w-full h-12" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm space-y-2">
          {mode === 'login' && (
            <>
              <button className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMode('reset')}>Forgot password?</button>
              <p className="text-muted-foreground">Don't have an account? <button className="text-ocean-teal font-medium hover:underline" onClick={() => setMode('signup')}>Sign up</button></p>
            </>
          )}
          {mode === 'signup' && (
            <p className="text-muted-foreground">Already have an account? <button className="text-ocean-teal font-medium hover:underline" onClick={() => setMode('login')}>Sign in</button></p>
          )}
          {mode === 'reset' && (
            <button className="text-ocean-teal font-medium hover:underline" onClick={() => setMode('login')}>Back to sign in</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
