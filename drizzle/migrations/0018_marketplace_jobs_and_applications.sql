CREATE OR REPLACE FUNCTION public.is_buyer() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT COALESCE(public.current_account_type() = 'buyer', false) $$;
REVOKE ALL ON FUNCTION public.is_buyer() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_buyer() TO authenticated;

CREATE TABLE public.jobs(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  experience_level text NOT NULL DEFAULT 'Intermediate',
  location_type text NOT NULL DEFAULT 'Remote',
  country text NOT NULL DEFAULT '',
  budget_type text NOT NULL DEFAULT 'Fixed price',
  budget_amount numeric(12,2),
  budget_currency char(3) NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'draft',
  closing_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  closed_at timestamptz,
  CONSTRAINT jobs_experience CHECK (experience_level IN ('Entry','Intermediate','Senior','Specialist')),
  CONSTRAINT jobs_location CHECK (location_type IN ('Remote','Hybrid','On-site')),
  CONSTRAINT jobs_budget_type CHECK (budget_type IN ('Fixed price','Hourly','Monthly')),
  CONSTRAINT jobs_status CHECK (status IN ('draft','published','closed','archived')),
  CONSTRAINT jobs_budget_amount CHECK (budget_amount IS NULL OR (budget_amount > 0 AND budget_amount <= 100000000)),
  CONSTRAINT jobs_currency CHECK (budget_currency ~ '^[A-Z]{3}$'),
  CONSTRAINT jobs_skills_count CHECK (array_length(skills,1) IS NULL OR array_length(skills,1) <= 20)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.job_is_buyer(job uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job AND j.buyer_id = auth.uid()) $$;
REVOKE ALL ON FUNCTION public.job_is_buyer(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.job_is_buyer(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.job_open_for_application(job uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job AND j.status = 'published' AND (j.closing_date IS NULL OR j.closing_date >= current_date)) $$;
REVOKE ALL ON FUNCTION public.job_open_for_application(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.job_open_for_application(uuid) TO authenticated;

CREATE POLICY active_account_required ON public.jobs AS RESTRICTIVE FOR ALL TO authenticated USING (public.account_is_active()) WITH CHECK (public.account_is_active());
CREATE POLICY maintenance_required ON public.jobs AS RESTRICTIVE FOR ALL TO authenticated USING (public.website_available()) WITH CHECK (public.website_available());
CREATE POLICY buyer_only ON public.jobs AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_buyer()) WITH CHECK (public.is_buyer());
CREATE POLICY job_read ON public.jobs FOR SELECT TO authenticated USING (buyer_id = auth.uid() OR (status = 'published' AND public.is_seller()));
CREATE POLICY job_insert ON public.jobs FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());
CREATE POLICY job_update ON public.jobs FOR UPDATE TO authenticated USING (buyer_id = auth.uid()) WITH CHECK (buyer_id = auth.uid());
CREATE POLICY job_delete ON public.jobs FOR DELETE TO authenticated USING (buyer_id = auth.uid());
CREATE INDEX jobs_buyer_idx ON public.jobs(buyer_id);
CREATE INDEX jobs_visible_idx ON public.jobs(status, closing_date);

CREATE TABLE public.job_applications(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_note text NOT NULL,
  proposed_amount numeric(12,2),
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT job_applications_status CHECK (status IN ('submitted','reviewed','shortlisted','rejected','hired','withdrawn')),
  CONSTRAINT job_applications_amount CHECK (proposed_amount IS NULL OR (proposed_amount > 0 AND proposed_amount <= 100000000)),
  CONSTRAINT job_applications_one UNIQUE (job_id, seller_id)
);
GRANT SELECT, INSERT, UPDATE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY active_account_required ON public.job_applications AS RESTRICTIVE FOR ALL TO authenticated USING (public.account_is_active()) WITH CHECK (public.account_is_active());
CREATE POLICY maintenance_required ON public.job_applications AS RESTRICTIVE FOR ALL TO authenticated USING (public.website_available()) WITH CHECK (public.website_available());
CREATE POLICY participant_only ON public.job_applications AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_seller() OR public.job_is_buyer(job_id)) WITH CHECK (public.is_seller() OR public.job_is_buyer(job_id));
CREATE POLICY application_read ON public.job_applications FOR SELECT TO authenticated USING (seller_id = auth.uid() OR public.job_is_buyer(job_id));
CREATE POLICY application_insert ON public.job_applications FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid() AND public.is_seller() AND public.job_open_for_application(job_id));
CREATE POLICY application_withdraw ON public.job_applications FOR UPDATE TO authenticated USING (seller_id = auth.uid() AND status = 'submitted') WITH CHECK (seller_id = auth.uid() AND status = 'withdrawn');
CREATE POLICY application_review ON public.job_applications FOR UPDATE TO authenticated USING (public.job_is_buyer(job_id)) WITH CHECK (public.job_is_buyer(job_id));
CREATE INDEX job_applications_job_idx ON public.job_applications(job_id);
CREATE INDEX job_applications_seller_idx ON public.job_applications(seller_id);

