CREATE OR REPLACE FUNCTION public.validate_website_settings() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ DECLARE k text; v text; BEGIN
IF jsonb_typeof(NEW.value)<>'object' OR (SELECT count(*) FROM jsonb_object_keys(NEW.value))<>9 THEN RAISE EXCEPTION 'Complete website settings required'; END IF;
FOREACH k IN ARRAY ARRAY['displayName','logo','favicon','primary','foreground','supportEmail','announcement'] LOOP IF jsonb_typeof(NEW.value->k) IS DISTINCT FROM 'string' THEN RAISE EXCEPTION 'Invalid settings field'; END IF; END LOOP;
FOREACH k IN ARRAY ARRAY['maintenance','registrationEnabled'] LOOP IF jsonb_typeof(NEW.value->k) IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'Invalid operating setting'; END IF; END LOOP;
FOREACH k IN ARRAY ARRAY['logo','favicon'] LOOP v:=NEW.value->>k; IF v<>'' AND NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='website-brand' AND name=v) THEN RAISE EXCEPTION 'Brand image not found'; END IF; END LOOP;
RETURN NEW; END $$;
CREATE TRIGGER validate_website_settings BEFORE INSERT OR UPDATE ON public.website_settings FOR EACH ROW EXECUTE FUNCTION public.validate_website_settings();