import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/work/landing";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Find Your Next Opportunity. Everywhere.",
      "Work to Work helps freelancers discover opportunities across supported sources and prepare stronger applications. Explore the frontend demo.",
    ),
  component: Landing,
});
