CREATE OR REPLACE FUNCTION public.has_permission(p text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND (role='owner' OR (role='admin' AND p IN ('admin.access','opportunities.manage','sources.manage','audit.read','ai.manage')) OR (role='moderator' AND p IN ('admin.access','opportunities.manage')))) $$;
REVOKE ALL ON FUNCTION public.has_permission(text) FROM PUBLIC, anon; GRANT EXECUTE ON FUNCTION public.has_permission(text) TO authenticated,service_role;
CREATE TABLE public.security_audit(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor_id uuid, target_id uuid, action text NOT NULL, details jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.security_audit TO authenticated; GRANT ALL ON public.security_audit TO service_role;
ALTER TABLE public.security_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY security_audit_staff ON public.security_audit FOR SELECT TO authenticated USING(public.has_permission('audit.read'));
CREATE OR REPLACE FUNCTION public.guard_staff_role() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
PERFORM pg_advisory_xact_lock(824711);
IF TG_OP IN ('UPDATE','DELETE') AND OLD.role='owner' AND (TG_OP='DELETE' OR NEW.role <> 'owner' OR NEW.user_id<>OLD.user_id) THEN
 IF (SELECT count(*) FROM public.user_roles WHERE role='owner')<=1 THEN RAISE EXCEPTION 'The last owner cannot be removed or demoted'; END IF;
END IF;
IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW; END $$;
CREATE TRIGGER guard_staff_role BEFORE UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.guard_staff_role();
CREATE OR REPLACE FUNCTION public.audit_staff_role() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
INSERT INTO public.security_audit(actor_id,target_id,action,details) VALUES(auth.uid(),COALESCE(NEW.user_id,OLD.user_id),'role.'||lower(TG_OP),jsonb_build_object('before',CASE WHEN TG_OP<>'INSERT' THEN OLD.role::text END,'after',CASE WHEN TG_OP<>'DELETE' THEN NEW.role::text END));
IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW; END $$;
CREATE TRIGGER audit_staff_role AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.audit_staff_role();
CREATE OR REPLACE FUNCTION public.set_staff_role(target uuid,new_role public.app_role,grant_role boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
PERFORM pg_advisory_xact_lock(824711);
IF NOT public.has_role(auth.uid(),'owner') THEN RAISE EXCEPTION 'Owner access required'; END IF;
IF new_role NOT IN ('owner','admin','moderator') THEN RAISE EXCEPTION 'Invalid staff role'; END IF;
IF grant_role THEN
 IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id=target AND email_confirmed_at IS NOT NULL) THEN RAISE EXCEPTION 'Choose a verified account'; END IF;
 INSERT INTO public.user_roles(user_id,role) VALUES(target,new_role) ON CONFLICT(user_id,role) DO NOTHING;
ELSE DELETE FROM public.user_roles WHERE user_id=target AND role=new_role; END IF; END $$;
REVOKE ALL ON FUNCTION public.set_staff_role(uuid,public.app_role,boolean) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.set_staff_role(uuid,public.app_role,boolean) TO authenticated;
CREATE OR REPLACE FUNCTION public.staff_directory() RETURNS TABLE(user_id uuid,email text,role public.app_role) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF NOT public.has_role(auth.uid(),'owner') THEN RAISE EXCEPTION 'Owner access required'; END IF;
RETURN QUERY SELECT r.user_id,u.email::text,r.role FROM public.user_roles r JOIN auth.users u ON u.id=r.user_id WHERE r.role IN ('owner','admin','moderator'); END $$;
REVOKE ALL ON FUNCTION public.staff_directory() FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.staff_directory() TO authenticated;
CREATE OR REPLACE FUNCTION public.verified_staff_target(address text) RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ DECLARE target uuid; BEGIN
IF NOT public.has_role(auth.uid(),'owner') THEN RAISE EXCEPTION 'Owner access required'; END IF;
SELECT id INTO target FROM auth.users WHERE lower(email)=lower(trim(address)) AND email_confirmed_at IS NOT NULL;
IF target IS NULL THEN RAISE EXCEPTION 'Verified account not found'; END IF; RETURN target; END $$;
REVOKE ALL ON FUNCTION public.verified_staff_target(text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.verified_staff_target(text) TO authenticated;
ALTER POLICY opportunities_admin ON public.opportunities USING(public.has_permission('opportunities.manage')) WITH CHECK(public.has_permission('opportunities.manage'));
ALTER POLICY opportunities_read ON public.opportunities USING(public.opportunity_is_active(opportunities.*) OR public.has_permission('opportunities.manage'));
ALTER POLICY sources_admin ON public.sources USING(public.has_permission('sources.manage')) WITH CHECK(public.has_permission('sources.manage'));
ALTER POLICY sources_read ON public.sources USING(enabled OR public.has_permission('admin.access'));
ALTER POLICY audit_admin_read ON public.admin_audit USING(public.has_permission('audit.read'));
CREATE TABLE public.ai_controls(scope text PRIMARY KEY DEFAULT 'resume', enabled boolean NOT NULL DEFAULT true,daily_limit integer NOT NULL DEFAULT 20 CHECK(daily_limit BETWEEN 0 AND 1000),input_limit integer NOT NULL DEFAULT 50000 CHECK(input_limit BETWEEN 1 AND 200000),updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE ON public.ai_controls TO authenticated; GRANT ALL ON public.ai_controls TO service_role;
ALTER TABLE public.ai_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_control_read ON public.ai_controls FOR SELECT TO authenticated USING(public.has_permission('ai.manage'));
CREATE POLICY ai_control_insert ON public.ai_controls FOR INSERT TO authenticated WITH CHECK(public.has_permission('ai.manage') AND scope='resume');
CREATE POLICY ai_control_update ON public.ai_controls FOR UPDATE TO authenticated USING(public.has_permission('ai.manage')) WITH CHECK(public.has_permission('ai.manage') AND scope='resume');
CREATE TABLE public.ai_usage(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL,mode text NOT NULL,status text NOT NULL DEFAULT 'processing',created_at timestamptz NOT NULL DEFAULT now(),finished_at timestamptz);
GRANT SELECT ON public.ai_usage TO authenticated; GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_read ON public.ai_usage FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_permission('ai.manage'));
CREATE OR REPLACE FUNCTION public.reserve_resume_ai(mode_value text,input_length integer) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE settings public.ai_controls; request_id uuid; BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
SELECT * INTO settings FROM public.ai_controls WHERE scope='resume';
IF COALESCE(settings.enabled,true)=false THEN RAISE EXCEPTION 'Resume AI is disabled by administration'; END IF;
IF input_length>COALESCE(settings.input_limit,50000) THEN RAISE EXCEPTION 'Resume exceeds the AI input size limit'; END IF;
IF (SELECT count(*) FROM public.ai_usage WHERE user_id=auth.uid() AND created_at>=date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')>=COALESCE(settings.daily_limit,20) THEN RAISE EXCEPTION 'Daily AI request limit reached'; END IF;
IF mode_value NOT IN ('summary','experience','achievements','feedback') THEN RAISE EXCEPTION 'Invalid AI request'; END IF;
INSERT INTO public.ai_usage(user_id,mode) VALUES(auth.uid(),mode_value) RETURNING id INTO request_id; RETURN request_id; END $$;
REVOKE ALL ON FUNCTION public.reserve_resume_ai(text,integer) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.reserve_resume_ai(text,integer) TO authenticated;
CREATE OR REPLACE FUNCTION public.finish_resume_ai(request_id uuid,request_status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF request_status NOT IN ('completed','error') THEN RAISE EXCEPTION 'Invalid status'; END IF;
UPDATE public.ai_usage SET status=request_status,finished_at=now() WHERE id=request_id AND user_id=auth.uid() AND status='processing'; END $$;
REVOKE ALL ON FUNCTION public.finish_resume_ai(uuid,text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.finish_resume_ai(uuid,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.audit_ai_controls() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
NEW.updated_at=now(); INSERT INTO public.security_audit(actor_id,action,details) VALUES(auth.uid(),'ai.settings',jsonb_build_object('enabled',NEW.enabled,'daily_limit',NEW.daily_limit,'input_limit',NEW.input_limit)); RETURN NEW; END $$;
CREATE TRIGGER audit_ai_controls BEFORE INSERT OR UPDATE ON public.ai_controls FOR EACH ROW EXECUTE FUNCTION public.audit_ai_controls();