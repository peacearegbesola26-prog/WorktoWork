import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountAuthPage } from "./auth-page";
import type { ReactNode } from "react";
const mocks = vi.hoisted(() => ({
  signup: vi.fn(),
  reset: vi.fn(),
  update: vi.fn(),
  navigate: vi.fn(),
  login: vi.fn(),
  auth: { user: null as null | { id: string }, loading: false, recovery: false },
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: mocks.login,
      signUp: mocks.signup,
      resetPasswordForEmail: mocks.reset,
      updateUser: mocks.update,
    },
  },
}));
vi.mock("./auth", () => ({ useAccountAuth: () => mocks.auth }));
vi.mock("@/features/website/context", () => ({
  useWebsite: () => ({ settings: { registrationEnabled: true } }),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => children,
  useNavigate: () => mocks.navigate,
}));
vi.mock("@/components/work/shared", () => ({
  PublicShell: ({ children }: { children: ReactNode }) => children,
  Field: ({ label, children }: { label: string; children: ReactNode }) => (
    <label>
      {label}
      {children}
    </label>
  ),
}));
describe("Real account flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signup.mockResolvedValue({ data: { session: null }, error: null });
    mocks.reset.mockResolvedValue({ error: null });
    mocks.login.mockResolvedValue({ error: null });
    mocks.update.mockResolvedValue({ error: null });
    mocks.auth.user = null;
    mocks.auth.recovery = false;
  });
  it("does not sign in a signup awaiting email confirmation", async () => {
    render(<AccountAuthPage kind="signup" next="/app/saved" />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Peace" } });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "peace@example.org" },
    });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "testpass123" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "testpass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(mocks.signup).toHaveBeenCalled());
    expect(mocks.signup.mock.calls[0]?.[0].options.emailRedirectTo).toBe(
      window.location.origin + "/email-verification?next=%2Fapp%2Fsaved",
    );
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
  it("requests recovery with the required public reset page", async () => {
    render(<AccountAuthPage kind="forgot" />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "peace@example.org" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));
    await waitFor(() =>
      expect(mocks.reset).toHaveBeenCalledWith("peace@example.org", {
        redirectTo: window.location.origin + "/reset-password",
      }),
    );
  });
  it("does not change a password without a recovery link", () => {
    render(<AccountAuthPage kind="reset" />);
    expect(screen.getByRole("button", { name: "Update password" })).toBeDisabled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("returns a successful login to the intended protected page", async () => {
    render(<AccountAuthPage kind="login" next="/app/tracker" />);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "peace@example.org" },
    });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "testpass123" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/app/tracker", replace: true }),
    );
  });
  it("updates a recovery password without requesting a current password", async () => {
    mocks.auth.user = { id: "recovery-user" };
    mocks.auth.recovery = true;
    render(<AccountAuthPage kind="reset" />);
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "newpassword123" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ password: "newpassword123" }));
  });
});
