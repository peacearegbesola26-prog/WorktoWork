import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const requireStaff = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ context, next }) => {
    const permission = await context.supabase.rpc("has_permission", { p: "admin.access" });
    if (permission.error || permission.data !== true) throw new Error("Access denied.");
    return next();
  });
