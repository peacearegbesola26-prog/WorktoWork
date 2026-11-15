import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/work/public-pages";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/login")({
  head: () => pageHead("Log In", "Preview the Work to Work login form."),
  component: Page,
});
function Page() {
  return <AuthPage kind="login" />;
}
