import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/work/shared";
import { supabase } from "@/integrations/supabase/client";
import { ACCOUNT_TYPES, type AccountType } from "@/features/marketplace/account-type";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/onboarding")({
  head: () =>
    pageHead("Choose your account type", "Tell Work to Work how you will use the marketplace."),
  component: Page,
});
function Page() {
  const [type, setType] = useState<AccountType | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function save() {
    if (!type) return;
    setBusy(true);
    setError("");
    const { error } = await supabase.rpc("choose_account_type", { type_value: type });
    setBusy(false);
    if (error)
      return setError(
        error.message.includes("already")
          ? error.message
          : "Your choice could not be saved. Please try again.",
      );
    await router.invalidate();
    await router.navigate({ to: "/app/dashboard", replace: true });
  }
  return (
    <section className="max-w-2xl">
      <PageHeading
        title="How will you use Work to Work?"
        description="Choose once. Your existing records are kept. Seller tools such as resumes, saved opportunities and the tracker are available to seller accounts only. A correction later requires the site owner."
      />
      <fieldset className="grid gap-3" aria-label="Account type">
        {ACCOUNT_TYPES.map((o) => (
          <label
            key={o.value}
            className={`flex gap-3 rounded-lg border p-4 cursor-pointer ${type === o.value ? "border-primary" : ""}`}
          >
            <input
              type="radio"
              name="account_type"
              value={o.value}
              checked={type === o.value}
              onChange={() => setType(o.value)}
            />
            <span>
              <strong>{o.label}</strong>
              <br />
              <span className="text-muted-foreground">{o.description}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {error && (
        <p role="alert" className="text-destructive mt-3">
          {error}
        </p>
      )}
      <Button className="mt-6" disabled={!type || busy} onClick={save}>
        {busy ? "Saving…" : "Continue"}
      </Button>
    </section>
  );
}
