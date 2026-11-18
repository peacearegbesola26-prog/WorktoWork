CREATE TABLE public.marketplace_accounts(
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_type text NOT NULL CHECK (account_type IN ('seller','buyer')),
  chosen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.marketplace_accounts TO authenticated;
GRANT ALL ON public.marketplace_accounts TO service_role;
ALTER TABLE public.marketplace_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY active_account_required ON public.marketplace_accounts AS RESTRICTIVE FOR ALL TO authenticated USING (public.account_is_active()) WITH CHECK (public.account_is_active());
CREATE POLICY marketplace_read ON public.marketplace_accounts FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR public.has_permission('users.manage'));

CREATE OR REPLACE FUNCTION public.current_account_type() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT account_type FROM public.marketplace_accounts WHERE user_id = auth.uid() $$;
CREATE OR REPLACE FUNCTION public.is_seller() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT COALESCE(public.current_account_type() = 'seller', false) $$;

CREATE OR REPLACE FUNCTION public.choose_account_type(type_value text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  PERFORM public.assert_active_account();
  IF type_value NOT IN ('seller','buyer') THEN RAISE EXCEPTION 'Invalid account type'; END IF;
  IF EXISTS (SELECT 1 FROM public.marketplace_accounts WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Account type already chosen. Contact support for a correction.';
  END IF;
  INSERT INTO public.marketplace_accounts(user_id, account_type) VALUES (auth.uid(), type_value);
  INSERT INTO public.security_audit(actor_id, target_id, action, details) VALUES (auth.uid(), auth.uid(), 'account_type.chosen', jsonb_build_object('type', type_value));
END $$;
REVOKE ALL ON FUNCTION public.choose_account_type(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.choose_account_type(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.correct_account_type(target uuid, type_value text, reason_value text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old_type text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'owner') OR NOT public.account_is_active() THEN RAISE EXCEPTION 'Not permitted'; END IF;
  IF type_value NOT IN ('seller','buyer') THEN RAISE EXCEPTION 'Invalid account type'; END IF;
  IF length(trim(coalesce(reason_value,''))) < 5 THEN RAISE EXCEPTION 'A reason is required'; END IF;
  -- Safeguard: when contracts exist, corrections must be blocked while any contract is active.
  IF to_regclass('public.contracts') IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.marketplace_active_contract_users() u WHERE u = target) THEN
      RAISE EXCEPTION 'Account has active contracts';
    END IF;
  END IF;
  SELECT account_type INTO old_type FROM public.marketplace_accounts WHERE user_id = target FOR UPDATE;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target) THEN RAISE EXCEPTION 'Account not found'; END IF;
  INSERT INTO public.marketplace_accounts(user_id, account_type) VALUES (target, type_value)
    ON CONFLICT (user_id) DO UPDATE SET account_type = EXCLUDED.account_type, updated_at = now();
  INSERT INTO public.security_audit(actor_id, target_id, action, details)
    VALUES (auth.uid(), target, 'account_type.corrected', jsonb_build_object('from', old_type, 'to', type_value, 'reason', reason_value));
END $$;
REVOKE ALL ON FUNCTION public.correct_account_type(uuid, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.correct_account_type(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_account_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
IF EXISTS(SELECT 1 FROM public.website_settings WHERE id=true AND value->>'registrationEnabled'='false') THEN RAISE EXCEPTION 'Registration is currently closed'; END IF;
INSERT INTO public.profiles(id,name) VALUES(NEW.id,COALESCE(NEW.raw_user_meta_data->>'name',''));
IF NEW.raw_user_meta_data->>'account_type' IN ('seller','buyer') THEN
  INSERT INTO public.marketplace_accounts(user_id, account_type) VALUES (NEW.id, NEW.raw_user_meta_data->>'account_type');
END IF;
RETURN NEW; END $$;

CREATE POLICY seller_only ON public.resumes AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_seller()) WITH CHECK (public.is_seller());
CREATE POLICY seller_only ON public.saved_opportunities AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_seller()) WITH CHECK (public.is_seller());
CREATE POLICY seller_only ON public.tracked_applications AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_seller()) WITH CHECK (public.is_seller());
CREATE POLICY seller_only ON public.alert_preferences AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_seller()) WITH CHECK (public.is_seller());