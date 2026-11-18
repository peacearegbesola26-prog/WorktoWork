CREATE OR REPLACE FUNCTION public.reserve_resume_ai(mode_value text, input_length integer) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE settings public.ai_controls; request_id uuid; BEGIN
PERFORM public.assert_active_account();
IF NOT public.website_available() THEN RAISE EXCEPTION 'Maintenance in progress'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
SELECT * INTO settings FROM public.ai_controls WHERE scope='resume';
IF COALESCE(settings.enabled,true)=false THEN RAISE EXCEPTION 'Resume AI is disabled by administration'; END IF;
IF input_length<0 OR input_length>COALESCE(settings.input_limit,50000) THEN RAISE EXCEPTION 'Resume exceeds the AI input size limit'; END IF;
IF (SELECT count(*) FROM public.ai_usage WHERE user_id=auth.uid() AND created_at>=date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')>=COALESCE(settings.daily_limit,20) THEN RAISE EXCEPTION 'Daily AI request limit reached'; END IF;
IF mode_value NOT IN ('summary','experience','achievements','feedback') THEN RAISE EXCEPTION 'Invalid AI request'; END IF;
INSERT INTO public.ai_usage(user_id,mode) VALUES(auth.uid(),mode_value) RETURNING id INTO request_id; RETURN request_id; END $$;