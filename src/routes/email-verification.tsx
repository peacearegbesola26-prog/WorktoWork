import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/work/public-pages";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/email-verification")({
  head: () => pageHead("Email Verification", "Preview email verification for Work to Work."),
  component: Page,
});
function Page() {
  return <AuthPage kind="verification" />;
}
