import { createFileRoute } from "@tanstack/react-router";
import { HowItWorks } from "@/components/work/public-pages";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/how-it-works")({
  head: () => pageHead("How It Works", "Understand opportunity discovery and career preparation."),
  component: Page,
});
function Page() {
  return <HowItWorks />;
}
