import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/work/public-pages";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/signup")({
  head: () => pageHead("Sign Up", "Preview the Work to Work registration form."),
  component: Page,
});
function Page() {
  return <AuthPage kind="signup" />;
}
