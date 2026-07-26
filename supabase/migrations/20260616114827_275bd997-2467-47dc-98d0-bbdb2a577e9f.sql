
-- Estender businesses com campos do Google Places
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS place_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS rating numeric,
  ADD COLUMN IF NOT EXISTS rating_count integer,
  ADD COLUMN IF NOT EXISTS opening_hours jsonb,
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS facebook text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS city_id text;

-- Permitir importação sem bairro obrigatório
ALTER TABLE public.businesses ALTER COLUMN neighborhood DROP NOT NULL;
ALTER TABLE public.businesses ALTER COLUMN neighborhood_id DROP NOT NULL;
ALTER TABLE public.businesses ALTER COLUMN whatsapp DROP NOT NULL;

-- Slug único quando preenchido
CREATE UNIQUE INDEX IF NOT EXISTS businesses_slug_unique ON public.businesses (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS businesses_place_id_idx ON public.businesses (place_id) WHERE place_id IS NOT NULL;

-- Remover fluxo antigo de aprovação manual
DROP TABLE IF EXISTS public.discovered_businesses CASCADE;
DROP TABLE IF EXISTS public.discovery_jobs CASCADE;
