import { pageHead } from "@/lib/page-head";
import type { WebsitePage, SiteSettings } from "./schema";
export function websiteHead(
  data: { pages: Record<string, WebsitePage>; settings: SiteSettings } | undefined,
  key: string,
) {
  const page = data?.pages[key];
  const title = page?.title ?? "Work to Work";
  const description = page?.description ?? "Opportunity discovery and career preparation.";
  const result = pageHead(title, description);
  if (data?.settings.displayName && data.settings.displayName !== "Work to Work") {
    result.meta = result.meta.map((meta) =>
      "title" in meta
        ? { title: `${title} | ${data.settings.displayName}` }
        : "property" in meta && meta.property === "og:title"
          ? { ...meta, content: `${title} | ${data.settings.displayName}` }
          : meta,
    );
  }
  return result;
}
