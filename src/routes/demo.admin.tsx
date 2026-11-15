import { createFileRoute } from "@tanstack/react-router";
import { Admin } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/admin")({
  head: () =>
    pageHead(
      "Read-only Admin Preview",
      "Public read-only administration demonstration with fictional data.",
    ),
  component: Page,
});
function Page() {
  return <Admin />;
}
