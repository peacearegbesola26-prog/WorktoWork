import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/demo/resume-builder")({
  head: () => pageHead("Workspace redirect", "Continue to your real Work to Work workspace."),
  beforeLoad: () => {
    throw redirect({ to: "/app/resume-builder", replace: true });
  },
});
