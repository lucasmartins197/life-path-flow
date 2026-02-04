-- =============================================
-- MOVIMENTO APOSTANDO NA VIDA - DATABASE SCHEMA
-- =============================================

-- 1. Create custom types
CREATE TYPE public.app_role AS ENUM ('user', 'professional', 'admin');
CREATE TYPE public.session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.notification_type AS ENUM ('system', 'session', 'payment', 'journey', 'routine');

-- 2. User Roles table (for RBAC)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles table (basic user info)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Patient Profile (extended info for patients)
CREATE TABLE public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  date_of_birth DATE,
  emergency_contact TEXT,
  health_notes TEXT,
  journey_started_at TIMESTAMPTZ,
  current_step INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Professional Profile
CREATE TABLE public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialty TEXT NOT NULL,
  bio TEXT,
  credentials TEXT,
  hourly_rate DECIMAL(10,2) DEFAULT 150.00,
  is_approved BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Patient-Professional Link
CREATE TABLE public.patient_professional_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (patient_id, professional_id)
);

ALTER TABLE public.patient_professional_links ENABLE ROW LEVEL SECURITY;

-- 7. Patient Record Entry (Prontuário)
CREATE TABLE public.patient_record_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entry_type TEXT NOT NULL, -- 'journey_response', 'session_note', 'ai_interaction', 'routine_log'
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_record_entries ENABLE ROW LEVEL SECURITY;

-- 8. Journey Steps (CMS - Admin editable)
CREATE TABLE public.journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  exercises JSONB DEFAULT '[]',
  reflection_questions JSONB DEFAULT '[]',
  duration_minutes INTEGER DEFAULT 30,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journey_steps ENABLE ROW LEVEL SECURITY;

-- 9. Trail Progress (User progress in journey)
CREATE TABLE public.trail_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_id UUID REFERENCES public.journey_steps(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  video_watched BOOLEAN DEFAULT false,
  exercises_completed JSONB DEFAULT '{}',
  reflection_answers JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, step_id)
);

ALTER TABLE public.trail_progress ENABLE ROW LEVEL SECURITY;

-- 10. User Badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 11. Routine Days
CREATE TABLE public.routine_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  morning_plan JSONB DEFAULT '{}',
  afternoon_plan JSONB DEFAULT '{}',
  evening_plan JSONB DEFAULT '{}',
  notes TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE public.routine_days ENABLE ROW LEVEL SECURITY;

-- 12. Finance Events
CREATE TABLE public.finance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'income', 'expense', 'debt', 'goal'
  category TEXT,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_events ENABLE ROW LEVEL SECURITY;

-- 13. Sessions (Therapy sessions)
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  status session_status DEFAULT 'scheduled',
  session_type TEXT DEFAULT 'video', -- 'video', 'audio', 'chat'
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 14. Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'annual'
  status subscription_status DEFAULT 'pending',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  price_amount DECIMAL(10,2) NOT NULL,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 15. Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payment_type TEXT NOT NULL, -- 'subscription', 'session'
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2),
  professional_amount DECIMAL(10,2),
  status payment_status DEFAULT 'pending',
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 16. Agent Memory (AI context)
CREATE TABLE public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  importance INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;

-- 17. Agent Messages
CREATE TABLE public.agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  actions_taken JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- 18. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if professional can access patient record
CREATE OR REPLACE FUNCTION public.can_access_patient_record(_professional_id UUID, _patient_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patient_professional_links
    WHERE professional_id = _professional_id
      AND patient_id = _patient_id
      AND is_active = true
  )
$$;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- User Roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Patient Profiles policies
CREATE POLICY "Patients can view own profile" ON public.patient_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Linked professionals can view patient profiles" ON public.patient_profiles
  FOR SELECT USING (public.can_access_patient_record(auth.uid(), user_id));

