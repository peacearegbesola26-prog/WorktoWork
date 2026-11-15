import { createFileRoute } from "@tanstack/react-router";
import { websiteEditorOptions } from "@/features/website/query";
import { ContentEditor } from "@/features/website/content-page";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/admin/content")({
  loader: ({ context }) => context.queryClient.ensureQueryData(websiteEditorOptions),
  head: () =>
    pageHead("Website content", "Work to Work private website drafts and publication history."),
  component: ContentEditor,
});
