
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can view analytics events" ON public.analytics_events;
CREATE POLICY "Admins can view all reviews" ON public.reviews FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view analytics events" ON public.analytics_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
