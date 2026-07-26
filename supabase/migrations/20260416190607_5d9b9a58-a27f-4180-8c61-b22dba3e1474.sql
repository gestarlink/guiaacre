-- Tier enum
CREATE TYPE public.business_tier AS ENUM ('basic', 'featured', 'premium');

ALTER TABLE public.businesses
  ADD COLUMN tier public.business_tier NOT NULL DEFAULT 'basic';

-- Migrar highlight existente para featured
UPDATE public.businesses SET tier = 'featured' WHERE highlight = true;

-- Bairros table
CREATE TABLE public.neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Rio Branco',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Neighborhoods are public"
  ON public.neighborhoods FOR SELECT USING (true);

CREATE POLICY "Admins can insert neighborhoods"
  ON public.neighborhoods FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update neighborhoods"
  ON public.neighborhoods FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete neighborhoods"
  ON public.neighborhoods FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_neighborhoods_updated_at
  BEFORE UPDATE ON public.neighborhoods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed com bairros existentes
INSERT INTO public.neighborhoods (slug, name, city, image_url) VALUES
  ('sobral', 'Sobral', 'Rio Branco', 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=400'),
  ('bosque', 'Bosque', 'Rio Branco', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'),
  ('centro', 'Centro', 'Rio Branco', 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400'),
  ('isaac', 'Isaac Lima', 'Rio Branco', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400');