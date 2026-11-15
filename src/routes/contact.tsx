import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "@/components/work/public-pages";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/contact")({
  head: () => pageHead("Contact", "Contact Work to Work. Message delivery is not connected yet."),
  component: Page,
});
function Page() {
  return <Contact />;
}
