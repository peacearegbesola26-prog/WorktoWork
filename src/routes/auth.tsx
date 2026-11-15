import { createFileRoute } from "@tanstack/react-router";
import { AccountAuthPage } from "@/features/account/auth-page";
import { safeNext } from "@/features/account/navigation";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({ next: safeNext(search["next"]) }),
  head: () => pageHead("Account sign in", "Sign in to your private Work to Work account."),
  component: Page,
});
function Page() {
  const { next } = Route.useSearch();
  return <AccountAuthPage kind="login" next={next} />;
}
