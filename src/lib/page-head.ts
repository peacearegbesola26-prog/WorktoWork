export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: title + " | Work to Work" },
      { name: "description", content: description },
      { property: "og:title", content: title + " | Work to Work" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
