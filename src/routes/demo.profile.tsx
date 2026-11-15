import { createFileRoute } from "@tanstack/react-router";
import { Profile } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/profile")({
  head: () => pageHead("Demo Profile", "Edit a fictional demonstration professional profile."),
  component: Page,
});
function Page() {
  return <Profile />;
}
