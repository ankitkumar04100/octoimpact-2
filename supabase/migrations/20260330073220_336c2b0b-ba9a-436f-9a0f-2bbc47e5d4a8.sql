-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  wallet_address TEXT DEFAULT '',
  join_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  eco_score NUMERIC NOT NULL DEFAULT 0,
  fsi_score NUMERIC NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  energy_points NUMERIC NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  today_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Actions table
CREATE TABLE public.actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  impact_value NUMERIC NOT NULL DEFAULT 0,
  financial_impact NUMERIC NOT NULL DEFAULT 0,
  ai_category TEXT DEFAULT '',
  blockchain_status TEXT NOT NULL DEFAULT 'pending',
  reward_minted BOOLEAN NOT NULL DEFAULT false,
  tokens_earned INTEGER NOT NULL DEFAULT 0,
  co2_reduced NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own actions" ON public.actions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own actions" ON public.actions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own actions" ON public.actions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Insights table
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'insight',
  generated_by TEXT NOT NULL DEFAULT 'AI',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON public.insights FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.insights FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT '',
  classification TEXT NOT NULL DEFAULT 'neutral',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  carbon_intensity NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Token logs table
CREATE TABLE public.token_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0,
  action_type TEXT NOT NULL DEFAULT '',
  tx_hash TEXT NOT NULL DEFAULT '',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  nft_issued BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.token_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own token_logs" ON public.token_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own token_logs" ON public.token_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  tier TEXT NOT NULL DEFAULT 'bronze',
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  token_id TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, badge_id)
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON public.badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- DAO Proposals table
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name TEXT DEFAULT 'Anonymous',
  status TEXT NOT NULL DEFAULT 'active',
  yes_votes INTEGER NOT NULL DEFAULT 0,
  no_votes INTEGER NOT NULL DEFAULT 0,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view proposals" ON public.proposals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create proposals" ON public.proposals FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update proposals" ON public.proposals FOR UPDATE TO authenticated USING (true);

-- Votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, user_id)
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view votes" ON public.votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own votes" ON public.votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, wallet_address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    '0x' || encode(gen_random_bytes(20), 'hex')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.actions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.insights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.token_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;