
-- Add 'advogado' to professional_type enum
ALTER TYPE public.professional_type ADD VALUE IF NOT EXISTS 'advogado';

-- Lawyer-specific documents
CREATE TABLE public.lawyer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_url text NOT NULL,
  document_type text NOT NULL DEFAULT 'oab_card',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lawyer_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own lawyer docs" ON public.lawyer_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all lawyer docs" ON public.lawyer_documents FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Lawyer availability
CREATE TABLE public.lawyer_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lawyer_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own availability" ON public.lawyer_availability FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view lawyer availability" ON public.lawyer_availability FOR SELECT USING (true);

-- Legal consultations (pre-consultation form data)
CREATE TABLE public.legal_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  lawyer_id uuid NOT NULL,
  session_id uuid REFERENCES public.sessions(id),
  patient_name text NOT NULL,
  patient_cpf text NOT NULL,
  patient_city text NOT NULL,
  debt_description text NOT NULL,
  approximate_income numeric,
  lgpd_consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.legal_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own legal consultations" ON public.legal_consultations FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "Lawyers can view assigned consultations" ON public.legal_consultations FOR SELECT USING (auth.uid() = lawyer_id);
CREATE POLICY "Admins can manage all legal consultations" ON public.legal_consultations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Debt simulations
CREATE TABLE public.debt_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  debt_amount numeric NOT NULL,
  interest_rate numeric NOT NULL,
  monthly_income numeric NOT NULL,
  ai_result jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.debt_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own simulations" ON public.debt_simulations FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for lawyer documents
INSERT INTO storage.buckets (id, name, public) VALUES ('lawyer-documents', 'lawyer-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own lawyer docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lawyer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own lawyer docs" ON storage.objects FOR SELECT USING (bucket_id = 'lawyer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all lawyer docs" ON storage.objects FOR SELECT USING (bucket_id = 'lawyer-documents' AND has_role(auth.uid(), 'admin'::app_role));
