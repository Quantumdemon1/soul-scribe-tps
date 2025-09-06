-- Add missing DELETE policies for user data management rights

-- Allow users to delete their own AI insights
CREATE POLICY "Users can delete their own insights"
ON public.ai_insights
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own user preferences  
CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own insight comparisons
CREATE POLICY "Users can delete their own comparisons" 
ON public.insight_comparisons
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete their own socratic sessions
CREATE POLICY "Users can delete their own sessions"
ON public.socratic_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to update their own insight comparisons (missing UPDATE policy)
CREATE POLICY "Users can update their own comparisons"
ON public.insight_comparisons
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to update their own AI insights (missing UPDATE policy)
CREATE POLICY "Users can update their own insights"
ON public.ai_insights
FOR UPDATE  
USING (auth.uid() = user_id);