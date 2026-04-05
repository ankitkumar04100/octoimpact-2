import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  proposal_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export default function DAOComments({ proposalId }: { proposalId: string }) {
  const { user, session } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const loadComments = useCallback(async () => {
    if (session) {
      const { data } = await supabase.from('dao_comments')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });
      if (data) setComments(data as Comment[]);
    }
  }, [proposalId, session]);

  useEffect(() => {
    loadComments();

    if (session) {
      const channel = supabase.channel(`comments-${proposalId}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'dao_comments',
          filter: `proposal_id=eq.${proposalId}`,
        }, () => loadComments())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [loadComments, session, proposalId]);

  const submit = async () => {
    if (!newComment.trim() || !user) return;
    const sanitized = newComment.trim().replace(/<[^>]*>/g, '').slice(0, 500);
    setLoading(true);

    if (session) {
      await supabase.from('dao_comments').insert({
        proposal_id: proposalId,
        user_id: session.user.id,
        user_name: user.name || 'Anonymous',
        content: sanitized,
      });
    } else {
      // Demo/Guest: local only
      setComments(prev => [...prev, {
        id: `local-${Date.now()}`,
        proposal_id: proposalId,
        user_id: user.id,
        user_name: user.name || 'Anonymous',
        content: sanitized,
        created_at: new Date().toISOString(),
      }]);
    }

    setNewComment('');
    setLoading(false);
  };

  const deleteComment = async (id: string) => {
    if (session) {
      await supabase.from('dao_comments').delete().eq('id', id);
    }
    setComments(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="mt-4 border-t border-border/30 pt-4">
      <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5 text-ocean-cyan" /> Discussion ({comments.length})
      </p>

      <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
        <AnimatePresence>
          {comments.map(c => (
            <motion.div
              key={c.id}
              className="glass rounded-xl p-2.5 text-xs flex justify-between gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <span className="font-semibold text-ocean-teal">{c.user_name}</span>
                <span className="text-muted-foreground ml-2">{new Date(c.created_at).toLocaleString()}</span>
                <p className="mt-0.5">{c.content}</p>
              </div>
              {user && c.user_id === user.id && (
                <button onClick={() => deleteComment(c.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-[10px] text-muted-foreground">No comments yet. Start the discussion!</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          maxLength={500}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        <Button variant="ocean" size="sm" onClick={submit} disabled={!newComment.trim() || loading} className="h-8 px-3">
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
