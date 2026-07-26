
-- Tabela: jobs de descoberta lançados pelo admin
CREATE TABLE public.discovery_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  city text,
  status text NOT NULL DEFAULT 'running',
  results_count integer NOT NULL DEFAULT 0,
  error_message text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discovery_jobs TO authenticated;
GRANT ALL ON public.discovery_jobs TO service_role;
ALTER TABLE public.discovery_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage discovery_jobs" ON public.discovery_jobs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_discovery_jobs_updated_at
  BEFORE UPDATE ON public.discovery_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela: empresas descobertas pela IA, aguardando revisão
CREATE TABLE public.discovered_businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.discovery_jobs(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  category text,
  city text,
  neighborhood text,
  address text,
  phone text,
  whatsapp text,
  instagram text,
  website text,
  source_url text,
  ai_confidence numeric,
  raw_data jsonb,
  status text NOT NULL DEFAULT 'pending',
  approved_business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discovered_businesses TO authenticated;
GRANT ALL ON public.discovered_businesses TO service_role;
ALTER TABLE public.discovered_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage discovered_businesses" ON public.discovered_businesses
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_discovered_businesses_updated_at
  BEFORE UPDATE ON public.discovered_businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_discovered_businesses_status ON public.discovered_businesses(status);
CREATE INDEX idx_discovered_businesses_job ON public.discovered_businesses(job_id);
