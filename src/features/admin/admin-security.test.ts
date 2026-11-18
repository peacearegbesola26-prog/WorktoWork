import { describe, it, expect } from "vitest";
import postgres from "postgres";
describe.skipIf(process.env["WTW_ISOLATED_ADMIN_TESTS"] !== "1")(
  "Isolated transactional administrator permissions",
  () => {
    it("enforces admin lifecycle, visibility, audit, private ownership and duplicates without retaining fixtures", async () => {
      const connection = process.env["DATABASE_URL"] || process.env["SUPABASE_DB_URL"];
      if (!connection) throw new Error("A transactional test database connection is required.");
      const sql = postgres(connection, { max: 1 });
      let reached = false;
      try {
        await sql.begin(async (tx) => {
          const admin = crypto.randomUUID(),
            user = crypto.randomUUID(),
            other = crypto.randomUUID();
          for (const id of [admin, user, other])
            await tx`insert into auth.users(id,email) values(${id},${id + "@example.com"})`;
          await tx`insert into public.user_roles(user_id,role) values(${admin},'admin')`;
          const [source] =
            await tx`insert into public.sources(name,platform,enabled) values(${crypto.randomUUID()},'Web',true) returning id`;
          if (!source) throw new Error("Source not created");
          await tx`select set_config('request.jwt.claim.sub',${admin},true)`;
          await tx`set local role authenticated`;
          const [draft] =
            await tx`insert into public.opportunities(title,description,summary,application_instructions,source_id,url,origin,discovery_section,status) values('Transactional verification','Provided description','Provided summary','Provided instructions',${source["id"]},'https://example.com/original','external','web','draft') returning id`;
          if (!draft) throw new Error("Opportunity not created");
          const [audit] =
            await tx`select count(*)::int n from public.admin_audit where opportunity_id=${draft["id"]}`;
          if (!audit) throw new Error("Audit not loaded");
          expect(audit["n"]).toBe(1);
          await tx`select set_config('request.jwt.claim.sub',${user},true)`;
          expect(
            await tx`select id from public.opportunities where id=${draft["id"]}`,
          ).toHaveLength(0);
          expect(await tx`select id from public.admin_audit`).toHaveLength(0);
          await expect(
            tx.savepoint(async (sp) => {
              await sp`select public.admin_overview()`;
            }),
          ).rejects.toThrow();
          await expect(
            tx.savepoint(async (sp) => {
              await sp`insert into public.sources(name,platform) values('Denied','Web')`;
            }),
          ).rejects.toThrow();
          await tx`select set_config('request.jwt.claim.sub',${admin},true)`;
          await tx`update public.opportunities set status='published',skills=ARRAY['Writing'],country='United States',work_location='Remote',posted_at=now() where id=${draft["id"]}`;
          await tx`select set_config('request.jwt.claim.sub',${user},true)`;
          expect(
            await tx`select id from public.opportunities where discovery_section='web' and status='published' and country='United States' and skills @> ARRAY['Writing'] and work_location='Remote' and title ilike '%verification%' and posted_at >= current_date`,
          ).toHaveLength(1);
          await tx`insert into public.saved_opportunities(user_id,opportunity_id) values(${user},${draft["id"]})`;
          await expect(
            tx.savepoint(async (sp) => {
              await sp`insert into public.saved_opportunities(user_id,opportunity_id) values(${user},${draft["id"]})`;
            }),
          ).rejects.toThrow();
          await tx`insert into public.tracked_applications(user_id,opportunity_id,title) values(${user},${draft["id"]},'Transactional verification')`;
          await expect(
            tx.savepoint(async (sp) => {
              await sp`insert into public.tracked_applications(user_id,opportunity_id,title) values(${user},${draft["id"]},'Duplicate')`;
            }),
          ).rejects.toThrow();
          await tx`select set_config('request.jwt.claim.sub',${other},true)`;
          expect(await tx`select * from public.saved_opportunities`).toHaveLength(0);
          expect(await tx`select * from public.tracked_applications`).toHaveLength(0);
          await tx`select set_config('request.jwt.claim.sub',${admin},true)`;
          for (const status of ["draft", "archived", "expired"]) {
            await tx`update public.opportunities set status=${status} where id=${draft["id"]}`;
            await tx`select set_config('request.jwt.claim.sub',${user},true)`;
            expect(
              await tx`select id from public.opportunities where id=${draft["id"]}`,
            ).toHaveLength(0);
            await tx`select set_config('request.jwt.claim.sub',${admin},true)`;
          }
          await tx`update public.opportunities set status='published',closing_date=current_date-1 where id=${draft["id"]}`;
          await tx`select set_config('request.jwt.claim.sub',${user},true)`;
          expect(
            await tx`select id from public.opportunities where id=${draft["id"]}`,
          ).toHaveLength(0);
          reached = true;
          throw new Error("ROLLBACK_VERIFICATION");
        });
      } catch (e) {
        if (!(e instanceof Error) || e.message !== "ROLLBACK_VERIFICATION") throw e;
      } finally {
        await sql.end();
      }
      expect(reached).toBe(true);
    });
  },
);
