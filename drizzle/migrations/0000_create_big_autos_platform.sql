CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'inventory_manager' CHECK (role IN ('admin', 'inventory_manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  trim TEXT,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  condition TEXT,
  mileage INTEGER,
  transmission TEXT,
  fuel_type TEXT,
  engine_size TEXT,
  drivetrain TEXT,
  body_type TEXT,
  exterior_colour TEXT,
  interior_colour TEXT,
  passenger_capacity INTEGER,
  features TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE INDEX vehicles_make_model_idx ON public.vehicles(make, model);
CREATE INDEX vehicles_year_idx ON public.vehicles(year);

CREATE TABLE public.sales_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL UNIQUE REFERENCES public.vehicles(id) ON DELETE CASCADE,
  price NUMERIC(14,2),
  currency TEXT NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
  price_visibility TEXT NOT NULL DEFAULT 'show' CHECK (price_visibility IN ('show', 'contact')),
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'reserved', 'sold', 'unavailable')),
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sales_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_listings TO authenticated;
GRANT ALL ON public.sales_listings TO service_role;
ALTER TABLE public.sales_listings ENABLE ROW LEVEL SECURITY;
CREATE INDEX sales_listings_public_idx ON public.sales_listings(publication_status, availability_status);

CREATE TABLE public.rental_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL UNIQUE REFERENCES public.vehicles(id) ON DELETE CASCADE,
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'temporarily_unavailable', 'unavailable', 'hidden')),
  publication_status TEXT NOT NULL DEFAULT 'draft' CHECK (publication_status IN ('draft', 'published', 'archived')),
  chauffeur_available BOOLEAN,
  self_drive_available BOOLEAN,
  minimum_duration TEXT,
  fuel_policy TEXT,
  mileage_limit TEXT,
  deposit_information TEXT,
  pickup_delivery_information TEXT,
  rental_terms TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rental_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rental_listings TO authenticated;
GRANT ALL ON public.rental_listings TO service_role;
ALTER TABLE public.rental_listings ENABLE ROW LEVEL SECURITY;
CREATE INDEX rental_listings_public_idx ON public.rental_listings(publication_status, availability_status);

CREATE TABLE public.rental_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_listing_id UUID NOT NULL REFERENCES public.rental_listings(id) ON DELETE CASCADE,
  rate_type TEXT NOT NULL CHECK (rate_type IN ('hourly', 'half_day', 'daily', 'weekly', 'monthly', 'custom')),
  amount NUMERIC(14,2),
  currency TEXT NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
  billing_period TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rental_listing_id, rate_type),
  CHECK ((amount IS NOT NULL AND amount >= 0) OR (rate_type = 'custom' AND amount IS NULL))
);
GRANT SELECT ON public.rental_rates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rental_rates TO authenticated;
GRANT ALL ON public.rental_rates TO service_role;
ALTER TABLE public.rental_rates ENABLE ROW LEVEL SECURITY;
CREATE INDEX rental_rates_listing_idx ON public.rental_rates(rental_listing_id, is_active);

CREATE TABLE public.vehicle_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  storage_path TEXT,
  media_url TEXT,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (storage_path IS NOT NULL OR media_url IS NOT NULL)
);
GRANT SELECT ON public.vehicle_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_media TO authenticated;
GRANT ALL ON public.vehicle_media TO service_role;
ALTER TABLE public.vehicle_media ENABLE ROW LEVEL SECURITY;
CREATE INDEX vehicle_media_gallery_idx ON public.vehicle_media(vehicle_id, display_order);

CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_type TEXT NOT NULL CHECK (enquiry_type IN ('sales', 'rental', 'general')),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE INDEX enquiries_status_idx ON public.enquiries(status, created_at DESC);

CREATE TABLE public.site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  business_name TEXT NOT NULL DEFAULT 'B.I.G Autos',
  whatsapp_number TEXT,
  phone_number TEXT,
  business_email TEXT,
  business_address TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  default_sales_message TEXT NOT NULL DEFAULT 'Hello B.I.G Autos, I’m interested in the {vehicle} listed on your website. Please share more information and inspection arrangements: {url}',
  default_rental_message TEXT NOT NULL DEFAULT 'Hello B.I.G Autos, I’m interested in renting the {vehicle}. Please share availability, rental rates, terms, and booking requirements: {url}',
  about_heading TEXT,
  about_copy TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('vehicle_view', 'whatsapp_click', 'share', 'search')),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  listing_type TEXT CHECK (listing_type IN ('sales', 'rental')),
  page_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.analytics_events TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX analytics_events_created_idx ON public.analytics_events(created_at DESC);
