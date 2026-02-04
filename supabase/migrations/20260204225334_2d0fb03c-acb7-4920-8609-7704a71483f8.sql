-- ===================================
-- EXPANSÃO CLÍNICA COMPLETA DO BANCO
-- ===================================

-- Enum para tipos de profissional
CREATE TYPE public.professional_type AS ENUM ('psiquiatra', 'psicologo', 'terapeuta');

-- Enum para nível de risco
CREATE TYPE public.risk_level AS ENUM ('baixo', 'moderado', 'alto', 'critico');

-- ===================================
-- TABELA: nutrition_foods (base de alimentos)
-- ===================================
CREATE TABLE public.nutrition_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  serving_size NUMERIC NOT NULL DEFAULT 100,
  serving_unit TEXT NOT NULL DEFAULT 'g',
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbohydrates NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  fiber NUMERIC NOT NULL DEFAULT 0,
  sodium NUMERIC DEFAULT 0,
  sugar NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: nutrition_logs (registro de refeições)
-- ===================================
CREATE TABLE public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  food_id UUID REFERENCES public.nutrition_foods(id) ON DELETE SET NULL,
  custom_food_name TEXT,
  meal_type TEXT NOT NULL DEFAULT 'snack', -- breakfast, lunch, dinner, snack
  quantity NUMERIC NOT NULL DEFAULT 1,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbohydrates NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  fiber NUMERIC NOT NULL DEFAULT 0,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: exercise_activities (tipos de exercício)
-- ===================================
CREATE TABLE public.exercise_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'cardio', -- cardio, strength, flexibility, sports
  calories_per_minute NUMERIC DEFAULT 5,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: exercise_logs (registro de treinos)
-- ===================================
CREATE TABLE public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_id UUID REFERENCES public.exercise_activities(id) ON DELETE SET NULL,
  custom_activity_name TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  intensity TEXT NOT NULL DEFAULT 'moderate', -- light, moderate, intense
  calories_burned NUMERIC DEFAULT 0,
  notes TEXT,
  photo_url TEXT,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: body_evolution (fotos de evolução)
-- ===================================
CREATE TABLE public.body_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'front', -- front, side, back
  weight_kg NUMERIC,
  body_fat_percent NUMERIC,
  muscle_mass_percent NUMERIC,
  ai_analysis JSONB DEFAULT '{}',
  notes TEXT,
  taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: calendar_events (agenda)
-- ===================================
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'personal', -- personal, session, group_class, reminder
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_all_day BOOLEAN DEFAULT false,
  location TEXT,
  meeting_url TEXT,
  reminder_minutes INTEGER DEFAULT 30,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  external_calendar_id TEXT,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  created_by UUID,
  is_global BOOLEAN DEFAULT false, -- admin creates for all users
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: anchor_contacts (contatos âncora)
-- ===================================
CREATE TABLE public.anchor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL, -- pai, mae, irmao, amigo, etc
  phone TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  receive_reports BOOLEAN DEFAULT true,
  receive_alerts BOOLEAN DEFAULT true,
  last_alert_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: risk_signals (sinais de risco)
-- ===================================
CREATE TABLE public.risk_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL, -- missed_routine, negative_sentiment, inactivity, etc
  severity risk_level NOT NULL DEFAULT 'baixo',
  description TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT,
  alert_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- TABELA: daily_reports (relatório diário IA)
-- ===================================
CREATE TABLE public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  journey_summary JSONB DEFAULT '{}',
  nutrition_summary JSONB DEFAULT '{}',
  exercise_summary JSONB DEFAULT '{}',
  routine_summary JSONB DEFAULT '{}',
  risk_assessment JSONB DEFAULT '{}',
  ai_recommendations TEXT[],
  overall_score INTEGER, -- 0-100
  is_viewed BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_date)
);

-- ===================================
-- TABELA: admin_reports (relatórios admin)
-- ===================================
CREATE TABLE public.admin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL, -- financial, users, sessions, subscriptions
  report_period TEXT NOT NULL, -- daily, weekly, monthly
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  generated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================================
-- Atualizar professional_profiles com tipo de profissional
-- ===================================
ALTER TABLE public.professional_profiles 
ADD COLUMN IF NOT EXISTS professional_type professional_type,
ADD COLUMN IF NOT EXISTS council_number TEXT,
ADD COLUMN IF NOT EXISTS council_state TEXT,
ADD COLUMN IF NOT EXISTS council_verified BOOLEAN DEFAULT false;

