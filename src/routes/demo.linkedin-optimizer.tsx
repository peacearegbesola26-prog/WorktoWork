import { createFileRoute } from "@tanstack/react-router";
import { AITool } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/linkedin-optimizer")({
  head: () =>
    pageHead(
      "LinkedIn Profile Optimizer",
      "Preview profile improvements requiring an AI connection.",
    ),
  component: Page,
});
function Page() {
  return <AITool kind="linkedin" />;
}
