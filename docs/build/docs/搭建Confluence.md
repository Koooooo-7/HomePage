## 搭建Confluence

Confluence是一个团队wiki管理工具，可以归纳整理很多内容。

系统  CentOS 7.2  
安装 Confluence 6.14.1  
**关闭Confluence**  ` sh /opt/atlassian/confluence/bin/stop-confluence.sh`  
**开启Confluence**  `sh /opt/atlassian/confluence/bin/start-confluence.sh`  
**重启Confluence**  `/etc/init.d/confluence restart`  

### 1.安装Mysql  
```sudo yum install -y mariadb mariadb-server```   
设置启动并且开机启动
```
$ sudo systemctl start mariadb  
$ sudo systemctl enable mariadb
```
###### 配置文件
解决中文乱码等问题


```
$ sudo vim /etc/my.cnf<配置文件，相当于windows的my.ini>
在[mysqld]下面添加如下
init_connect='SET collation_connection =utf8_unicode_ci'
init_connect='SET NAMES utf8'
character-set-server=utf8
collation-server=utf8_unicode_ci
skip-character-set-client-handshake
max_allowed_packet=256M
transaction-isolation=READ-COMMITTED
```
$ sudo vim /etc/my.cnf.d/mysql-clients.cnf ---> # 在[mysql]下面添加如下

    default-character-set=utf8

$ sudo vim /etc/my.cnf.d/client.cnf ---> # 在[client]下面添加如下

    default-character-set=utf8
进行安装配置  
```
$ sudo mysql_secure_installation  
Remove anonymous users? [Y/n] <– 是否删除匿名用户，回车  
Disallow root login remotely? [Y/n] <–是否禁止root远程登录,回车,  
Remove test database and access to it?[Y/n] <– 是否删除test数据库，回车  
Reload privilege tables now? [Y/n] <– 是否重新加载权限表，回车  
```
创建数据库、用户名和密码
`create databaseconfluence default character set utf8 collate utf8_bin;`

赋予confluence用户任意主机访问confluence数据库，密码是admin
```
grant all on confluence.* to 'admin'@'%' identified by 'admin';   允许远程登录
grant all on confluence.* to 'admin'@'localhost' identified by'admin';  允许本地登录
```
权限刷新
`flush privileges;`
查看用户表
`select user,host,password from mysql.user;`

### 2.安装JDK1.8
  之前有写过安装过程，[这里](/build/docs/安装JDK1.8u201.md)。
  
  
### 3.安装Confluence
参考https://blog.csdn.net/Dsky7/article/details/87717684
    https://blog.csdn.net/qq_34889607/article/details/81118106
下载，可以下载了传上去，也可以直接下载wget下载。  
`wget https://www.atlassian.com/software/confluence/downloads/binary/atlassian-confluence-6.14.1-x64.bin`

给予安装权限  
`chmod +x atlassian-confluence-6.14.1-x64.bin `  
进行安装`./atlassian-confluence-6.14.1-x64.bin `  
使用了`uses default settings`即1  
查看端口  
`lsof -i:8090`  
注意firewalld防火墙的8090端口有没有开放。  
此时访问服务器8090端口已经可以看到界面了。  


### 4.破解
```
参考https://blog.csdn.net/XunCiy/article/details/81981944  
    https://blog.csdn.net/Dsky7/article/details/87717684
破解的生成器：https://pan.baidu.com/s/1pJX9VjovMiTl0o1VyAaitw   m2jz   
具体破解步骤
运行confluence_keygen.jar，
将ServerID粘贴填入，
姓名Name、邮箱Email、组织Organization可随意填写，会作为系统信息显示，但不影响破解，
然后点击.gen!，生成key。
```
#### 生成破解文件
将/opt/atlassian/confluence/confluence/WEB-INF/lib/下的  
原
_atlassian-extras-decoder-版本可能不一样.jar_
（建议先拷贝个副本备份）  
我的为
_atlassian-extras-decoder-v2-3.4.1.jar_  
更名为atlassian-extras-2.4.jar  
然后点击.patch，并选择atlassian-extras-2.4.jar打开，<如果你不改这个名字，生成器也找不到你，找到了也报错。>  
提示Jar successfully patched，并且生成了一个.bak文件。  
把生成的atlassian-extras-2.4.jar改回原来的名字，替换掉/opt/atlassian/confluence/confluence/WEB-INF/lib/下的原文件。  
重启Confluence。  

然后继续安装，发现缺少mysql-connection-java的驱动jar包，  
根据Confluence[官网文档](https://confluence.atlassian.com/doc/database-jdbc-drivers-171742.html)说的，  
跑去阿里云的maven仓库下了一个5.1.42版本。

再用JDBC链接，账号root 密码123456  
测试链接发现报错 如下： 
~~不正确的隔离级别您的数据库必须使用'READ-COMMITTED'作为默认隔离级别~~  。
按照[官网文档](https://confluence.atlassian.com/confkb/confluence-fails-to-start-and-throws-mysql-session-isolation-level-repeatable-read-is-no-longer-supported-error-241568536.html)我发现my.cnf配置我已经设置了，就用了下面的另一个办法。  
更改JDBC链接方式 jdbc:mysql://localhost/confluence?sessionVariables=tx_isolation='READ-COMMITTED'
_参考https://blog.csdn.net/u013952133/article/details/81634978_

然后设置管理员账号，完成！！！



## 其他 
全局语言可以直接设置成中文，在右上角"管理应用"中的东西真的是一应俱全阿，和WordPress有的一拼。  
在健康检查的时候，发现在数据库检查中报错，表示max_allowed_packet和innodb_log_file_size设置过小。  
发现max_allowed_packet放错了地方，应该放在[mysqld]下面。  
参考https://confluence.atlassian.com/confkb/exceeds-max-allowed-packet-for-mysql-179443425.html  
而innodb_log_file_size的配置需要先删除两个原来的配置日志文件，再配置。  
参考https://confluence.atlassian.com/confkb/mysqlsyntaxerrorexception-row-size-too-large-658735905.html  

