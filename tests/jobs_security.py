"""Live job posting and application checks with isolated buyer and seller accounts."""
from account_security import call, PUB
import unittest, uuid, secrets


class JobSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.job = None
        cls.password = secrets.token_urlsafe(24) + "aA1!"
        cls.users = []
        for kind in ["buyer", "seller", "seller"]:
            email = "wtw-jobs-" + uuid.uuid4().hex + "@example.com"
            r = call(
                "/auth/v1/admin/users",
                "POST",
                {"email": email, "password": cls.password, "email_confirm": True},
            )
            assert r.ok, r.status_code
            user = r.json()
            uid = user.get("id") or user["user"]["id"]
            login = call(
                "/auth/v1/token?grant_type=password",
                "POST",
                {"email": email, "password": cls.password},
                {"apikey": PUB},
            )
            assert login.ok, login.status_code
            cls.users.append(
                {
                    "id": uid,
                    "email": email,
                    "headers": {
                        "apikey": PUB,
                        "Authorization": "Bearer " + login.json()["access_token"],
                    },
                }
            )
            chosen = call(
                "/rest/v1/rpc/choose_account_type",
                "POST",
                {"type_value": kind},
                cls.users[-1]["headers"],
            )
            assert chosen.status_code < 300, (kind, chosen.status_code, chosen.text)

    @classmethod
    def tearDownClass(cls):
        if cls.job:
            call("/rest/v1/jobs?id=eq." + cls.job, "DELETE")
        for u in cls.users:
            call("/auth/v1/admin/users/" + u["id"], "DELETE")

    def denied(self, path, body, headers):
        """The change must not happen, whether it is refused outright or matches no row."""
        response = call(path, "PATCH", body, {**headers, "Prefer": "return=representation"})
        self.assertTrue(
            response.status_code >= 400 or response.json() == [],
            (response.status_code, response.text),
        )

    def test_buyer_and_seller_job_and_application_boundaries(self):
        a, b, c = self.users

        # A buyer can draft a job; a seller cannot create one at all.
        draft = {
            "buyer_id": a["id"],
            "title": "Landing page for an Austin bakery",
            "description": "Design and build a five page site with online ordering.",
            "category": "Design",
            "skills": ["Figma", "HTML"],
            "budget_amount": 3500,
            "budget_currency": "USD",
            "closing_date": "2099-01-01",
        }
        made = call(
            "/rest/v1/jobs",
            "POST",
            draft,
            {**a["headers"], "Prefer": "return=representation"},
        )
        self.assertEqual(made.status_code, 201)
        self.job = made.json()[0]["id"]
        self.assertGreaterEqual(
            call("/rest/v1/jobs", "POST", {**draft, "buyer_id": b["id"]}, b["headers"]).status_code,
            400,
        )

        # Drafts stay invisible to sellers, and the job is not open for applications.
        self.assertEqual(call("/rest/v1/jobs?id=eq." + self.job, headers=b["headers"]).json(), [])
        self.assertFalse(
            call(
                "/rest/v1/rpc/job_open_for_application", "POST", {"job": self.job}, b["headers"]
            ).json()
        )

        # Publishing makes it visible to sellers.
        published = call(
            "/rest/v1/jobs?id=eq." + self.job,
            "PATCH",
            {"status": "published"},
            {**a["headers"], "Prefer": "return=representation"},
        )
        self.assertEqual(published.status_code, 200)
        self.assertEqual(published.json()[0]["status"], "published")
        self.assertEqual(
            len(call("/rest/v1/jobs?id=eq." + self.job, headers=b["headers"]).json()), 1
        )
        self.assertTrue(
            call(
                "/rest/v1/rpc/job_open_for_application", "POST", {"job": self.job}, b["headers"]
            ).json()
        )

        # A job without a budget cannot be published.
        second = call(
            "/rest/v1/jobs",
            "POST",
            {**draft, "budget_amount": None, "buyer_id": a["id"]},
            {**a["headers"], "Prefer": "return=representation"},
        )
        self.assertEqual(second.status_code, 201)
        self.assertGreaterEqual(
            call(
                "/rest/v1/jobs?id=eq." + second.json()[0]["id"],
                "PATCH",
                {"status": "published"},
                {**a["headers"], "Prefer": "return=representation"},
            ).status_code,
            400,
        )
        call("/rest/v1/jobs?id=eq." + second.json()[0]["id"], "DELETE", headers=a["headers"])

        # A seller applies once; the buyer sees it, another seller does not.
        applied = call(
            "/rest/v1/job_applications",
            "POST",
            {
                "job_id": self.job,
                "seller_id": b["id"],
                "cover_note": "I have built three bakery sites with online ordering.",
                "proposed_amount": 300000,
            },
            {**b["headers"], "Prefer": "return=representation"},
        )
        self.assertEqual(applied.status_code, 201)
        app = applied.json()[0]
        seller_name = call("/rest/v1/profiles?id=eq." + b["id"], headers=b["headers"]).json()[0][
            "name"
        ]
        self.assertEqual(app["seller_name"], seller_name)
        self.assertEqual(
            len(call("/rest/v1/job_applications?id=eq." + app["id"], headers=a["headers"]).json()), 1
        )
        self.assertEqual(
            call("/rest/v1/job_applications?id=eq." + app["id"], headers=c["headers"]).json(), []
        )

        # A seller never sees the buyer's private profile through the application.
        self.assertEqual(call("/rest/v1/profiles?id=eq." + a["id"], headers=b["headers"]).json(), [])

        # A buyer cannot apply to their own job, and a seller cannot review applications.
        self.assertGreaterEqual(
            call(
                "/rest/v1/job_applications",
                "POST",
                {
                    "job_id": self.job,
                    "seller_id": a["id"],
                    "cover_note": "I would like to apply to my own job here.",
                },
                {**a["headers"], "Prefer": "return=representation"},
            ).status_code,
            400,
        )
        self.denied(
            "/rest/v1/job_applications?id=eq." + app["id"],
            {"status": "shortlisted"},
            b["headers"],
        )
        self.assertEqual(
            call("/rest/v1/job_applications?id=eq." + app["id"], headers=b["headers"]).json()[0][
                "status"
            ],
            "submitted",
        )

        # The buyer can review, and the seller can no longer withdraw a reviewed application.
        reviewed = call(
            "/rest/v1/job_applications?id=eq." + app["id"],
            "PATCH",
            {"status": "shortlisted"},
            {**a["headers"], "Prefer": "return=representation"},
        )
        self.assertEqual(reviewed.json()[0]["status"], "shortlisted")
        self.denied(
            "/rest/v1/job_applications?id=eq." + app["id"],
            {"status": "withdrawn"},
            b["headers"],
        )

        # Only one hire per job.
        hired = call(
            "/rest/v1/job_applications?id=eq." + app["id"],
            "PATCH",
            {"status": "hired"},
            {**a["headers"], "Prefer": "return=representation"},
        )
        self.assertEqual(hired.json()[0]["status"], "hired")
        second_seller = call(
            "/rest/v1/job_applications",
            "POST",
            {
                "job_id": self.job,
                "seller_id": c["id"],
                "cover_note": "I run a two person studio and can start this week.",
            },
            {**c["headers"], "Prefer": "return=representation"},
        )
        self.assertEqual(second_seller.status_code, 201)
        self.assertGreaterEqual(
            call(
                "/rest/v1/job_applications?id=eq." + second_seller.json()[0]["id"],
                "PATCH",
                {"status": "hired"},
                {**a["headers"], "Prefer": "return=representation"},
            ).status_code,
            400,
        )

        # Dashboard counts belong to the signed-in account only.
        counts = call("/rest/v1/rpc/buyer_workspace_counts", "POST", {}, a["headers"]).json()
        self.assertEqual(counts["published"], 1)
        self.assertEqual(counts["applications"], 2)
        seller_counts = call("/rest/v1/rpc/seller_workspace_counts", "POST", {}, c["headers"]).json()
        self.assertEqual(seller_counts["applications"], 1)

        # Anonymous visitors cannot read jobs or applications.
        for table in ["jobs", "job_applications"]:
            response = call("/rest/v1/" + table, headers={"apikey": PUB})
            if response.ok:
                self.assertEqual(response.json(), [], table)
            else:
                self.assertGreaterEqual(response.status_code, 400)

        # An archived job stops appearing to sellers.
        archived = call(
            "/rest/v1/jobs?id=eq." + self.job,
            "PATCH",
            {"status": "archived"},
            {**a["headers"], "Prefer": "return=representation"},
        )
        self.assertEqual(archived.json()[0]["status"], "archived")
        self.assertEqual(call("/rest/v1/jobs?id=eq." + self.job, headers=b["headers"]).json(), [])


if __name__ == "__main__":
    unittest.main()
