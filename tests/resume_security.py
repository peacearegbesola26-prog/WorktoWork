"""Real two-account RLS checks for resume ownership; no opportunities are created."""
from account_security import AccountSecurity, call, PUB
import unittest
class ResumeSecurity(AccountSecurity):
 def test_resume_ownership(self):
  a,b=self.users
  response=call('/rest/v1/resumes','POST',{'user_id':a['id'],'name':'Private resume','content':{'summary':'Owner facts'}},{**a['headers'],'Prefer':'return=representation'})
  self.assertEqual(response.status_code,201)
  rid=response.json()[0]['id']
  path='/rest/v1/resumes?id=eq.'+rid
  self.assertEqual(len(call(path,headers=a['headers']).json()),1)
  self.assertEqual(call(path,headers=b['headers']).json(),[])
  self.assertEqual(call(path,'PATCH',{'name':'Intruder'},{**b['headers'],'Prefer':'return=representation'}).json(),[])
  self.assertEqual(call(path,'DELETE',headers={**b['headers'],'Prefer':'return=representation'}).json(),[])
  self.assertGreaterEqual(call('/rest/v1/resumes','POST',{'user_id':a['id'],'name':'Forbidden'},b['headers']).status_code,400)
  anonymous=call(path,headers={'apikey':PUB})
  self.assertTrue(not anonymous.ok or anonymous.json()==[])
  self.assertEqual(call(path,headers=a['headers']).json()[0]['name'],'Private resume')
  self.assertLess(call(path,'DELETE',headers=a['headers']).status_code,300)
if __name__=='__main__':unittest.main()
