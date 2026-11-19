import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireActiveAccount } from "@/features/account/active-auth";
import { requireBuyerAccount, requireSellerAccount } from "./guard";
import { jobCommand, jobSearchSchema, applySchema, reviewSchema } from "./schemas";

const today = () => new Date().toISOString().slice(0, 10);

/** Buyer: their own jobs with live application counts. */
export const getMyJobs = createServerFn({ method: "GET" })
  .middleware([requireBuyerAccount])
  .handler(async ({ context }) => {
    const jobs = await context.supabase
      .from("jobs")
      .select("*")
      .eq("buyer_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(200);
    if (jobs.error) throw new Error("Your jobs could not be loaded. Please try again.");
    const rows = jobs.data ?? [];
    const ids = rows.map((j) => j.id);
    let applications: { job_id: string; status: string }[] = [];
    if (ids.length) {
      const apps = await context.supabase
        .from("job_applications")
        .select("job_id,status")
        .in("job_id", ids)
        .limit(2000);
      if (apps.error) throw new Error("Application counts could not be loaded. Please try again.");
      applications = apps.data ?? [];
    }
    const counts = new Map<string, { total: number; waiting: number }>();
    for (const a of applications) {
      const c = counts.get(a.job_id) ?? { total: 0, waiting: 0 };
      c.total += 1;
      if (a.status === "submitted") c.waiting += 1;
      counts.set(a.job_id, c);
    }
    return rows.map((j) => ({
      ...j,
      applications: counts.get(j.id)?.total ?? 0,
      waiting: counts.get(j.id)?.waiting ?? 0,
    }));
  });

/** Buyer: create or update a draft, or move a job through its lifecycle. */
export const saveJob = createServerFn({ method: "POST" })
  .middleware([requireBuyerAccount])
  .inputValidator((v) => jobCommand.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase: s, userId } = context;
    if (data.action === "save") {
      const payload = {
        title: data.value.title,
        description: data.value.description,
        category: data.value.category,
        skills: data.value.skills,
        experience_level: data.value.experience_level,
        location_type: data.value.location_type,
        country: data.value.country,
        budget_type: data.value.budget_type,
        budget_amount: data.value.budget_amount,
        budget_currency: data.value.budget_currency,
        closing_date: data.value.closing_date || null,
      };
      const r = data.id
        ? await s
            .from("jobs")
            .update(payload)
            .eq("id", data.id)
            .eq("buyer_id", userId)
            .select("id")
            .single()
        : await s
            .from("jobs")
            .insert({ ...payload, buyer_id: userId })
            .select("id")
            .single();
      if (r.error) throw new Error("Your job could not be saved. Please try again.");
      return { id: r.data.id };
    }
    const job = await s
      .from("jobs")
      .select("id,status,budget_amount,closing_date")
      .eq("id", data.id)
      .eq("buyer_id", userId)
      .maybeSingle();
    if (job.error) throw new Error("This job could not be loaded. Please try again.");
    if (!job.data) throw new Error("This job is not available.");
    if (data.action === "publish") {
      if (job.data.status === "archived")
        throw new Error("Archived jobs cannot be published again.");
      if (job.data.budget_amount === null) throw new Error("Add a budget before publishing.");
      if (job.data.closing_date && job.data.closing_date < today())
        throw new Error("The closing date has already passed.");
      const r = await s
        .from("jobs")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", data.id)
        .eq("buyer_id", userId)
        .select("id")
        .single();
      if (r.error) throw new Error("Your job could not be published. Please try again.");
      return { id: data.id };
    }
    if (data.action === "close") {
      if (job.data.status !== "published") throw new Error("Only published jobs can be closed.");
      const r = await s
        .from("jobs")
        .update({ status: "closed", closed_at: new Date().toISOString() })
        .eq("id", data.id)
        .eq("buyer_id", userId)
        .select("id")
        .single();
      if (r.error) throw new Error("Your job could not be closed. Please try again.");
      return { id: data.id };
    }
    if (data.action === "archive") {
      const r = await s
        .from("jobs")
        .update({ status: "archived" })
        .eq("id", data.id)
        .eq("buyer_id", userId)
        .select("id")
        .single();
      if (r.error) throw new Error("Your job could not be archived. Please try again.");
      return { id: data.id };
    }
    if (job.data.status !== "draft") throw new Error("Only draft jobs can be deleted.");
    const r = await s
      .from("jobs")
      .delete()
      .eq("id", data.id)
      .eq("buyer_id", userId)
      .select("id")
      .single();
    if (r.error) throw new Error("Your draft could not be deleted. Please try again.");
    return { id: data.id };
  });

