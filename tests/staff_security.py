"""Live isolated staff checks. No owner or opportunity fixtures are retained."""
from account_security import AccountSecurity,call
import unittest
class StaffSecurity(AccountSecurity):
 def test_ai_limits_are_enforced_before_generation(self):
  a=self.users[0]
  settings=call('/rest/v1/ai_controls').json()
  if settings: self.skipTest('Use an isolated settings environment once owner controls are configured')
  self.assertGreaterEqual(call('/rest/v1/rpc/reserve_resume_ai','POST',{'mode_value':'summary','input_length':50001},a['headers']).status_code,400)
  try:
   for i in range(20):
    response=call('/rest/v1/rpc/reserve_resume_ai','POST',{'mode_value':'summary','input_length':100},a['headers'])
    self.assertLess(response.status_code,300)
    call('/rest/v1/rpc/finish_resume_ai','POST',{'request_id':response.json(),'request_status':'completed'},a['headers'])
   self.assertGreaterEqual(call('/rest/v1/rpc/reserve_resume_ai','POST',{'mode_value':'summary','input_length':100},a['headers']).status_code,400)
  finally: call('/rest/v1/ai_usage?user_id=eq.'+a['id'],'DELETE')
 def test_staff_permissions_and_document_privacy(self):
  a,b=self.users
  for user in [a,b]:
   self.assertFalse(call('/rest/v1/rpc/has_permission','POST',{'p':'admin.access'},user['headers']).json())
   self.assertGreaterEqual(call('/rest/v1/rpc/set_staff_role','POST',{'target':user['id'],'new_role':'admin','grant_role':True},user['headers']).status_code,400)
  for role,allowed in [('moderator',['admin.access','opportunities.manage']),('admin',['admin.access','opportunities.manage','sources.manage','audit.read','ai.manage'])]:
   self.assertLess(call('/rest/v1/user_roles','POST',{'user_id':a['id'],'role':role}).status_code,300)
   for permission in ['admin.access','opportunities.manage','sources.manage','audit.read','ai.manage','roles.manage']:
    self.assertEqual(call('/rest/v1/rpc/has_permission','POST',{'p':permission},a['headers']).json(),permission in allowed)
   self.assertGreaterEqual(call('/rest/v1/rpc/staff_directory','POST',{},a['headers']).status_code,400)
   self.assertGreaterEqual(call('/rest/v1/rpc/set_staff_role','POST',{'target':b['id'],'new_role':'admin','grant_role':True},a['headers']).status_code,400)
   resume=call('/rest/v1/resumes','POST',{'user_id':b['id'],'name':'Privacy check','content':{}},{**b['headers'],'Prefer':'return=representation'})
   self.assertEqual(resume.status_code,201)
   rid=resume.json()[0]['id']
   self.assertEqual(call('/rest/v1/resumes?id=eq.'+rid,headers=a['headers']).json(),[])
   call('/rest/v1/resumes?id=eq.'+rid,'DELETE',headers=b['headers'])
   call('/rest/v1/user_roles?user_id=eq.'+a['id']+'&role=eq.'+role,'DELETE')
if __name__=='__main__':unittest.main()