"""Live CMS access/operational checks with reversible settings, no opportunities."""
from account_security import AccountSecurity, call, PUB
import json, os, unittest, uuid
class WebsiteSecurity(AccountSecurity):
 def test_website_permissions_and_operational_enforcement(self):
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:
   owner={'apikey':PUB,'Authorization':'Bearer '+json.load(f)['session']['access_token']}
  a,b=self.users
  def rpc(name,body,headers=owner):return call('/rest/v1/rpc/'+name,'POST',body,headers)
  def permission(p,h):return rpc('has_permission',{'p':p},h).json()
  original=call('/rest/v1/website_settings?id=eq.true',headers=owner).json()[0]['value']
  page=call('/rest/v1/website_content?key=eq.about',headers=owner).json()[0]
  oldversion=call('/rest/v1/website_versions?key=eq.about&order=created_at.desc&limit=1',headers=owner).json()[0]['id']
  def role(r,on):self.assertLess(rpc('set_staff_role',{'target':a['id'],'new_role':r,'grant_role':on}).status_code,300)
  def content(action,value,version=None,h=owner):
   rows=call('/rest/v1/website_content?key=eq.about',headers=owner).json()
   return rpc('website_content_command',{'key_value':'about','content_value':value,'action_value':action,'expected_revision':rows[0]['revision'],'version_id':version},h)
  try:
   self.assertFalse(permission('content.manage',a['headers']))
   for table in ['website_content','website_versions','website_settings']:
    self.assertEqual(call('/rest/v1/'+table,headers=a['headers']).json(),[])
   self.assertGreaterEqual(content('draft',page['draft'],h=a['headers']).status_code,400)
   self.assertGreaterEqual(rpc('website_settings_command',{'settings_value':original},a['headers']).status_code,400)
   role('moderator',True)
   self.assertFalse(permission('content.manage',a['headers']))
   self.assertFalse(permission('site.manage',a['headers']))
   self.assertGreaterEqual(content('publish',page['published'],h=a['headers']).status_code,400)
   role('moderator',False);role('admin',True)
   self.assertTrue(permission('content.manage',a['headers']))
   self.assertFalse(permission('site.manage',a['headers']))
   self.assertGreaterEqual(rpc('website_settings_command',{'settings_value':original},a['headers']).status_code,400)
   draft={**page['draft'],'text':{**page['draft']['text'],'body':'CMS verification — restore immediately'}}
   self.assertLess(content('draft',draft,h=a['headers']).status_code,300)
   public=rpc('published_website',{}, {'apikey':PUB}).json()
   self.assertEqual(public['pages']['about'],page['published'])
   self.assertLess(content('publish',draft,h=a['headers']).status_code,300)
   self.assertEqual(rpc('published_website',{}, {'apikey':PUB}).json()['pages']['about']['text']['body'],draft['text']['body'])
   self.assertLess(content('restore',page['published'],oldversion,h=a['headers']).status_code,300)
   self.assertEqual(rpc('published_website',{}, {'apikey':PUB}).json()['pages']['about'],page['published'])
   role('admin',False)
   self.assertGreaterEqual(content('publish',page['published'],h=a['headers']).status_code,400)
   for settings in [{**original,'registrationEnabled':False},{**original,'maintenance':True}]:
    self.assertLess(rpc('website_settings_command',{'settings_value':settings}).status_code,300)
    if not settings['registrationEnabled']:
     email='wtw-closed-'+uuid.uuid4().hex+'@example.com'
     signup=call('/auth/v1/signup','POST',{'email':email,'password':self.password},{'apikey':PUB})
     self.assertGreaterEqual(signup.status_code,400)
     self.assertFalse(signup.json().get('access_token'))
     self.assertRegex(signup.json().get('msg',signup.json().get('message','')),r'Database error|Registration is currently closed')
     blocked=call('/auth/v1/admin/users','POST',{'email':email,'password':self.password,'email_confirm':True})
     self.assertGreaterEqual(blocked.status_code,400)
     self.assertRegex(blocked.json().get('msg',blocked.json().get('message','')),r'Database error|Registration is currently closed')
    else:
     self.assertFalse(rpc('website_available',{},b['headers']).json())
     self.assertTrue(rpc('website_available',{}).json())
     self.assertLess(call('/rest/v1/profiles?id=eq.'+b['id'],headers=b['headers']).status_code,300)
     self.assertGreaterEqual(call('/rest/v1/resumes','POST',{'user_id':b['id'],'name':'Maintenance denied','content':{}},b['headers']).status_code,400)
     denied=rpc('reserve_resume_ai',{'mode_value':'summary','input_length':100},b['headers'])
     self.assertGreaterEqual(denied.status_code,400)
     self.assertIn('Maintenance',denied.json().get('message',''))
    self.assertLess(rpc('website_settings_command',{'settings_value':original}).status_code,300)
   audit=call('/rest/v1/security_audit?action=in.(content.publish,content.restore,site.settings)',headers=owner)
   self.assertLess(audit.status_code,300);self.assertGreaterEqual(len(audit.json()),3)
  finally:
   rpc('website_settings_command',{'settings_value':original})
   content('restore',page['published'],oldversion)
   for r in ['admin','moderator']:rpc('set_staff_role',{'target':a['id'],'new_role':r,'grant_role':False})
if __name__=='__main__':unittest.main()
