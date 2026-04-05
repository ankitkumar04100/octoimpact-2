import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Coins, Award, Vote, FileText, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  mint: <Coins className="h-4 w-4 text-ocean-cyan" />,
  badge: <Award className="h-4 w-4 text-amber-500" />,
  dao: <Vote className="h-4 w-4 text-ocean-blue" />,
  csv: <FileText className="h-4 w-4 text-ocean-green" />,
  goal: <Target className="h-4 w-4 text-ocean-teal" />,
  info: <Bell className="h-4 w-4 text-muted-foreground" />,
};

export default function NotificationsCenter() {
  const { session, user } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  // For demo/guest mode, use local notifications
  const [localNotifs, setLocalNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    if (session) {
      supabase.from('notifications').select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20)
        .then(({ data }) => {
          if (data) setNotifications(data as Notification[]);
        });

      const channel = supabase.channel('notif-realtime')
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${session.user.id}`,
        }, (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } else {
      // Demo/Guest: generate local notifications from context
      const n: Notification[] = [];
      if (user.streak >= 7) {
        n.push({ id: 'n-streak', type: 'badge', title: 'Streak Milestone!', message: `${user.streak}-day streak active — keep it up!`, read: false, created_at: new Date().toISOString() });
      }
      if (user.totalTokens > 0) {
        n.push({ id: 'n-tokens', type: 'mint', title: 'Tokens Minted', message: `${user.totalTokens} ImpactTokens earned so far.`, read: false, created_at: new Date().toISOString() });
      }
      n.push({ id: 'n-welcome', type: 'info', title: 'Welcome to OctoImpact!', message: 'Start logging actions to earn tokens and badges.', read: false, created_at: new Date().toISOString() });
      setLocalNotifs(n);
    }
  }, [session, user]);

  const allNotifs = session ? notifications : localNotifs;
  const unreadCount = allNotifs.filter(n => !n.read).length;

  const markAllRead = async () => {
    if (session) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id).eq('read', false);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } else {
      setLocalNotifs(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative h-9 w-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-ocean-teal text-primary-foreground text-[9px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-12 z-50 w-80 glass rounded-2xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h3 className="font-display font-bold text-sm">Notifications</h3>
                <div className="flex gap-1">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2" onClick={markAllRead}>
                      <Check className="h-3 w-3 mr-1" /> Mark all read
                    </Button>
                  )}
                  <button className="h-6 w-6 rounded bg-muted flex items-center justify-center" onClick={() => setOpen(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {allNotifs.length > 0 ? allNotifs.map(n => (
                  <div key={n.id} className={`p-3 border-b border-border/30 flex gap-3 ${!n.read ? 'bg-ocean-teal/5' : ''}`}>
                    <div className="mt-0.5 shrink-0">{TYPE_ICONS[n.type] || TYPE_ICONS.info}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground">{n.message}</p>
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="p-6 text-center text-sm text-muted-foreground">No notifications yet</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
