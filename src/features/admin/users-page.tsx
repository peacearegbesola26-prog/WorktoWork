import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Field, PageHeading } from "@/components/work/shared";
import { listAdminUsers, suspendAccount } from "./users.functions";
export function AdminUsersPage() {
  const load = useServerFn(listAdminUsers),
    command = useServerFn(suspendAccount),
    client = useQueryClient();
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState<"all" | "active" | "suspended" | "verified" | "unverified">(
      "all",
    ),
    [page, setPage] = useState(1),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const { data, error, isLoading } = useQuery({
    queryKey: ["admin-users", search, status, page],
    queryFn: () => load({ data: { search, status, page } }),
  });
  async function change(id: string, suspended: boolean) {
    const reason = window.prompt(
      suspended ? "Reason for suspension" : "Reason for restoring access",
    );
    if (
      !reason?.trim() ||
      !window.confirm(suspended ? "Suspend this account?" : "Restore this account?")
    )
      return;
    setBusy(true);
    setMessage("");
    try {
      await command({ data: { id, suspended, reason } });
      await client.invalidateQueries({ queryKey: ["admin-users"] });
      setMessage("Account status saved.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Status could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading title="Manage users" description="Account access and activity." />
      <Button asChild variant="outline">
        <Link to="/admin">Administration overview</Link>
      </Button>
      <div className="grid gap-4 sm:grid-cols-2 mt-6 mb-6">
        <Field label="Search by email">
          <input
            aria-label="Search by email"
            value={search}
            maxLength={200}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label="Account status">
          <select
            aria-label="Account status"
            value={status}
            onChange={(e) => {
              const v = e.target.value;
              if (
                v === "all" ||
                v === "active" ||
                v === "suspended" ||
                v === "verified" ||
                v === "unverified"
              )
                setStatus(v);
              setPage(1);
            }}
          >
            {["all", "active", "suspended", "verified", "unverified"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
      </div>
      {isLoading && <p role="status">Loading accounts…</p>}
      {error && <p role="alert">{error.message}</p>}
      <div className="grid gap-4">
        {data?.users.map((u) => (
          <article className="opportunity-card" key={u.id}>
            <h2 className="break-all">{u.email}</h2>
            <p>
              {u.verified ? "Email verified" : "Email not verified"} ·{" "}
              {u.suspended ? "Suspended" : "Active"}
            </p>
            <p>
              Registered {new Date(u.created_at).toLocaleDateString()} ·{" "}
              {u.roles.join(", ") || "User"}
            </p>
            <p>
              Saves: {u.saves} · Applications: {u.applications} · AI requests: {u.ai_requests}
            </p>
            <p>Subscription: Not connected</p>
            {u.suspension_reason && <p>Access decision: {u.suspension_reason}</p>}
            <details>
              <summary>Account details</summary>
              <p className="break-all">Account reference: {u.id}</p>
              <p>Private resumes and application notes are not available to staff.</p>
            </details>
            {!u.roles.includes("owner") && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void change(u.id, !u.suspended)}
              >
                {u.suspended ? "Restore account" : "Suspend account"}
              </Button>
            )}
          </article>
        ))}
      </div>
      {data && !data.users.length && <p>No matching accounts.</p>}
      {data && (
        <div className="flex gap-3 items-center mt-6">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <p>
            {page} · {data.total} accounts
          </p>
          <Button
            variant="outline"
            disabled={page * 25 >= data.total}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
      {message && (
        <p role="status" className="legal-note mt-4">
          {message}
        </p>
      )}
    </>
  );
}
