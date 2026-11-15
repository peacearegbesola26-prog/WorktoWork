"""Live owner-authorised account access checks, without opportunity fixtures."""
from account_security import AccountSecurity,call,PUB
import unittest,json,os
class UserManagementSecurity(AccountSecurity):
 def test_owner_roles_suspensions_and_private_records(self):
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f: session=json.load(f)['session']
  owner={'apikey':PUB,'Authorization':'Bearer '+session['access_token']}
  a,b=self.users
  self.assertTrue(call('/rest/v1/rpc/has_permission','POST',{'p':'users.manage'},owner).json())
  r=call('/rest/v1/rpc/set_staff_role','POST',{'target':a['id'],'new_role':'admin','grant_role':True},owner)
  self.assertLess(r.status_code,300)
  self.assertGreaterEqual(call('/rest/v1/rpc/set_staff_role','POST',{'target':b['id'],'new_role':'admin','grant_role':True},a['headers']).status_code,400)
  resume=call('/rest/v1/resumes','POST',{'user_id':b['id'],'name':'Private access check','content':{}},{**b['headers'],'Prefer':'return=representation'})
  self.assertEqual(resume.status_code,201)
  rid=resume.json()[0]['id']
  self.assertEqual(call('/rest/v1/resumes?id=eq.'+rid,headers=a['headers']).json(),[])
  notes=call('/rest/v1/tracked_applications','POST',{'user_id':b['id'],'title':'Private account test','notes':'Private notes'},{**b['headers'],'Prefer':'return=representation'})
  self.assertEqual(notes.status_code,201)
  nid=notes.json()[0]['id']
  self.assertEqual(call('/rest/v1/tracked_applications?id=eq.'+nid,headers=a['headers']).json(),[])
  try:
   r=call('/rest/v1/rpc/set_account_suspension','POST',{'target':b['id'],'is_suspended':True,'reason_value':'Isolated access verification'},a['headers'])
   self.assertLess(r.status_code,300)
   self.assertGreaterEqual(call('/rest/v1/rpc/assert_active_account','POST',{},b['headers']).status_code,400)
   self.assertGreaterEqual(call('/rest/v1/rpc/reserve_resume_ai','POST',{'mode_value':'summary','input_length':100},b['headers']).status_code,400)
   self.assertEqual(call('/rest/v1/resumes',headers=b['headers']).json(),[])
   self.assertGreaterEqual(call('/rest/v1/resumes','POST',{'user_id':b['id'],'name':'Denied'},b['headers']).status_code,400)
   r=call('/rest/v1/rpc/set_account_suspension','POST',{'target':b['id'],'is_suspended':False,'reason_value':'Verification completed'},a['headers'])
   self.assertLess(r.status_code,300)
   self.assertLess(call('/rest/v1/rpc/assert_active_account','POST',{},b['headers']).status_code,300)
   self.assertEqual(len(call('/rest/v1/resumes?id=eq.'+rid,headers=b['headers']).json()),1)
   self.assertGreaterEqual(call('/rest/v1/rpc/admin_users','POST',{},b['headers']).status_code,400)
  finally:
   call('/rest/v1/account_suspensions?user_id=eq.'+b['id'],'DELETE')
   call('/rest/v1/resumes?id=eq.'+rid,'DELETE',headers=b['headers'])
   call('/rest/v1/tracked_applications?id=eq.'+nid,'DELETE',headers=b['headers'])
   call('/rest/v1/rpc/set_staff_role','POST',{'target':a['id'],'new_role':'admin','grant_role':False},owner)
if __name__=='__main__':unittest.main()