CREATE INDEX analytics_events_vehicle_idx ON public.analytics_events(vehicle_id, event_type);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE ALL ON FUNCTION public.has_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.bootstrap_first_big_autos_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.bootstrap_first_big_autos_admin() FROM PUBLIC;
CREATE TRIGGER bootstrap_first_big_autos_admin_after_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_big_autos_admin();
CREATE INDEX user_roles_role_idx ON public.user_roles(role);

CREATE POLICY "Users can read their own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Public can read vehicles with published listings" ON public.vehicles FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.sales_listings s WHERE s.vehicle_id = id AND s.publication_status = 'published' AND s.availability_status <> 'sold') OR
  EXISTS (SELECT 1 FROM public.rental_listings r WHERE r.vehicle_id = id AND r.publication_status = 'published' AND r.availability_status <> 'hidden') OR
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')
);
CREATE POLICY "Staff can manage vehicles" ON public.vehicles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager'));
CREATE POLICY "Public can read published sales listings" ON public.sales_listings FOR SELECT TO anon, authenticated USING ((publication_status = 'published' AND availability_status <> 'sold') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager'));
CREATE POLICY "Staff can manage sales listings" ON public.sales_listings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager'));
CREATE POLICY "Public can read published rentals" ON public.rental_listings FOR SELECT TO anon, authenticated USING ((publication_status = 'published' AND availability_status <> 'hidden') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager'));
CREATE POLICY "Staff can manage rental listings" ON public.rental_listings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager'));
CREATE POLICY "Public can read active rates for published rentals" ON public.rental_rates FOR SELECT TO anon, authenticated USING (
  (is_active AND EXISTS (SELECT 1 FROM public.rental_listings r WHERE r.id = rental_listing_id AND r.publication_status = 'published' AND r.availability_status <> 'hidden')) OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')
);
CREATE POLICY "Staff can manage rental rates" ON public.rental_rates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager'));
CREATE POLICY "Public can read media for published vehicles" ON public.vehicle_media FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.sales_listings s WHERE s.vehicle_id = vehicle_id AND s.publication_status = 'published' AND s.availability_status <> 'sold') OR
  EXISTS (SELECT 1 FROM public.rental_listings r WHERE r.vehicle_id = vehicle_id AND r.publication_status = 'published' AND r.availability_status <> 'hidden') OR
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')
);
CREATE POLICY "Staff can manage vehicle media" ON public.vehicle_media FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager'));
CREATE POLICY "Staff can manage enquiries" ON public.enquiries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager'));
CREATE POLICY "Public can read business contact settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Administrators can update site settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Visitors can record non-identifying analytics" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (event_type IN ('vehicle_view', 'whatsapp_click', 'share', 'search'));
CREATE POLICY "Staff can review analytics" ON public.analytics_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager'));
INSERT INTO public.site_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER sales_listings_updated_at BEFORE UPDATE ON public.sales_listings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER rental_listings_updated_at BEFORE UPDATE ON public.rental_listings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER rental_rates_updated_at BEFORE UPDATE ON public.rental_rates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER enquiries_updated_at BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Public can read published vehicle media files" ON storage.objects FOR SELECT TO anon, authenticated USING (
  bucket_id = 'vehicle-media' AND EXISTS (
    SELECT 1 FROM public.vehicle_media m WHERE m.storage_path = name AND (
      EXISTS (SELECT 1 FROM public.sales_listings s WHERE s.vehicle_id = m.vehicle_id AND s.publication_status = 'published' AND s.availability_status <> 'sold') OR
      EXISTS (SELECT 1 FROM public.rental_listings r WHERE r.vehicle_id = m.vehicle_id AND r.publication_status = 'published' AND r.availability_status <> 'hidden')
    )
  )
);
CREATE POLICY "Staff can upload vehicle media files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vehicle-media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')));
CREATE POLICY "Staff can update vehicle media files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vehicle-media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager'))) WITH CHECK (bucket_id = 'vehicle-media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')));
CREATE POLICY "Staff can delete vehicle media files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vehicle-media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'inventory_manager')));