import { createFileRoute } from "@tanstack/react-router";
import { AccountAuthPage } from "@/features/account/auth-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/signup")({
  head: () => pageHead("Sign Up", "Create your Work to Work account and verify your email."),
  component: Page,
});
function Page() {
  return <AccountAuthPage kind="signup" />;
}