CREATE OR REPLACE FUNCTION public.validate_job_record() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF length(trim(NEW.title)) NOT BETWEEN 4 AND 150 THEN RAISE EXCEPTION 'Job title must be 4-150 characters'; END IF;
  IF length(trim(NEW.description)) NOT BETWEEN 20 AND 8000 THEN RAISE EXCEPTION 'Job description must be 20-8000 characters'; END IF;
  IF length(trim(NEW.category)) NOT BETWEEN 1 AND 60 THEN RAISE EXCEPTION 'A job category is required'; END IF;
  IF length(trim(NEW.country)) > 60 THEN RAISE EXCEPTION 'Country is too long'; END IF;
  IF EXISTS (SELECT 1 FROM unnest(NEW.skills) s WHERE length(trim(s)) NOT BETWEEN 1 AND 60) THEN RAISE EXCEPTION 'Each skill must be 1-60 characters'; END IF;
  IF NEW.status = 'published' THEN
    IF NEW.budget_amount IS NULL THEN RAISE EXCEPTION 'A budget is required before publishing'; END IF;
    IF NEW.closing_date IS NOT NULL AND NEW.closing_date < current_date THEN RAISE EXCEPTION 'The closing date has already passed'; END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER validate_job_record BEFORE INSERT OR UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.validate_job_record();

CREATE OR REPLACE FUNCTION public.validate_job_application() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF length(trim(NEW.cover_note)) NOT BETWEEN 20 AND 4000 THEN RAISE EXCEPTION 'Your application note must be 20-4000 characters'; END IF;
  IF NEW.status = 'hired' AND EXISTS (SELECT 1 FROM public.job_applications a WHERE a.job_id = NEW.job_id AND a.status = 'hired' AND a.id <> NEW.id) THEN
    RAISE EXCEPTION 'This job already has a hire';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER validate_job_application BEFORE INSERT OR UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.validate_job_application();

CREATE OR REPLACE FUNCTION public.buyer_workspace_counts() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT jsonb_build_object(
    'published', (SELECT count(*) FROM public.jobs WHERE buyer_id = auth.uid() AND status = 'published'),
    'drafts', (SELECT count(*) FROM public.jobs WHERE buyer_id = auth.uid() AND status = 'draft'),
    'closed', (SELECT count(*) FROM public.jobs WHERE buyer_id = auth.uid() AND status = 'closed'),
    'applications', (SELECT count(*) FROM public.job_applications a JOIN public.jobs j ON j.id = a.job_id WHERE j.buyer_id = auth.uid())
  ) $$;
REVOKE ALL ON FUNCTION public.buyer_workspace_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buyer_workspace_counts() TO authenticated;

CREATE OR REPLACE FUNCTION public.seller_workspace_counts() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT jsonb_build_object(
    'applications', (SELECT count(*) FROM public.job_applications WHERE seller_id = auth.uid()),
    'open_jobs', (SELECT count(*) FROM public.jobs WHERE status = 'published' AND (closing_date IS NULL OR closing_date >= current_date))
  ) $$;
REVOKE ALL ON FUNCTION public.seller_workspace_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seller_workspace_counts() TO authenticated;