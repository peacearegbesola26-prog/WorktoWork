"""Isolated marketplace ownership, retry and payment-boundary regression checks."""
import unittest, uuid, secrets
from account_security import call, PUB


class MarketplaceSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.users = []
        cls.jobs = []
        password = secrets.token_urlsafe(24) + 'aA1!'
        for kind in ['buyer', 'seller', 'seller']:
            email = 'wtw-marketplace-' + uuid.uuid4().hex + '@example.com'
            made = call('/auth/v1/admin/users', 'POST', {'email': email, 'password': password, 'email_confirm': True})
            made.raise_for_status()
            uid = made.json()['id']
            login = call('/auth/v1/token?grant_type=password', 'POST', {'email': email, 'password': password}, {'apikey': PUB})
            login.raise_for_status()
            user = {'id': uid, 'headers': {'apikey': PUB, 'Authorization': 'Bearer ' + login.json()['access_token']}}
            cls.users.append(user)
            call('/rest/v1/rpc/choose_account_type', 'POST', {'type_value': kind}, user['headers']).raise_for_status()
        a, b, _ = cls.users
        job = call('/rest/v1/jobs', 'POST', {'buyer_id': a['id'], 'title': 'Isolated marketplace security test', 'description': 'Temporary private workflow verification fixture.', 'category': 'Design', 'budget_amount': 450, 'status': 'published'}, {**a['headers'], 'Prefer': 'return=representation'})
        job.raise_for_status()
        cls.jobs.append(job.json()[0]['id'])
        app = call('/rest/v1/job_applications', 'POST', {'job_id': cls.jobs[0], 'seller_id': b['id'], 'cover_note': 'I can provide the agreed design files.'}, {**b['headers'], 'Prefer': 'return=representation'})
        app.raise_for_status()
        cls.application = app.json()[0]['id']
        opened = call('/rest/v1/rpc/open_marketplace_conversation', 'POST', {'application_value': cls.application}, a['headers'])
        opened.raise_for_status()
        cls.conversation = opened.json()

    @classmethod
    def tearDownClass(cls):
        for job in cls.jobs:
            call('/rest/v1/jobs?id=eq.' + job, 'DELETE')
        for u in cls.users:
            call('/auth/v1/admin/users/' + u['id'], 'DELETE')

    def rpc(self, name, body, user=0):
        return call('/rest/v1/rpc/' + name, 'POST', body, self.users[user]['headers'])

    def test_01_conversation_clicks_are_idempotent(self):
        for index in [0, 1, 0]:
            self.assertEqual(self.rpc('open_marketplace_conversation', {'application_value': self.application}, index).json(), self.conversation)

    def test_02_messages_are_retry_safe(self):
        body = {'conversation_value': self.conversation, 'request_value': str(uuid.uuid4()), 'body_value': 'One durable message'}
        first = self.rpc('send_marketplace_message', body)
        self.assertLess(first.status_code, 300)
        self.assertEqual(first.json(), self.rpc('send_marketplace_message', body).json())
        self.assertGreaterEqual(self.rpc('send_marketplace_message', {**body, 'body_value': 'Changed message'}).status_code, 400)
        rows = call('/rest/v1/marketplace_messages?conversation_id=eq.' + self.conversation, headers=self.users[1]['headers']).json()
        self.assertEqual(len(rows), 1)

    def test_03_unrelated_account_has_no_private_access(self):
        for table, query in [('job_applications', 'id=eq.' + self.application), ('marketplace_conversations', 'id=eq.' + self.conversation), ('marketplace_messages', 'conversation_id=eq.' + self.conversation), ('marketplace_contracts', 'conversation_id=eq.' + self.conversation)]:
            self.assertEqual(call('/rest/v1/' + table + '?' + query, headers=self.users[2]['headers']).json(), [], table)
        self.assertGreaterEqual(self.rpc('open_marketplace_conversation', {'application_value': self.application}, 2).status_code, 400)
        self.assertGreaterEqual(self.rpc('send_marketplace_message', {'conversation_value': self.conversation, 'request_value': str(uuid.uuid4()), 'body_value': 'Intrusion'}, 2).status_code, 400)

    def test_04_unread_receipt_is_owner_scoped(self):
        rows = call('/rest/v1/marketplace_messages?conversation_id=eq.' + self.conversation, headers=self.users[1]['headers']).json()
        self.assertEqual(len(call('/rest/v1/marketplace_notifications?read_at=is.null', headers=self.users[1]['headers']).json()), 1)
        self.assertLess(self.rpc('read_marketplace_conversation', {'conversation_value': self.conversation, 'through_value': rows[-1]['created_at']}, 1).status_code, 300)
        self.assertEqual(call('/rest/v1/marketplace_notifications?read_at=is.null', headers=self.users[1]['headers']).json(), [])

    def test_05_offer_acceptance_never_activates_funded_work(self):
        body = {'conversation_value': self.conversation, 'terms_value': 'Deliver the two agreed design files.', 'milestones_value': [{'title': 'Design files', 'amount': 450, 'due_date': ''}]}
        self.assertGreaterEqual(self.rpc('create_marketplace_offer', body, 1).status_code, 400)
        offer = self.rpc('create_marketplace_offer', body)
        self.assertLess(offer.status_code, 300)
        cid = offer.json()
        self.assertEqual(self.rpc('create_marketplace_offer', body).json(), cid)
        self.assertGreaterEqual(self.rpc('respond_marketplace_offer', {'contract_value': cid, 'action_value': 'accept'}, 0).status_code, 400)
        self.assertGreaterEqual(self.rpc('respond_marketplace_offer', {'contract_value': cid, 'action_value': 'accept'}, 2).status_code, 400)
        self.assertLess(self.rpc('respond_marketplace_offer', {'contract_value': cid, 'action_value': 'accept'}, 1).status_code, 300)
        row = call('/rest/v1/marketplace_contracts?id=eq.' + cid, headers=self.users[1]['headers']).json()[0]
        self.assertEqual(row['status'], 'accepted_unfunded')
        self.assertEqual(call('/rest/v1/marketplace_contracts?id=eq.' + cid, headers=self.users[2]['headers']).json(), [])
        call('/rest/v1/marketplace_contracts?id=eq.' + cid, 'PATCH', {'status': 'active'}, self.users[0]['headers'])
        self.assertEqual(call('/rest/v1/marketplace_contracts?id=eq.' + cid, headers=self.users[0]['headers']).json()[0]['status'], 'accepted_unfunded')

    def test_06_private_file_permissions(self):
        path = self.conversation + '/' + self.users[0]['id'] + '/' + str(uuid.uuid4())
        import requests, os
        base = os.environ['SUPABASE_URL'].rstrip('/')
        sent = requests.post(base + '/storage/v1/object/marketplace-files/' + path, data=b'private fixture', headers={**self.users[0]['headers'], 'Content-Type': 'application/octet-stream'}, timeout=30)
        self.assertLess(sent.status_code, 300)
        try:
            own = requests.get(base + '/storage/v1/object/authenticated/marketplace-files/' + path, headers=self.users[1]['headers'], timeout=30)
            self.assertEqual(own.status_code, 200)
            denied = requests.get(base + '/storage/v1/object/authenticated/marketplace-files/' + path, headers=self.users[2]['headers'], timeout=30)
            self.assertGreaterEqual(denied.status_code, 400)
        finally:
            call('/storage/v1/object/marketplace-files', 'DELETE', {'prefixes': [path]})

    def test_07_suspension_blocks_existing_conversation(self):
        uid = self.users[1]['id']
        call('/rest/v1/account_suspensions', 'POST', {'user_id': uid, 'suspended': True, 'reason': 'Isolated test'}, {'apikey': __import__('account_security').KEY, 'Authorization': 'Bearer ' + __import__('account_security').KEY, 'Prefer': 'resolution=merge-duplicates'}).raise_for_status()
        try:
            self.assertGreaterEqual(self.rpc('send_marketplace_message', {'conversation_value': self.conversation, 'request_value': str(uuid.uuid4()), 'body_value': 'Blocked message'}, 1).status_code, 400)
            self.assertEqual(call('/rest/v1/marketplace_messages', headers=self.users[1]['headers']).json(), [])
        finally:
            call('/rest/v1/account_suspensions?user_id=eq.' + uid, 'DELETE')


if __name__ == '__main__':
    unittest.main()