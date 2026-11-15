import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDemoSearch } from "./use-demo-search";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
describe("Pending demo search lifecycle", () => {
  it("does not restore results after a reset", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDemoSearch());
    const complete = vi.fn();
    act(() => result.current.run(complete));
    expect(result.current.loading).toBe(true);
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(300));
    expect(complete).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });
  it("only completes the latest search", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDemoSearch());
    const old = vi.fn();
    const latest = vi.fn();
    act(() => {
      result.current.run(old);
      result.current.run(latest);
    });
    act(() => vi.advanceTimersByTime(250));
    expect(old).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });
  it("cancels work when leaving the search page", () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useDemoSearch());
    const complete = vi.fn();
    act(() => result.current.run(complete));
    unmount();
    act(() => vi.advanceTimersByTime(300));
    expect(complete).not.toHaveBeenCalled();
  });
});
