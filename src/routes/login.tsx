import { createFileRoute } from "@tanstack/react-router";
import { AccountAuthPage } from "@/features/account/auth-page";
import { pageHead } from "@/lib/page-head";
import { safeNext } from "@/features/account/navigation";
export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({ next: safeNext(search["next"]) }),
  head: () => pageHead("Log In", "Sign in to your private Work to Work account."),
  component: Page,
});
function Page() {
  return <AccountAuthPage kind="login" next={Route.useSearch().next} />;
}
