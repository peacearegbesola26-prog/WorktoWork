CREATE OR REPLACE FUNCTION public.has_permission(p text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.account_is_active() AND EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND (role='owner' OR (role='admin' AND p IN ('admin.access','opportunities.manage','sources.manage','audit.read','ai.manage','users.manage','content.manage')) OR (role='moderator' AND p IN ('admin.access','opportunities.manage')))) $$;
CREATE TABLE public.website_content (key text PRIMARY KEY, published jsonb NOT NULL DEFAULT '{}'::jsonb, draft jsonb NOT NULL DEFAULT '{}'::jsonb, revision integer NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.website_content TO authenticated; GRANT ALL ON public.website_content TO service_role;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY content_staff_read ON public.website_content FOR SELECT TO authenticated USING(public.has_permission('content.manage'));
CREATE TABLE public.website_versions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), key text NOT NULL REFERENCES public.website_content(key), content jsonb NOT NULL, revision integer NOT NULL, actor_id uuid, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.website_versions TO authenticated; GRANT ALL ON public.website_versions TO service_role;
ALTER TABLE public.website_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY versions_staff_read ON public.website_versions FOR SELECT TO authenticated USING(public.has_permission('content.manage'));
CREATE TABLE public.website_settings (id boolean PRIMARY KEY DEFAULT true CHECK(id), value jsonb NOT NULL DEFAULT '{"displayName":"Work to Work","logo":"","favicon":"","primary":"","foreground":"","supportEmail":"","announcement":"","maintenance":false,"registrationEnabled":true}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.website_settings TO authenticated; GRANT ALL ON public.website_settings TO service_role;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_owner_read ON public.website_settings FOR SELECT TO authenticated USING(public.has_permission('site.manage'));
CREATE OR REPLACE FUNCTION public.published_website() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT jsonb_build_object('pages',COALESCE((SELECT jsonb_object_agg(key,published) FROM public.website_content),'{}'::jsonb),'settings',COALESCE((SELECT value FROM public.website_settings WHERE id=true),'{"displayName":"Work to Work","logo":"","favicon":"","primary":"","foreground":"","supportEmail":"","announcement":"","maintenance":false,"registrationEnabled":true}'::jsonb)) $$;
REVOKE ALL ON FUNCTION public.published_website() FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.published_website() TO anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION public.website_content_command(key_value text, content_value jsonb, action_value text, expected_revision integer, version_id uuid DEFAULT NULL) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE row_value public.website_content; new_content jsonb; BEGIN
IF NOT public.has_permission('content.manage') THEN RAISE EXCEPTION 'Content access denied'; END IF;
SELECT * INTO row_value FROM public.website_content WHERE key=key_value FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Page not found'; END IF;
IF row_value.revision<>expected_revision THEN RAISE EXCEPTION 'This page changed. Reload before saving.'; END IF;
IF action_value='draft' THEN UPDATE public.website_content SET draft=content_value,revision=revision+1,updated_at=now() WHERE key=key_value;
ELSIF action_value IN ('publish','restore') THEN
IF action_value='restore' THEN SELECT content INTO new_content FROM public.website_versions WHERE id=version_id AND key=key_value; IF NOT FOUND THEN RAISE EXCEPTION 'Version not found'; END IF; ELSE new_content:=content_value; END IF;
INSERT INTO public.website_versions(key,content,revision,actor_id) VALUES(key_value,new_content,row_value.revision+1,auth.uid());
UPDATE public.website_content SET published=new_content,draft=new_content,revision=revision+1,updated_at=now() WHERE key=key_value;
INSERT INTO public.security_audit(actor_id,action,details) VALUES(auth.uid(),'content.'||action_value,jsonb_build_object('page',key_value,'revision',row_value.revision+1,'version',version_id));
ELSE RAISE EXCEPTION 'Invalid action'; END IF; RETURN row_value.revision+1; END $$;
REVOKE ALL ON FUNCTION public.website_content_command(text,jsonb,text,integer,uuid) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.website_content_command(text,jsonb,text,integer,uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.website_settings_command(settings_value jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE previous jsonb; BEGIN
IF NOT public.has_permission('site.manage') THEN RAISE EXCEPTION 'Owner access required'; END IF;
IF jsonb_typeof(settings_value)<>'object' OR jsonb_typeof(settings_value->'maintenance')<>'boolean' OR jsonb_typeof(settings_value->'registrationEnabled')<>'boolean' THEN RAISE EXCEPTION 'Invalid settings'; END IF;
IF EXISTS(SELECT 1 FROM jsonb_object_keys(settings_value) k WHERE k NOT IN ('displayName','logo','favicon','primary','foreground','supportEmail','announcement','maintenance','registrationEnabled')) THEN RAISE EXCEPTION 'Unknown setting'; END IF;
IF length(settings_value->>'displayName') NOT BETWEEN 1 AND 100 OR length(settings_value->>'announcement')>300 THEN RAISE EXCEPTION 'Invalid display text'; END IF;
IF COALESCE(settings_value->>'primary','')<>'' AND ((settings_value->>'primary') !~ '^#[0-9a-fA-F]{6}$') THEN RAISE EXCEPTION 'Invalid colour'; END IF;
IF COALESCE(settings_value->>'foreground','')<>'' AND ((settings_value->>'foreground') !~ '^#[0-9a-fA-F]{6}$') THEN RAISE EXCEPTION 'Invalid colour'; END IF;
IF COALESCE(settings_value->>'supportEmail','')<>'' AND (settings_value->>'supportEmail') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Invalid email'; END IF;
IF EXISTS(SELECT 1 FROM unnest(ARRAY['logo','favicon']) k WHERE COALESCE(settings_value->>k,'')<>'' AND (settings_value->>k) !~ '^brand/[0-9a-f-]+\.(png|jpg|webp)$') THEN RAISE EXCEPTION 'Use a validated brand upload'; END IF;
SELECT value INTO previous FROM public.website_settings WHERE id=true FOR UPDATE;
INSERT INTO public.website_settings(id,value) VALUES(true,settings_value) ON CONFLICT(id) DO UPDATE SET value=excluded.value,updated_at=now();
INSERT INTO public.security_audit(actor_id,action,details) VALUES(auth.uid(),'site.settings',jsonb_build_object('changed',COALESCE((SELECT jsonb_agg(k) FROM jsonb_object_keys(settings_value) k WHERE previous->k IS DISTINCT FROM settings_value->k),'[]'::jsonb))); END $$;
REVOKE ALL ON FUNCTION public.website_settings_command(jsonb) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.website_settings_command(jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.create_account_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF EXISTS(SELECT 1 FROM public.website_settings WHERE id=true AND value->>'registrationEnabled'='false') THEN RAISE EXCEPTION 'Registration is currently closed'; END IF;
INSERT INTO public.profiles(id,name) VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'name','')); RETURN NEW; END $$;