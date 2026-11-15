import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/public/brand/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const url = process.env["SUPABASE_URL"],
          key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return new Response(null, { status: 503 });
        const { readPublishedWebsite } = await import("@/features/website/public.server");
        const { settings } = await readPublishedWebsite(url, key);
        const path = `brand/${params.name}`;
        if (
          !/^brand\/[0-9a-f-]+\.(png|jpg|webp)$/.test(path) ||
          ![settings.logo, settings.favicon].includes(path)
        )
          return new Response(null, { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const result = await supabaseAdmin.storage.from("website-brand").download(path);
        if (result.error || !result.data) return new Response(null, { status: 404 });
        return new Response(result.data, {
          headers: {
            "Content-Type": result.data.type,
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-store",
            "Content-Security-Policy": "default-src 'none'",
          },
        });
      },
    },
  },
});
