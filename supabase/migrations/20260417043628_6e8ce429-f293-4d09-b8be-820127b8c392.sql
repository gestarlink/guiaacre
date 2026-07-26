CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  uf TEXT NOT NULL DEFAULT 'AC',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are public" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Admins can insert cities" ON public.cities FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update cities" ON public.cities FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete cities" ON public.cities FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_cities_updated_at
BEFORE UPDATE ON public.cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cities (slug, name, uf, sort_order) VALUES ('rio-branco', 'Rio Branco', 'AC', 0);