import { describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ server: vi.fn(), auth: {} }));
vi.mock("@tanstack/react-start", () => ({
  createMiddleware: () => ({ middleware: () => ({ server: mocks.server }) }),
}));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: mocks.auth }));
import "./staff-auth";
describe("privileged operation access", () => {
  it.each([false, null])(
    "denies revoked or suspended staff when permission is %s",
    async (data) => {
      const rpc = vi.fn().mockResolvedValue({ data, error: null });
      const next = vi.fn();
      await expect(
        mocks.server.mock.calls[0]?.[0]({ context: { supabase: { rpc } }, next }),
      ).rejects.toThrow("Access denied.");
      expect(rpc).toHaveBeenCalledWith("has_permission", { p: "admin.access" });
      expect(next).not.toHaveBeenCalled();
    },
  );
  it("rechecks permissions on every operation rather than trusting a prior session", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: false, error: null });
    const next = vi.fn();
    const operation = mocks.server.mock.calls[0]?.[0];
    await operation({ context: { supabase: { rpc } }, next });
    await expect(operation({ context: { supabase: { rpc } }, next })).rejects.toThrow(
      "Access denied.",
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledTimes(2);
  });
});
