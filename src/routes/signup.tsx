import { createFileRoute } from "@tanstack/react-router";
import { AccountAuthPage } from "@/features/account/auth-page";
import { pageHead } from "@/lib/page-head";
import { safeNext } from "@/features/account/navigation";
export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>) => ({ next: safeNext(search["next"]) }),
  head: () => pageHead("Sign Up", "Create your Work to Work account and verify your email."),
  component: Page,
});
function Page() {
  return <AccountAuthPage kind="signup" next={Route.useSearch().next} />;
}
