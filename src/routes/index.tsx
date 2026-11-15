import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/work/landing";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Find Your Next Opportunity. Everywhere.",
      "Work to Work provides private profiles and application tracking for freelancers. Live discovery and AI tools are not connected yet.",
    ),
  component: Landing,
});