CREATE POLICY "Patients can manage own profile" ON public.patient_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all patient profiles" ON public.patient_profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Professional Profiles policies
CREATE POLICY "Anyone can view approved professionals" ON public.professional_profiles
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Professionals can manage own profile" ON public.professional_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all professional profiles" ON public.professional_profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Patient-Professional Links policies
CREATE POLICY "Patients can view own links" ON public.patient_professional_links
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Professionals can view own links" ON public.patient_professional_links
  FOR SELECT USING (auth.uid() = professional_id);

CREATE POLICY "Patients can create links" ON public.patient_professional_links
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Patient Record Entries policies
CREATE POLICY "Patients can view own records" ON public.patient_record_entries
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Linked professionals can view patient records" ON public.patient_record_entries
  FOR SELECT USING (public.can_access_patient_record(auth.uid(), patient_id));

CREATE POLICY "Patients can insert own records" ON public.patient_record_entries
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Professionals can insert records for linked patients" ON public.patient_record_entries
  FOR INSERT WITH CHECK (public.can_access_patient_record(auth.uid(), patient_id));

-- Journey Steps policies
CREATE POLICY "Authenticated users can view published steps" ON public.journey_steps
  FOR SELECT TO authenticated USING (is_published = true);

CREATE POLICY "Admins can manage journey steps" ON public.journey_steps
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trail Progress policies
CREATE POLICY "Users can manage own progress" ON public.trail_progress
  FOR ALL USING (auth.uid() = user_id);

-- User Badges policies
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges" ON public.user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Routine Days policies
CREATE POLICY "Users can manage own routine" ON public.routine_days
  FOR ALL USING (auth.uid() = user_id);

-- Finance Events policies
CREATE POLICY "Users can manage own finances" ON public.finance_events
  FOR ALL USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Patients can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Professionals can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = professional_id);

CREATE POLICY "Patients can create sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Participants can update sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = patient_id OR auth.uid() = professional_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Agent Memory policies
CREATE POLICY "Users can manage own agent memory" ON public.agent_memory
  FOR ALL USING (auth.uid() = user_id);

-- Agent Messages policies
CREATE POLICY "Users can manage own messages" ON public.agent_messages
  FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_profiles_updated_at BEFORE UPDATE ON public.professional_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journey_steps_updated_at BEFORE UPDATE ON public.journey_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routine_days_updated_at BEFORE UPDATE ON public.routine_days
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_events_updated_at BEFORE UPDATE ON public.finance_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.patient_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial journey steps
INSERT INTO public.journey_steps (step_number, title, description, duration_minutes) VALUES
(1, 'Admitir a Impotência', 'Reconhecer que a dependência está fora de controle e que precisamos de ajuda.', 30),
(2, 'Encontrar Esperança', 'Acreditar que uma força maior pode nos restaurar à sanidade.', 30),
(3, 'Tomar uma Decisão', 'Entregar nossa vontade e vida aos cuidados de Deus.', 30),
(4, 'Fazer um Inventário Moral', 'Fazer um inventário moral profundo e destemido de nós mesmos.', 45),
(5, 'Admitir os Erros', 'Admitir para Deus, para nós mesmos e para outro ser humano a natureza exata de nossos erros.', 30),
(6, 'Prontidão para Mudança', 'Estar inteiramente prontos para que Deus remova todos esses defeitos de caráter.', 30),
(7, 'Pedir Humildemente', 'Humildemente pedir a Deus que remova nossas imperfeições.', 30),
(8, 'Lista de Pessoas Prejudicadas', 'Fazer uma lista de todas as pessoas que prejudicamos e dispor-nos a reparar os danos.', 45),
(9, 'Fazer Reparações', 'Fazer reparações diretas a tais pessoas sempre que possível.', 45),
(10, 'Continuar o Inventário', 'Continuar fazendo o inventário pessoal e admitir prontamente quando estivermos errados.', 30),
(11, 'Oração e Meditação', 'Procurar através da oração e meditação melhorar nosso contato consciente com Deus.', 30),
(12, 'Praticar os Princípios', 'Tendo experimentado um despertar espiritual, transmitir esta mensagem e praticar estes princípios.', 30);