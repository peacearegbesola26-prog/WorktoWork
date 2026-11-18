import { getRouteApi, createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeading, EmptyState, StatusBadge } from "@/components/work/shared";
import { SECTIONS, isSection } from "@/features/marketplace/sections";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/_authenticated/app/$section")({
  beforeLoad: ({ params }) => {
    if (!isSection(params.section)) throw notFound();
  },
  head: ({ params }) =>
    pageHead(isSection(params.section) ? SECTIONS[params.section].title : "Not found", "Work to Work marketplace."),
  component: Page,
});
function Page() {
  const { section } = getRouteApi("/_authenticated/app/$section").useParams();
  if (!isSection(section)) return null;
  const s = SECTIONS[section];
  return (
    <>
      <PageHeading title={s.title} description={s.text} action={<StatusBadge>{s.stage.startsWith("Payments") ? "Not connected" : "Coming soon"}</StatusBadge>} />
      <EmptyState title="Nothing here yet" description={s.stage} />
    </>
  );
}
