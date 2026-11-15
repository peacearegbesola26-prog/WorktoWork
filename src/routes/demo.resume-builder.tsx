import { createFileRoute } from "@tanstack/react-router";
import { ResumeBuilder } from "@/components/work/workspace";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/resume-builder")({
  head: () => pageHead("Resume Builder", "Edit a resume in memory with a live preview."),
  component: Page,
});
function Page() {
  return <ResumeBuilder />;
}
