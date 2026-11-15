import { queryOptions } from "@tanstack/react-query";
import { getPublishedWebsite, getWebsiteEditor } from "./website.functions";
export const publishedWebsiteOptions = queryOptions({
  queryKey: ["published-website"],
  queryFn: () => getPublishedWebsite(),
  staleTime: 0,
});
export const websiteEditorOptions = queryOptions({
  queryKey: ["website-editor"],
  queryFn: () => getWebsiteEditor(),
  staleTime: 0,
});
