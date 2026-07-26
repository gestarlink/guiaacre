
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT,
  color TEXT,
  icon_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are public"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.categories (slug, name, emoji, color, sort_order) VALUES
  ('alimentacao', 'Alimentação', '🍔', 'oklch(0.96 0.04 60)', 1),
  ('lojas', 'Lojas', '🛍️', 'oklch(0.96 0.06 100)', 2),
  ('beleza', 'Beleza', '✂️', 'oklch(0.96 0.03 20)', 3),
  ('servicos', 'Serviços', '🔧', 'oklch(0.95 0.04 230)', 4),
  ('saude', 'Saúde', '❤️', 'oklch(0.96 0.04 25)', 5);
