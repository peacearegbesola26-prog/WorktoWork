"""Live RLS tests: isolated auth users only; never insert fictional opportunities or sources."""
import os, unittest, uuid, secrets, requests
BASE=os.environ['SUPABASE_URL'].rstrip('/')
KEY=os.environ['SUPABASE_SERVICE_ROLE_KEY']
PUB=os.environ['SUPABASE_PUBLISHABLE_KEY']
ADMIN={'apikey':KEY,'Authorization':'Bearer '+KEY}
def call(path,method='GET',body=None,headers=None):
 return requests.request(method,BASE+path,json=body,headers=headers or ADMIN,timeout=30)
class AccountSecurity(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.users=[];cls.password=secrets.token_urlsafe(24)+'aA1!';cls.op=None;cls.source=None
  for i in range(2):
   email='wtw-security-'+uuid.uuid4().hex+'@example.com'
   r=call('/auth/v1/admin/users','POST',{'email':email,'password':cls.password,'email_confirm':True});assert r.ok,r.status_code
   user=r.json();uid=user.get('id') or user['user']['id'];cls.users.append({'id':uid,'email':email})
   login=call('/auth/v1/token?grant_type=password','POST',{'email':email,'password':cls.password},{'apikey':PUB});assert login.ok,login.status_code
   cls.users[-1]['headers']={'apikey':PUB,'Authorization':'Bearer '+login.json()['access_token']}
   chosen=call('/rest/v1/rpc/choose_account_type','POST',{'type_value':'seller'},cls.users[-1]['headers']);assert chosen.ok,chosen.status_code
 @classmethod
 def tearDownClass(cls):
  if cls.op:call('/rest/v1/opportunities?id=eq.'+cls.op,'DELETE')
  if cls.source:call('/rest/v1/sources?id=eq.'+cls.source,'DELETE')
  for u in cls.users:call('/auth/v1/admin/users/'+u['id'],'DELETE')
 def test_profiles_are_created_and_isolated(self):
  a,b=self.users
  own=call('/rest/v1/profiles?id=eq.'+a['id'],headers=a['headers']);self.assertEqual(len(own.json()),1)
  self.assertEqual(call('/rest/v1/profiles?id=eq.'+a['id'],headers=b['headers']).json(),[])
  r=call('/rest/v1/profiles?id=eq.'+a['id'],'PATCH',{'name':'Intruder'},{**b['headers'],'Prefer':'return=representation'});self.assertEqual(r.json(),[])
  self.assertNotEqual(call('/rest/v1/profiles?id=eq.'+a['id'],headers=a['headers']).json()[0]['name'],'Intruder')
 def test_no_user_becomes_admin_or_can_assign_role(self):
  for u in self.users:
   self.assertEqual(call('/rest/v1/user_roles',headers=u['headers']).json(),[])
   self.assertGreaterEqual(call('/rest/v1/user_roles','POST',{'user_id':u['id'],'role':'admin'},u['headers']).status_code,400)
 def test_only_admins_manage_sources_and_opportunities(self):
  for table,body in [('sources',{'name':'Forbidden','platform':'Web'}),('opportunities',{'title':'Forbidden'})]:
   self.assertGreaterEqual(call('/rest/v1/'+table,'POST',body,self.users[0]['headers']).status_code,400)
 def test_private_records_deny_anonymous(self):
  for table in ['profiles','user_roles','saved_opportunities','tracked_applications','alert_preferences']:
   response=call('/rest/v1/'+table,headers={'apikey':PUB})
   if response.ok:self.assertEqual(response.json(),[],table)
   else:self.assertGreaterEqual(response.status_code,400)
 def test_saves_reject_missing_opportunities_and_other_owners(self):
  a,b=self.users;body={'user_id':a['id'],'opportunity_id':str(uuid.uuid4())}
  self.assertGreaterEqual(call('/rest/v1/saved_opportunities','POST',body,a['headers']).status_code,400)
  self.assertGreaterEqual(call('/rest/v1/saved_opportunities','POST',body,b['headers']).status_code,400)
  self.assertEqual(call('/rest/v1/saved_opportunities',headers=a['headers']).json(),[])
  self.assertEqual(call('/rest/v1/saved_opportunities',headers=b['headers']).json(),[])
 def test_tracking_and_alerts_are_isolated(self):
  a,b=self.users
  for table,body in [('tracked_applications',{'title':'Private application','status':'Applied'}),('alert_preferences',{'name':'Private alert'})]:
   r=call('/rest/v1/'+table,'POST',{'user_id':a['id'],**body},{**a['headers'],'Prefer':'return=representation'});self.assertLess(r.status_code,300);rid=r.json()[0]['id']
   self.assertEqual(call('/rest/v1/'+table,headers=b['headers']).json(),[])
   self.assertEqual(call('/rest/v1/'+table+'?id=eq.'+rid,'PATCH',body,{**b['headers'],'Prefer':'return=representation'}).json(),[])
   self.assertGreaterEqual(call('/rest/v1/'+table,'POST',{'user_id':a['id'],**body},b['headers']).status_code,400)
   self.assertEqual(call('/rest/v1/'+table+'?id=eq.'+rid,'DELETE',headers={**b['headers'],'Prefer':'return=representation'}).json(),[])
   self.assertEqual(len(call('/rest/v1/'+table+'?id=eq.'+rid,headers=a['headers']).json()),1)
if __name__=='__main__':unittest.main()
