import { createFileRoute } from "@tanstack/react-router";
import { websiteEditorOptions } from "@/features/website/query";
import { SiteSettingsPage } from "@/features/website/settings-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/admin/site-settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(websiteEditorOptions),
  head: () => pageHead("Site settings", "Work to Work owner brand and operating settings."),
  component: SiteSettingsPage,
});
