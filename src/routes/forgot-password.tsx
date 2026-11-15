import { createFileRoute } from "@tanstack/react-router";
import { AccountAuthPage } from "@/features/account/auth-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/forgot-password")({
  head: () => pageHead("Password Reset", "Request a secure password reset email for Work to Work."),
  component: Page,
});
function Page() {
  return <AccountAuthPage kind="forgot" />;
}
