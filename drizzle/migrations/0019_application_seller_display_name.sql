ALTER TABLE public.job_applications ADD COLUMN seller_name text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.validate_job_application() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.seller_name := COALESCE((SELECT p.name FROM public.profiles p WHERE p.id = NEW.seller_id), '');
  END IF;
  IF length(trim(NEW.cover_note)) NOT BETWEEN 20 AND 4000 THEN RAISE EXCEPTION 'Your application note must be 20-4000 characters'; END IF;
  IF NEW.status = 'hired' AND EXISTS (SELECT 1 FROM public.job_applications a WHERE a.job_id = NEW.job_id AND a.status = 'hired' AND a.id <> NEW.id) THEN
    RAISE EXCEPTION 'This job already has a hire';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;