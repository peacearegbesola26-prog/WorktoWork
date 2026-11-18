import { createMiddleware } from "@tanstack/react-start";
import { requireActiveAccount } from "@/features/account/active-auth";

/**
 * Marketplace actions are gated by the account type stored in the database, not
 * by which navigation item the person can see.
 */
const requireType = (type: "buyer" | "seller") =>
  createMiddleware({ type: "function" })
    .middleware([requireActiveAccount])
    .server(async ({ context, next }) => {
      const { data, error } = await context.supabase.rpc("current_account_type");
      if (error || data !== type)
        throw new Error(
          type === "buyer"
            ? "Only hiring (buyer) accounts can do this."
            : "Only seller accounts can do this.",
        );
      return next();
    });

export const requireBuyerAccount = requireType("buyer");
export const requireSellerAccount = requireType("seller");
