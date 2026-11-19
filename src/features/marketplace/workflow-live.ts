import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { marketplaceOptions } from "./workflow-query";

export function useMarketplaceLive() {
  const client = useQueryClient();
  useEffect(() => {
    const refresh = () => { void client.invalidateQueries({ queryKey: marketplaceOptions.queryKey }); };
    const channel = supabase.channel(`marketplace-${crypto.randomUUID()}`);
    for (const table of ["marketplace_messages", "marketplace_conversations", "marketplace_contracts", "marketplace_notifications"])
      channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    channel.subscribe();
    // Reconnect fallback also repairs counts if an event arrives while offline.
    const interval = window.setInterval(refresh, 5000);
    window.addEventListener("online", refresh);
    return () => { void supabase.removeChannel(channel); window.clearInterval(interval); window.removeEventListener("online", refresh); };
  }, [client]);
}