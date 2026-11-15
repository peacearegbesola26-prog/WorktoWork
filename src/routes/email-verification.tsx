import { createFileRoute } from "@tanstack/react-router";
import { AccountAuthPage } from "@/features/account/auth-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/email-verification")({
  head: () =>
    pageHead("Email Verification", "Verify your email to activate your Work to Work account."),
  component: Page,
});
function Page() {
  return <AccountAuthPage kind="verification" />;
}
