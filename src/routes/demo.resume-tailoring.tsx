import { createFileRoute } from "@tanstack/react-router";
import { AITool } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/resume-tailoring")({
  head: () => pageHead("Resume Tailoring", "Preview opportunity-specific resume preparation."),
  component: Page,
});
function Page() {
  return <AITool kind="tailoring" />;
}