-- ===================================
-- Atualizar patient_profiles com mais dados
-- ===================================
ALTER TABLE public.patient_profiles
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS height_cm NUMERIC,
ADD COLUMN IF NOT EXISTS blood_type TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT[],
ADD COLUMN IF NOT EXISTS medications TEXT[],
ADD COLUMN IF NOT EXISTS goals TEXT[];

-- ===================================
-- INDEXES para performance
-- ===================================
CREATE INDEX idx_nutrition_logs_user_date ON public.nutrition_logs(user_id, logged_at);
CREATE INDEX idx_exercise_logs_user_date ON public.exercise_logs(user_id, logged_at);
CREATE INDEX idx_body_evolution_user_date ON public.body_evolution(user_id, taken_at);
CREATE INDEX idx_calendar_events_user_time ON public.calendar_events(user_id, start_time);
CREATE INDEX idx_risk_signals_user ON public.risk_signals(user_id, is_resolved);
CREATE INDEX idx_daily_reports_user_date ON public.daily_reports(user_id, report_date);
CREATE INDEX idx_nutrition_foods_name ON public.nutrition_foods USING gin(to_tsvector('portuguese', name));

-- ===================================
-- TRIGGERS para updated_at
-- ===================================
CREATE TRIGGER update_nutrition_foods_updated_at
BEFORE UPDATE ON public.nutrition_foods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anchor_contacts_updated_at
BEFORE UPDATE ON public.anchor_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===================================
-- RLS POLICIES
-- ===================================

-- nutrition_foods: anyone can read verified, users can create custom
ALTER TABLE public.nutrition_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified foods"
ON public.nutrition_foods FOR SELECT
USING (is_verified = true OR created_by = auth.uid());

CREATE POLICY "Users can create custom foods"
ON public.nutrition_foods FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own foods"
ON public.nutrition_foods FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all foods"
ON public.nutrition_foods FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- nutrition_logs: users manage own
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own nutrition logs"
ON public.nutrition_logs FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Linked professionals can view patient nutrition"
ON public.nutrition_logs FOR SELECT
USING (can_access_patient_record(auth.uid(), user_id));

-- exercise_activities: public read
ALTER TABLE public.exercise_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activities"
ON public.exercise_activities FOR SELECT
USING (true);

CREATE POLICY "Admins can manage activities"
ON public.exercise_activities FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- exercise_logs: users manage own
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercise logs"
ON public.exercise_logs FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Linked professionals can view patient exercises"
ON public.exercise_logs FOR SELECT
USING (can_access_patient_record(auth.uid(), user_id));

-- body_evolution: users manage own
ALTER TABLE public.body_evolution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own body evolution"
ON public.body_evolution FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Linked professionals can view patient evolution"
ON public.body_evolution FOR SELECT
USING (can_access_patient_record(auth.uid(), user_id));

-- calendar_events: users manage own + see global
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own events"
ON public.calendar_events FOR ALL
USING (auth.uid() = user_id OR is_global = true);

CREATE POLICY "Admins can manage all events"
ON public.calendar_events FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- anchor_contacts: users manage own
ALTER TABLE public.anchor_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own anchor contacts"
ON public.anchor_contacts FOR ALL
USING (auth.uid() = user_id);

-- risk_signals: users view own, professionals view linked
ALTER TABLE public.risk_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own risk signals"
ON public.risk_signals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Professionals can view linked patient risks"
ON public.risk_signals FOR SELECT
USING (can_access_patient_record(auth.uid(), user_id));

CREATE POLICY "Admins can manage all risk signals"
ON public.risk_signals FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- daily_reports: users view own
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily reports"
ON public.daily_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update viewed status"
ON public.daily_reports FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Linked professionals can view patient reports"
ON public.daily_reports FOR SELECT
USING (can_access_patient_record(auth.uid(), user_id));

