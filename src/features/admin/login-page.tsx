import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/work/shared";
import { supabase } from "@/integrations/supabase/client";
import { useAccountAuth } from "@/features/account/auth";
import { adminAccess } from "./admin.functions";
export function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const { user, loading } = useAccountAuth();
  const check = useServerFn(adminAccess);
  const navigate = useNavigate();
  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    void check()
      .then((allowed) => {
        if (cancelled) return;
        if (allowed) void navigate({ to: "/admin", replace: true });
        else setDenied(true);
      })
      .catch(() => {
        if (!cancelled) setDenied(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, loading, check, navigate]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setDenied(false);
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error || !(await check())) {
        setDenied(true);
        return;
      }
      await navigate({ to: "/admin", replace: true });
    } catch {
      setDenied(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-section min-h-screen">
      <div className="auth-wrap">
        <div className="flex items-center gap-3 text-primary">
          <ShieldCheck />
          <span>Work to Work</span>
        </div>
        <h1>Staff login</h1>
        <p>Control panel</p>
        <form className="auth-form" onSubmit={submit}>
          <Field label="Email address">
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button disabled={busy || loading}>{busy ? "Checking access…" : "Log in"}</Button>
        </form>
        {denied && (
          <p role="alert" className="error-inline mt-4">
            Access denied.
          </p>
        )}
        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/app/dashboard">Your workspace</Link>
        </div>
      </div>
    </main>
  );
}