/** Seller: browse published, still-open jobs. */
export const searchJobs = createServerFn({ method: "POST" })
  .middleware([requireSellerAccount])
  .inputValidator((v) => jobSearchSchema.parse(v))
  .handler(async ({ data, context }) => {
    const clean = (v: string) => v.replace(/[%,()\\]/g, " ").trim();
    const term = clean(data.query);
    let q = context.supabase
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .or(`closing_date.is.null,closing_date.gte.${today()}`);
    if (term) q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`);
    if (clean(data.category)) q = q.ilike("category", `%${clean(data.category)}%`);
    if (clean(data.country)) q = q.ilike("country", `%${clean(data.country)}%`);
    if (data.work !== "All") q = q.eq("location_type", data.work);
    if (data.experience !== "All") q = q.eq("experience_level", data.experience);
    q =
      data.sort === "budget"
        ? q.order("budget_amount", { ascending: false, nullsFirst: false }).order("id")
        : q.order("created_at", { ascending: data.sort === "oldest" }).order("id");
    const r = await q.range((data.page - 1) * 12, data.page * 12 - 1);
    if (r.error) throw new Error("Jobs could not be loaded. Please try again.");
    const rows = r.data ?? [];
    const ids = rows.map((j) => j.id);
    let mine: { job_id: string; status: string }[] = [];
    if (ids.length) {
      const a = await context.supabase
        .from("job_applications")
        .select("job_id,status")
        .eq("seller_id", context.userId)
        .in("job_id", ids);
      if (a.error) throw new Error("Your applications could not be loaded. Please try again.");
      mine = a.data ?? [];
    }
    const applied = new Map(mine.map((m) => [m.job_id, m.status]));
    return {
      rows: rows.map((j) => ({ ...j, my_application: applied.get(j.id) ?? null })),
      total: r.count ?? 0,
      page: data.page,
      perPage: 12,
    };
  });

/** Either side: one job, plus the signed-in seller's own application when present. */
export const jobDetails = createServerFn({ method: "POST" })
  .middleware([requireActiveAccount])
  .inputValidator((v) => z.string().uuid().parse(v))
  .handler(async ({ data, context }) => {
    const job = await context.supabase.from("jobs").select("*").eq("id", data).maybeSingle();
    if (job.error) throw new Error("This job could not be loaded. Please try again.");
    if (!job.data) return null;
    const mine = await context.supabase
      .from("job_applications")
      .select("id,status,created_at,proposed_amount")
      .eq("job_id", data)
      .eq("seller_id", context.userId)
      .maybeSingle();
    if (mine.error) throw new Error("Your application could not be loaded. Please try again.");
    return { job: job.data, application: mine.data ?? null };
  });

/** Seller: apply once per open job. */
export const applyToJob = createServerFn({ method: "POST" })
  .middleware([requireSellerAccount])
  .inputValidator((v) => applySchema.parse(v))
  .handler(async ({ data, context }) => {
    const open = await context.supabase.rpc("job_open_for_application", { job: data.job_id });
    if (open.error) throw new Error("This job could not be checked. Please try again.");
    if (!open.data) throw new Error("This job is no longer open for applications.");
    const existing = await context.supabase
      .from("job_applications")
      .select("id")
      .eq("job_id", data.job_id)
      .eq("seller_id", context.userId)
      .maybeSingle();
    if (existing.error) throw new Error("Your application could not be checked. Please try again.");
    if (existing.data) throw new Error("You have already applied for this job.");
    const r = await context.supabase
      .from("job_applications")
      .insert({
        job_id: data.job_id,
        seller_id: context.userId,
        cover_note: data.cover_note,
        proposed_amount: data.proposed_amount,
      })
      .select("id")
      .single();
    if (r.error) throw new Error("Your application could not be sent. Please try again.");
    return { id: r.data.id };
  });

/** Seller: withdraw while the application is still unreviewed. */
export const withdrawApplication = createServerFn({ method: "POST" })
  .middleware([requireSellerAccount])
  .inputValidator((v) => z.string().uuid().parse(v))
  .handler(async ({ data, context }) => {
    const r = await context.supabase
      .from("job_applications")
      .update({ status: "withdrawn" })
      .eq("id", data)
      .eq("seller_id", context.userId)
      .eq("status", "submitted")
      .select("id")
      .single();
    if (r.error)
      throw new Error(
        "This application could not be withdrawn. It may already have been reviewed.",
      );
    return { id: r.data.id };
  });

/** Buyer: review an application on one of their own jobs. */
export const reviewApplication = createServerFn({ method: "POST" })
  .middleware([requireBuyerAccount])
  .inputValidator((v) => reviewSchema.parse(v))
  .handler(async ({ data, context }) => {
    const app = await context.supabase
      .from("job_applications")
      .select("id,status,job_id")
      .eq("id", data.id)
      .maybeSingle();
    if (app.error) throw new Error("This application could not be loaded. Please try again.");
    if (!app.data) throw new Error("This application is not available.");
    if (app.data.status === "withdrawn") throw new Error("This application was withdrawn.");
    if (data.status === "hired") {
      const already = await context.supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", app.data.job_id)
        .eq("status", "hired")
        .neq("id", data.id)
        .maybeSingle();
      if (already.error)
        throw new Error("This application could not be checked. Please try again.");
      if (already.data) throw new Error("This job already has a hire.");
    }
    const r = await context.supabase
      .from("job_applications")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("id")
      .single();
    if (r.error) throw new Error("This application could not be updated. Please try again.");
    return { id: r.data.id };
  });

/** Buyer: every application sent to their own jobs. */
export const getJobApplications = createServerFn({ method: "GET" })
  .middleware([requireBuyerAccount])
  .handler(async ({ context }) => {
    const jobs = await context.supabase
      .from("jobs")
      .select("id,title,status")
      .eq("buyer_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (jobs.error) throw new Error("Your jobs could not be loaded. Please try again.");
    const ids = (jobs.data ?? []).map((j) => j.id);
    let applications: {
      id: string;
      job_id: string;
      seller_name: string;
      cover_note: string;
      proposed_amount: number | null;
      status: string;
      created_at: string;
      jobs: { title: string; status: string; budget_currency: string } | null;
    }[] = [];
    if (ids.length) {
      const apps = await context.supabase
        .from("job_applications")
        .select(
          "id,job_id,seller_name,cover_note,proposed_amount,status,created_at,jobs(title,status,budget_currency)",
        )
        .in("job_id", ids)
        .order("created_at", { ascending: false })
        .limit(500);
      if (apps.error) throw new Error("Applications could not be loaded. Please try again.");
      applications = (apps.data ?? []) as typeof applications;
    }
    return { jobs: jobs.data ?? [], applications };
  });

/** Seller: every application they have sent. */
export const getMyApplications = createServerFn({ method: "GET" })
  .middleware([requireSellerAccount])
  .handler(async ({ context }) => {
    const r = await context.supabase
      .from("job_applications")
      .select(
        "id,job_id,seller_name,cover_note,proposed_amount,status,created_at,jobs(id,title,status,category,budget_amount,budget_currency,closing_date,location_type,country)",
      )
      .eq("seller_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (r.error) throw new Error("Your applications could not be loaded. Please try again.");
    return r.data ?? [];
  });
