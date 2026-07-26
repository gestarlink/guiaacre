
CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'user');
CREATE TYPE public.business_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_id TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  neighborhood_id TEXT NOT NULL,
  address TEXT,
  description TEXT,
  hours TEXT,
  whatsapp TEXT NOT NULL,
  image_url TEXT,
  highlight BOOLEAN NOT NULL DEFAULT false,
  status business_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved businesses are public" ON public.businesses FOR SELECT
  USING (status = 'approved' OR auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can create businesses" ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own businesses" ON public.businesses FOR UPDATE
  USING (auth.uid() = owner_id);
CREATE POLICY "Admins can update any business" ON public.businesses FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can delete own businesses" ON public.businesses FOR DELETE
  USING (auth.uid() = owner_id);
CREATE POLICY "Admins can delete any business" ON public.businesses FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_count INT;
BEGIN
  INSERT INTO public.profiles (user_id, display_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.raw_user_meta_data->>'phone');

  SELECT count(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO storage.buckets (id, name, public) VALUES ('business-photos', 'business-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Business photos are public" ON storage.objects FOR SELECT USING (bucket_id = 'business-photos');
CREATE POLICY "Auth upload business photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'business-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners update business photos" ON storage.objects FOR UPDATE
  USING (bucket_id = 'business-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners delete business photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'business-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
