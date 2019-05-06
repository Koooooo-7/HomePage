
### JIRA-CONFLUENCE 用户关联
1.在`JIRA>用户管理>Jira用户服务器`配置要连接的Confluence  
2.设置授权给Confluence的账号密码和Confluence的访问IP（因为没有在一台服务器上，所以加上了192.168.0.31）  
3.在`Confluence>用户目录`,添加目录JIRA Server（即登录时候的账号密码校验）设置连接地址。  
4.然后再回到JIRA中创建confluence-users和confluence-administrator组，和confluence的用户权限对应。  
加入confluence-users组的JIRA账号此时就可以登录访问confluence了。  

### JIRA-CONFLUENCE  内容动态关联
1.在`Confluence>应用程序链接`中输入JIRA所在服务器地址创建和JIRA链接，选择在JIRA中共享数据。  
2.同时在`JIRA>应用程序>应用程序链接`中也配置应用程序链接即可。 
此时Confluence中的评论或者更新动态会在JIRA中出现通知，并且可以在Confluence需求中划词提出JIRA ISSUSE等。  


[官方使用学习视频地址](http://www.confluence.cn/pages/viewpage.action?pageId=1671314)。