-- admin_reports: admins only
ALTER TABLE public.admin_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin reports"
ON public.admin_reports FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ===================================
-- STORAGE BUCKETS
-- ===================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('videos', 'videos', false, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('body-photos', 'body-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('exercise-photos', 'exercise-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('journey-content', 'journey-content', false, 524288000, ARRAY['video/mp4', 'video/webm', 'image/jpeg', 'image/png']);

-- Storage policies for videos (admin upload, users view if authenticated)
CREATE POLICY "Admins can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Storage policies for body-photos (users manage own)
CREATE POLICY "Users can upload own body photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'body-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own body photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'body-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own body photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'body-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for exercise-photos (users manage own)
CREATE POLICY "Users can upload own exercise photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'exercise-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own exercise photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for journey-content (admin upload, users view)
CREATE POLICY "Admins can manage journey content"
ON storage.objects FOR ALL
USING (bucket_id = 'journey-content' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view journey content"
ON storage.objects FOR SELECT
USING (bucket_id = 'journey-content' AND auth.role() = 'authenticated');

-- ===================================
-- BASE DE ALIMENTOS BRASILEIROS (seed)
-- ===================================
INSERT INTO public.exercise_activities (name, category, calories_per_minute, icon) VALUES
  ('Caminhada', 'cardio', 4, 'walking'),
  ('Corrida', 'cardio', 10, 'running'),
  ('Ciclismo', 'cardio', 8, 'bike'),
  ('Natação', 'cardio', 9, 'swim'),
  ('Musculação', 'strength', 6, 'dumbbell'),
  ('Yoga', 'flexibility', 3, 'yoga'),
  ('Pilates', 'flexibility', 4, 'pilates'),
  ('Futebol', 'sports', 9, 'soccer'),
  ('Basquete', 'sports', 8, 'basketball'),
  ('Dança', 'cardio', 7, 'dance'),
  ('HIIT', 'cardio', 12, 'hiit'),
  ('Alongamento', 'flexibility', 2, 'stretch');

INSERT INTO public.nutrition_foods (name, serving_size, serving_unit, calories, protein, carbohydrates, fat, fiber, is_verified) VALUES
  ('Arroz branco cozido', 100, 'g', 130, 2.7, 28, 0.3, 0.4, true),
  ('Feijão preto cozido', 100, 'g', 77, 4.5, 14, 0.5, 8.4, true),
  ('Frango grelhado (peito)', 100, 'g', 165, 31, 0, 3.6, 0, true),
  ('Ovo cozido', 50, 'g', 78, 6.3, 0.6, 5.3, 0, true),
  ('Banana prata', 100, 'g', 98, 1.3, 26, 0.1, 2, true),
  ('Maçã', 100, 'g', 52, 0.3, 14, 0.2, 2.4, true),
  ('Pão francês', 50, 'g', 150, 4, 29, 1.5, 1, true),
  ('Leite integral', 200, 'ml', 124, 6.6, 9.4, 6.6, 0, true),
  ('Café com açúcar', 100, 'ml', 32, 0.3, 8, 0, 0, true),
  ('Batata doce cozida', 100, 'g', 77, 0.6, 18, 0.1, 2.5, true),
  ('Alface', 100, 'g', 15, 1.4, 2.9, 0.2, 1.3, true),
  ('Tomate', 100, 'g', 18, 0.9, 3.9, 0.2, 1.2, true),
  ('Carne bovina (patinho)', 100, 'g', 133, 26.4, 0, 3.5, 0, true),
  ('Peixe (tilápia)', 100, 'g', 96, 20, 0, 1.7, 0, true),
  ('Queijo minas frescal', 30, 'g', 70, 5.4, 0.9, 5.1, 0, true),
  ('Iogurte natural', 170, 'g', 100, 5.7, 7.7, 5, 0, true),
  ('Aveia', 30, 'g', 117, 4.2, 20, 2.1, 3.2, true),
  ('Mandioca cozida', 100, 'g', 125, 0.6, 30, 0.3, 1.8, true),
  ('Abacate', 100, 'g', 160, 2, 8.5, 14.7, 6.7, true),
  ('Mamão papaia', 100, 'g', 40, 0.5, 10, 0.1, 1.7, true);