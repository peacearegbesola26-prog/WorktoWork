import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/work/landing";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Find Your Next Opportunity. Everywhere.",
      "Work to Work provides private profiles, application tracking, saved resumes and AI resume suggestions for freelancers. Live discovery is not connected yet.",
    ),
  component: Landing,
});
