import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/work/shared";
export const Route = createFileRoute("/demo")({ component: DemoLayout });
function DemoLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
