import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/work/public-pages";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/forgot-password")({
  head: () => pageHead("Password Reset", "Preview the Work to Work password reset form."),
  component: Page,
});
function Page() {
  return <AuthPage kind="forgot" />;
}
