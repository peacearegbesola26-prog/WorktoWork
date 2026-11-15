import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DemoProvider } from "./context";
import { useDemo } from "./use-demo";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
describe("Demo provider recovery", () => {
  it("keeps the application usable with malformed saved preferences", async () => {
    localStorage.setItem("wtw-demo-v1", "{broken");
    const { result } = renderHook(() => useDemo(), { wrapper: DemoProvider });
    await waitFor(() => expect(result.current.saved).toEqual(["op-1", "op-2", "op-3"]));
    act(() => result.current.toggleSaved("op-4"));
    expect(result.current.saved).toContain("op-4");
  });
  it("stays usable when browser storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Blocked");
    });
    const { result } = renderHook(() => useDemo(), { wrapper: DemoProvider });
    act(() => result.current.track("op-2"));
    expect(result.current.tracker["op-2"]).toBe("Saved");
  });
  it("ignores unknown sample IDs and untracked status updates", () => {
    const { result } = renderHook(() => useDemo(), { wrapper: DemoProvider });
    act(() => {
      result.current.toggleSaved("unknown");
      result.current.track("unknown");
      result.current.setStatus("op-2", "Offer");
    });
    expect(result.current.saved).not.toContain("unknown");
    expect(result.current.tracker["unknown"]).toBeUndefined();
    expect(result.current.tracker["op-2"]).toBeUndefined();
  });
});
