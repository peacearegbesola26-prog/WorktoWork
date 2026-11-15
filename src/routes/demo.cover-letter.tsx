import { createFileRoute } from "@tanstack/react-router";
import { AITool } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/cover-letter")({
  head: () => pageHead("Cover Letter Generator", "Preview the planned AI cover letter tool."),
  component: Page,
});
function Page() {
  return <AITool kind="cover" />;
}
