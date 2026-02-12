-- Add new professional types for financial support
ALTER TYPE public.professional_type ADD VALUE IF NOT EXISTS 'contador';
ALTER TYPE public.professional_type ADD VALUE IF NOT EXISTS 'educador_financeiro';

-- Create recovery_scores table for tracking user recovery progress
CREATE TABLE public.recovery_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  journey_score INTEGER NOT NULL DEFAULT 0,
  routine_score INTEGER NOT NULL DEFAULT 0,
  therapy_score INTEGER NOT NULL DEFAULT 0,
  exercise_score INTEGER NOT NULL DEFAULT 0,
  nutrition_score INTEGER NOT NULL DEFAULT 0,
  streak_bonus INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recovery_scores ENABLE ROW LEVEL SECURITY;

-- Users can view own scores
CREATE POLICY "Users can view own recovery scores"
ON public.recovery_scores
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own scores
CREATE POLICY "Users can insert own recovery scores"
ON public.recovery_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own scores
CREATE POLICY "Users can update own recovery scores"
ON public.recovery_scores
FOR UPDATE
USING (auth.uid() = user_id);

-- Linked professionals can view patient scores
CREATE POLICY "Professionals can view linked patient scores"
ON public.recovery_scores
FOR SELECT
USING (can_access_patient_record(auth.uid(), user_id));

-- Create index for fast lookups
CREATE INDEX idx_recovery_scores_user_date ON public.recovery_scores (user_id, calculated_at DESC);