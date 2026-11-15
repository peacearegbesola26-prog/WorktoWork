import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActiveAccount } from "@/features/account/active-auth";
export const userFilters = z.object({
  search: z.string().max(200),
  status: z.enum(["all", "active", "suspended", "verified", "unverified"]),
  page: z.number().int().min(1),
});
export const listAdminUsers = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount])
  .inputValidator(userFilters)
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("admin_users", {
      search_value: data.search,
      status_value: data.status,
      page_value: data.page,
    });
    if (result.error) throw new Error(result.error.message);
    return z
      .object({
        total: z.number(),
        users: z.array(
          z.object({
            id: z.string(),
            email: z.string(),
            verified: z.boolean(),
            suspended: z.boolean(),
            suspension_reason: z.string(),
            created_at: z.string(),
            roles: z.array(z.string()),
            saves: z.number(),
            applications: z.number(),
            ai_requests: z.number(),
          }),
        ),
      })
      .parse(result.data);
  });
export const suspendAccount = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      suspended: z.boolean(),
      reason: z.string().trim().min(1).max(1000),
    }),
  )
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc("set_account_suspension", {
      target: data.id,
      is_suspended: data.suspended,
      reason_value: data.reason,
    });
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });
