import { describe, expect, it } from "vitest";
import { canDeliver, messageSchema, offerSchema } from "./workflow-schema";
const id = "11111111-1111-4111-8111-111111111111";
describe("marketplace boundaries", () => {
  it("keeps paid work disabled after seller acceptance", () => {
    expect(canDeliver("accepted_unfunded")).toBe(false);
  });
  it("requires a durable request ID for retry-safe messages", () => {
    expect(messageSchema.safeParse({ conversation: id, body: "Hello" }).success).toBe(false);
    expect(messageSchema.parse({ conversation: id, request: id, body: "Hello" }).request).toBe(id);
  });
  it("requires positive milestone funding amounts", () => {
    expect(offerSchema.safeParse({ conversation: id, terms: "Design the agreed project pages", milestones: [{ title: "Design", amount: 0, due_date: "" }] }).success).toBe(false);
  });
});