import { createFileRoute } from "@tanstack/react-router";
import { AccountAuthPage } from "@/features/account/auth-page";
import { pageHead } from "@/lib/page-head";
import { safeNext } from "@/features/account/navigation";
export const Route = createFileRoute("/email-verification")({
  validateSearch: (search: Record<string, unknown>) => ({ next: safeNext(search["next"]) }),
  head: () =>
    pageHead("Email Verification", "Verify your email to activate your Work to Work account."),
  component: Page,
});
function Page() {
  return <AccountAuthPage kind="verification" next={Route.useSearch().next} />;
}
