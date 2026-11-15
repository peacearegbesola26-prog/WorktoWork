import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const requireActiveAccount = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ context, next }) => {
    const result = await context.supabase.rpc("assert_active_account");
    if (result.error) throw new Error("Your account is suspended. Contact support.");
    return next();
  });
