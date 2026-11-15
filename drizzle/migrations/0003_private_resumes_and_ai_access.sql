CREATE TABLE public.resumes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 name text NOT NULL DEFAULT 'Untitled resume',
 content jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY resumes_owner ON public.resumes FOR ALL TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE INDEX resumes_owner_updated ON public.resumes(user_id, updated_at DESC);
CREATE FUNCTION public.touch_resume() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER resume_updated BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.touch_resume();
CREATE TABLE public.resume_ai_access (
 scope text PRIMARY KEY,
 status integer NOT NULL,
 message text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.resume_ai_access TO service_role;
ALTER TABLE public.resume_ai_access ENABLE ROW LEVEL SECURITY;