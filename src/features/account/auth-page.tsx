import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PublicShell, Field } from "@/components/work/shared";
import { supabase } from "@/integrations/supabase/client";
import { useAccountAuth } from "./auth";
import { safeNext } from "./navigation";
import { useWebsite } from "@/features/website/context";
import { ACCOUNT_TYPES, type AccountType } from "@/features/marketplace/account-type";
export function AccountAuthPage({
  kind,
  next = "/app/dashboard",
}: {
  kind: "login" | "signup" | "verification" | "forgot" | "reset";
  next?: string;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);
  const { user, loading, recovery: sessionRecovery } = useAccountAuth();
  const navigate = useNavigate();
  const destination = safeNext(next);
  const { settings } = useWebsite();
  function verificationUrl() {
    const url = new URL("/email-verification", window.location.origin);
    url.searchParams.set("next", destination);
    return url.toString();
  }
  useEffect(() => {
    if (kind === "reset") {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      setRecovery(hash.get("type") === "recovery" || sessionRecovery);
      if (hash.get("error_description"))
        setError(hash.get("error_description") ?? "This link is invalid or expired.");
    }
    if (kind === "verification") {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      if (hash.get("error_description"))
        setError("This verification link is invalid or expired. Request a new email below.");
    }
  }, [kind, sessionRecovery]);
  useEffect(() => {
    if (!loading && user && (kind === "login" || kind === "signup"))
      void navigate({ to: safeNext(next), replace: true });
  }, [user, loading, kind, navigate, next]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    if ((kind === "signup" || kind === "reset") && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      if (kind === "login") {
        const r = await supabase.auth.signInWithPassword({ email, password });
        if (r.error) throw r.error;
        await navigate({ to: safeNext(next), replace: true });
      }
      if (kind === "signup") {
        if (!settings.registrationEnabled) throw new Error("Registration is currently closed.");
        if (!accountType) throw new Error("Choose whether you want to find work or hire talent.");
        const r = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, account_type: accountType },
            emailRedirectTo: verificationUrl(),
          },
        });
        if (r.error) throw r.error;
        setPassword("");
        setConfirm("");
        setMessage("Check your email and click the confirmation link before logging in.");
      }
      if (kind === "forgot") {
        const r = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (r.error) throw r.error;
        setMessage(
          "If an account exists for that address, a password reset email has been requested. Check your inbox and spam folder.",
        );
      }
      if (kind === "verification") {
        const r = await supabase.auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo: verificationUrl() },
        });
        if (r.error) throw r.error;
        setMessage("A verification email has been requested. Check your inbox and spam folder.");
      }
      if (kind === "reset") {
        if (!recovery || !user)
          throw new Error("Open the password reset link from your email first.");
        const r = await supabase.auth.updateUser({ password });
        if (r.error) throw r.error;
        setPassword("");
        setConfirm("");
        setRecovery(false);
        setMessage("Your password has been updated. You can return to your workspace.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "This request failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const title = {
    login: "Welcome back.",
    signup: "Your next chapter starts here.",
    verification: "Verify your email.",
    forgot: "Forgot your password?",
    reset: "Set a new password.",
  }[kind];
  return (
    <PublicShell>
      <section className="auth-section">
        <div className="auth-wrap">
          <h1>{title}</h1>
          <p>
            {kind === "verification"
              ? "Confirm your email to activate your account."
              : kind === "forgot"
                ? "We’ll email you a secure password reset link."
                : kind === "reset"
                  ? "Choose a new password for your account."
                  : "Your private opportunity workspace."}
          </p>
          {kind === "verification" && user && !error ? (
            <>
              <p role="status" className="text-success">
                Your email is verified.
              </p>
              <Button asChild>
                <Link to={destination}>Open workspace</Link>
              </Button>
            </>
          ) : (
            <form className="auth-form" onSubmit={submit}>
              {kind === "signup" && (
                <fieldset className="grid gap-2" aria-label="Account type">
                  <legend className="font-medium mb-1">I want to</legend>
                  {ACCOUNT_TYPES.map((o) => (
                    <label key={o.value} className="flex items-start gap-2 rounded-md border p-3 cursor-pointer">
                      <input
                        type="radio"
                        name="account_type"
                        required
                        value={o.value}
                        checked={accountType === o.value}
                        onChange={() => setAccountType(o.value)}
                      />
                      <span>
                        <strong>{o.label}</strong>
                        <br />
                        <span className="text-muted-foreground text-sm">{o.description}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>
              )}
              {kind === "signup" && (
                <Field label="Full name">
                  <input
                    required
                    maxLength={200}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
              )}
              {kind !== "reset" && (
                <Field label="Email address">
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
              )}
              {(kind === "login" || kind === "signup" || kind === "reset") && (
                <Field label="Password" hint={kind === "login" ? "" : "Use at least 8 characters."}>
                  <input
                    required
                    type="password"
                    minLength={kind === "login" ? 1 : 8}
                    autoComplete={kind === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
              )}
              {(kind === "signup" || kind === "reset") && (
                <Field label="Confirm password">
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </Field>
              )}
              {kind === "reset" && !loading && !recovery && !message && (
                <p role="alert" className="error-inline">
                  Open a valid password reset link from your email.{" "}
                  <Link to="/forgot-password">Request a new link</Link>
                </p>
              )}
              <Button
                type="submit"
                disabled={
                  busy ||
                  loading ||
                  (kind === "signup" && !settings.registrationEnabled) ||
                  (kind === "reset" && (!recovery || !user))
                }
              >
                {busy
                  ? "Please wait…"
                  : loading
                    ? "Checking session…"
                    : {
                        login: "Log in",
                        signup: settings.registrationEnabled
                          ? "Create account"
                          : "Registration closed",
                        verification: "Resend verification email",
                        forgot: "Send reset link",
                        reset: "Update password",
                      }[kind]}
              </Button>
            </form>
          )}
          {error && (
            <p role="alert" className="error-inline mt-4">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="mt-4 text-success">
              {message}
            </p>
          )}
          <div className="auth-links">
            <Link to="/login" search={{ next: destination }}>
              Log in
            </Link>
            <Link to="/signup" search={{ next: destination }}>
              Create account
            </Link>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          {kind === "reset" && message && (
            <Button asChild>
              <Link to="/app/dashboard">Open workspace</Link>
            </Button>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
