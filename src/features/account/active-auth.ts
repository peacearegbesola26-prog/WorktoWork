import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const requireActiveAccount = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ context, next }) => {
    const result = await context.supabase.rpc("assert_active_account");
    if (result.error) {
      // Only the database's own suspension check means the account is suspended; anything
      // else (network or database trouble) must not tell an active user they are suspended.
      const suspended = /suspended/i.test(result.error.message ?? "");
      throw new Error(
        suspended
          ? "Your account is suspended. Contact support."
          : "We could not confirm your account right now. Please try again.",
      );
    }
    return next();
  });
