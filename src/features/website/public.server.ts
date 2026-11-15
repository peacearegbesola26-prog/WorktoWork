import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";
import { pageSchema, settingsSchema } from "./schema";
export async function readPublishedWebsite(url: string, key: string) {
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const result = await client.rpc("published_website");
  if (result.error) throw new Error("Website content could not be loaded.");
  return z.object({ pages: z.record(pageSchema), settings: settingsSchema }).parse(result.data);
}
