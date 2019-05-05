### 1.进入gitlab配置文件gitlab.rb中配置
旧版：存在AD域认证不能在私有仓库环境下拉取代码的问题。
采用的是yml文件格式配置。
~~以下代码废弃~~
```
gitlab_rails['ldap_enabled'] = true  //开启 LDAP服务
gitlab_rails['ldap_servers'] = {  //服务配置
'main' => {
  'label' => 'GitLab AD',  //配置名称 自定义就好
  'host' =>  'mt.com',  // 配置域名
  'port' => 389,  // 389端口，如果使用SSL时用636
  'uid' => 'sAMAccountName',  //用户名属性
  #'encryption' =>'simple_tls',  //配置加密编码，未配置，即使用默认明文
  'verify_certificates' => false,  //是否开启证书验证 因为都没有用SSL颁发证书，所以false
  'bind_dn' => 'CN=mt,DC=mt,DC=com',    //配置登录AD域的认证用户名
  'password' => '******',  //配置用户密码
  'active_directory' => true,  //是不是使用AD域方式，true
  'base' => 'DC=dgyiheda,DC=com',  //基本DN，指明从哪里开始搜索
 #'group_base' => 'OU=Global Groups,OU=GitLab INT,DC=GitLab,DC=org', //指明搜索的组
 #'admin_group' => 'Global Admins'  //admin组，可配置使其也成为Gitlab上的Admin用户。
  }
}
```
~~以上代码废弃~~  

**重新配置**  
在girlab.rb( /etc/gitlab/gitlab.rb)中找到`### Gitlab自带的LDAP默认配置项的位置`进行如下配置，或者自己直接重新写也可以。
```
gitlab_rails['ldap_enabled'] = true   //开启 LDAP服务
gitlab_rails['ldap_servers'] = YAML.load <<-'EOS'  //服务配置
   main: # 'main' is the GitLab 'provider ID' of this LDAP server
     label: 'GitLab AD'  //配置名称 自定义就好
     host: 'gayhub.com' // 配置域名
     port: 389   // 389端口，如果使用SSL时用636
     uid: 'sAMAccountName'    //用户名属性
     bind_dn: 'CN=root,DC=gayhub,DC=com' 
     password: 'yourpassword'
     encryption: 'plain' # "start_tls" or "simple_tls" or "plain"  //配置加密编码
     verify_certificates: true  //验证证书
#     smartcard_auth: false
     active_directory: true  //是不是使用AD域方式，true
#     allow_username_or_email_login: false
#     lowercase_usernames: false
     block_auto_created_users: false
     base: 'DC=gayhub,DC=com' //基本DN，指明从哪里开始搜索
#     user_filter: ''
#     ## EE only
#     group_base: ''
#     admin_group: ''
#     sync_ssh_keys: false
#
#   secondary: # 'secondary' is the GitLab 'provider ID' of second LDAP server
#     label: 'LDAP'
#     host: '_your_ldap_server'
#     port: 389
#     uid: 'sAMAccountName'
#     bind_dn: '_the_full_dn_of_the_user_you_will_bind_with'
#     password: '_the_password_of_the_bind_user'
#     encryption: 'plain' # "start_tls" or "simple_tls" or "plain"
#     verify_certificates: true
#     smartcard_auth: false
#     active_directory: true
#     allow_username_or_email_login: false
#     lowercase_usernames: false
#     block_auto_created_users: false
#     base: ''
#     user_filter: ''
#     ## EE only
#     group_base: ''
#     admin_group: ''
#     sync_ssh_keys: false
 EOS
```
 
### 2.重新加载配置  
`gitlab-ctl reconfigure`
 
### 3.检查用户是否可以检出    
`gitlab-rake gitlab:ldap:check`


参考文档：  
https://docs.gitlab.com/ee/administration/auth/how_to_configure_ldap_gitlab_ce/  
https://docs.gitlab.com/ee/administration/auth/how_to_configure_ldap_gitlab_ee/  
https://www.linuxidc.com/Linux/2018-01/150516.htm  
