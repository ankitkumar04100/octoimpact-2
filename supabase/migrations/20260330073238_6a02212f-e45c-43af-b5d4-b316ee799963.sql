-- Fix overly permissive UPDATE policy on proposals
DROP POLICY "Users can update proposals" ON public.proposals;
CREATE POLICY "Creator can update own proposals" ON public.proposals FOR UPDATE TO authenticated USING (auth.uid() = created_by);