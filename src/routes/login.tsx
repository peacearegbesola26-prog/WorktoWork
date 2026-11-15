import { createFileRoute } from "@tanstack/react-router";
import { AccountAuthPage } from "@/features/account/auth-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/login")({
  head: () => pageHead("Log In", "Sign in to your private Work to Work account."),
  component: Page,
});
function Page() {
  return <AccountAuthPage kind="login" />;
}
