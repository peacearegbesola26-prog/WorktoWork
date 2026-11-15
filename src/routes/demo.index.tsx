import { createFileRoute, Navigate } from "@tanstack/react-router";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/")({
  head: () => pageHead("Explore Demo", "Enter the Work to Work demonstration workspace."),
  component: Page,
});
function Page() {
  return <Navigate to="/demo/dashboard" />;
}
