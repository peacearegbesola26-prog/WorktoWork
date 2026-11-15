import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
const mocks = vi.hoisted(() => ({ login: vi.fn(), check: vi.fn(), navigate: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { signInWithPassword: mocks.login } },
}));
vi.mock("@/features/account/auth", () => ({
  useAccountAuth: () => ({ user: null, loading: false }),
}));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => mocks.check }));
vi.mock("./admin.functions", () => ({ adminAccess: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => children,
  useNavigate: () => mocks.navigate,
}));
vi.mock("@/components/work/shared", () => ({
  Field: ({ label, children }: { label: string; children: ReactNode }) => (
    <label>
      {label}
      {children}
    </label>
  ),
}));
import { StaffLoginPage } from "./login-page";
describe("dedicated staff login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.login.mockResolvedValue({ error: null });
  });
  async function login() {
    render(<StaffLoginPage />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "staff@example.org" },
    });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "testpass123" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
  }
  it("returns authorised staff to /admin only after the backend permission check", async () => {
    mocks.check.mockResolvedValue(true);
    await login();
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/admin", replace: true }),
    );
    expect(mocks.check).toHaveBeenCalledTimes(1);
  });
  it("does not admit an ordinary signed-in account", async () => {
    mocks.check.mockResolvedValue(false);
    await login();
    await screen.findByRole("alert");
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
