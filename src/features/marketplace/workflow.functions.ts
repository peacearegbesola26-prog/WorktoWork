import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActiveAccount } from "@/features/account/active-auth";
import { requireBuyerAccount, requireSellerAccount } from "@/features/jobs/guard";
import { messageSchema, offerSchema } from "./workflow-schema";

export const getMarketplace = createServerFn({ method: "GET" })
  .middleware([requireActiveAccount])
  .handler(async ({ context }) => {
    const s = context.supabase;
    const [conversations, messages, reads, contracts, milestones, notifications, applications] = await Promise.all([
      s.from("marketplace_conversations").select("*").order("created_at", { ascending: false }),
      s.from("marketplace_messages").select("*").order("created_at", { ascending: true }),
      s.from("marketplace_reads").select("*"),
      s.from("marketplace_contracts").select("*").order("created_at", { ascending: false }),
      s.from("marketplace_milestones").select("*").order("position"),
      s.from("marketplace_notifications").select("*").order("created_at", { ascending: false }),
      s.from("job_applications").select("id,status,seller_name,job_id,jobs(title)").not("status", "in", "(withdrawn,rejected)"),
    ]);
    if ([conversations, messages, reads, contracts, milestones, notifications, applications].some(r => r.error))
      throw new Error("Your marketplace could not be loaded. Please try again.");
    return {
      userId: context.userId, conversations: conversations.data ?? [], messages: messages.data ?? [],
      reads: reads.data ?? [], contracts: contracts.data ?? [], milestones: milestones.data ?? [],
      notifications: notifications.data ?? [], applications: applications.data ?? [],
    };
  });
export const openConversation = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount]).inputValidator(v => z.string().uuid().parse(v))
  .handler(async ({ data, context }) => {
    const r = await context.supabase.rpc("open_marketplace_conversation", { application_value: data });
    if (r.error) throw new Error("This application cannot start a conversation. It may be withdrawn or unavailable.");
    return r.data;
  });
export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount]).inputValidator(v => messageSchema.parse(v))
  .handler(async ({ data, context }) => {
    const r = await context.supabase.rpc("send_marketplace_message", {
      conversation_value: data.conversation, request_value: data.request, body_value: data.body,
      ...(data.attachment ? { attachment_value: data.attachment } : {}),
      ...(data.name ? { name_value: data.name } : {}),
    });
    if (r.error) throw new Error("Message not sent. Your text is kept; check your connection and try again.");
    return r.data;
  });
export const markConversationRead = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount])
  .inputValidator(v => z.object({ conversation: z.string().uuid(), through: z.string().datetime({ offset: true }) }).parse(v))
  .handler(async ({ data, context }) => {
    const r = await context.supabase.rpc("read_marketplace_conversation", { conversation_value: data.conversation, through_value: data.through });
    if (r.error) throw new Error("Unread status could not be updated.");
  });
export const createOffer = createServerFn({ method: "POST" })
  .middleware([requireBuyerAccount]).inputValidator(v => offerSchema.parse(v))
  .handler(async ({ data, context }) => {
    const r = await context.supabase.rpc("create_marketplace_offer", { conversation_value: data.conversation, terms_value: data.terms, milestones_value: data.milestones });
    if (r.error) throw new Error("Offer not sent. Check the terms and milestones, then try again.");
    return r.data;
  });
export const respondOffer = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount])
  .inputValidator(v => z.object({ contract: z.string().uuid(), action: z.enum(["accept", "decline", "cancel"]) }).parse(v))
  .handler(async ({ data, context }) => {
    const r = await context.supabase.rpc("respond_marketplace_offer", { contract_value: data.contract, action_value: data.action });
    if (r.error) throw new Error("This offer could not be updated. It may already have been resolved.");
  });
export const markNotification = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount]).inputValidator(v => z.string().uuid().parse(v))
  .handler(async ({ data, context }) => {
    const r = await context.supabase.rpc("mark_marketplace_notification", { notification_value: data });
    if (r.error) throw new Error("Notification could not be marked read.");
  });
export const submitDelivery = createServerFn({ method: "POST" })
  .middleware([requireSellerAccount]).inputValidator(v => z.string().uuid().parse(v))
  .handler(async ({ data, context }) => {
    const r = await context.supabase.from("marketplace_contracts").select("id").eq("id", data).eq("seller_id", context.userId).maybeSingle();
    if (r.error || !r.data) throw new Error("Contract unavailable.");
    throw new Error("Delivery is disabled: this contract is not funded and no payment provider is connected.");
  });