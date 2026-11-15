"""Staff permissions checked with existing sessions; no opportunity fixtures."""
from account_security import AccountSecurity, call, PUB
import json, os, unittest, uuid

class StaffAreaSecurity(AccountSecurity):
 def test_roles_revocation_suspension_and_audit(self):
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:
   owner={'apikey':PUB,'Authorization':'Bearer '+json.load(f)['session']['access_token']}
  a,b=self.users
  def permission(user,p):
   r=call('/rest/v1/rpc/has_permission','POST',{'p':p},user)
   self.assertLess(r.status_code,300)
   return r.json()
  def role(value,grant):
   self.assertLess(call('/rest/v1/rpc/set_staff_role','POST',{'target':a['id'],'new_role':value,'grant_role':grant},owner).status_code,300)
  try:
   self.assertFalse(permission(a['headers'],'admin.access'))
   self.assertGreaterEqual(call('/rest/v1/rpc/admin_overview','POST',{},a['headers']).status_code,400)
   role('moderator',True)
   self.assertTrue(permission(a['headers'],'opportunities.manage'))
   for p in ['users.manage','ai.manage','audit.read','sources.manage','roles.manage']:
    self.assertFalse(permission(a['headers'],p),p)
   self.assertGreaterEqual(call('/rest/v1/rpc/admin_users','POST',{},a['headers']).status_code,400)
   role('moderator',False)
   self.assertFalse(permission(a['headers'],'admin.access'))
   role('admin',True)
   for p in ['admin.access','users.manage','ai.manage','audit.read','sources.manage']:
    self.assertTrue(permission(a['headers'],p),p)
   for name,body in [('set_staff_role',{'target':b['id'],'new_role':'owner','grant_role':True}),('verified_staff_target',{'address':b['email']}),('staff_directory',{})]:
    self.assertGreaterEqual(call('/rest/v1/rpc/'+name,'POST',body,a['headers']).status_code,400)
   self.assertLess(call('/rest/v1/rpc/admin_users','POST',{},a['headers']).status_code,300)
   for table,body in [('resumes',{'name':'Privacy verification','content':{}}),('tracked_applications',{'title':'Private verification','notes':'Not visible to staff'})]:
    r=call('/rest/v1/'+table,'POST',{'user_id':b['id'],**body},{**b['headers'],'Prefer':'return=representation'})
    self.assertEqual(r.status_code,201)
    rid=r.json()[0]['id']
    self.assertEqual(call('/rest/v1/'+table+'?id=eq.'+rid,headers=a['headers']).json(),[])
    self.assertEqual(call('/rest/v1/'+table+'?id=eq.'+rid,headers=owner).json(),[])
    call('/rest/v1/'+table+'?id=eq.'+rid,'DELETE',headers=b['headers'])
   role('admin',False)
   self.assertFalse(permission(a['headers'],'admin.access'))
   self.assertGreaterEqual(call('/rest/v1/rpc/admin_users','POST',{},a['headers']).status_code,400)
   role('admin',True)
   self.assertLess(call('/rest/v1/rpc/set_account_suspension','POST',{'target':a['id'],'is_suspended':True,'reason_value':'Staff session verification'},owner).status_code,300)
   self.assertFalse(permission(a['headers'],'admin.access'))
   self.assertGreaterEqual(call('/rest/v1/rpc/admin_users','POST',{},a['headers']).status_code,400)
   self.assertGreaterEqual(call('/rest/v1/rpc/reserve_resume_ai','POST',{'mode_value':'summary','input_length':100},a['headers']).status_code,400)
   self.assertLess(call('/rest/v1/rpc/set_account_suspension','POST',{'target':a['id'],'is_suspended':False,'reason_value':'Staff verification complete'},owner).status_code,300)
   self.assertTrue(permission(a['headers'],'admin.access'))
   audit=call('/rest/v1/security_audit?target_id=eq.'+a['id'],headers=owner)
   self.assertLess(audit.status_code,300)
   self.assertGreaterEqual(len(audit.json()),6)
  finally:
   call('/rest/v1/account_suspensions?user_id=eq.'+a['id'],'DELETE')
   for value in ['moderator','admin']:
    call('/rest/v1/rpc/set_staff_role','POST',{'target':a['id'],'new_role':value,'grant_role':False},owner)

if __name__=='__main__': unittest.main()