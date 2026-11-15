import { createFileRoute } from "@tanstack/react-router";
import { AITool } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/resume-optimizer")({
  head: () =>
    pageHead("Resume Optimizer", "Preview resume optimisation requiring an AI connection."),
  component: Page,
});
function Page() {
  return <AITool kind="resume" />;
}
