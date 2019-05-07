## 分布式数据库用Mysql还是PostgreSql，这是一个问题。

------

**PostgreSql10.7**   是我这次要安装的版本。

**系统** centOS7.2   内核在之前安装docker的时候让我给升级了。

------

## 安装Pg

- [x] 必要操作
- [ ] 可选操作

### 1. 安装官方的yum源   
- [x]  [选择你要安装的版本](https://yum.postgresql.org/) 我安装的是pg10
- [x]  [选择对应系统的yum源](https://yum.postgresql.org/repopackages.php#pg10)  右键复制选中的系统地址
  安装源  
  `yum install https://download.postgresql.org/pub/repos/yum/11/redhat/rhel-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm -y  `

- [ ] 查看可用的源 `yum list | grep postgresql`


### 2. 安装需要的包

- [x]  我们需要安装的是这两个： postgresql10-contrib 、postgresql10-server  
   `yum install postgresql10-contrib postgresql10-server -y` 

- [ ]  修改默认的数据目录存放当地  
-    默认
    Postgresql安装目录是  /usr/pgsql-10    
    Postgresql的数据目录是/var/lib/pgsql/10/data目录  
    具体修改步骤，请自己解决。:dog:

- [x]  初始化默认数据库 `/usr/pgsql-10/bin/postgresql-10-setup initdb`
    
- [x]  设置启动与开机启动  
- `sudo systemctl start postgresql-10`
- `sudo systemctl enable postgresql-10.service`
### 3. 登录postgresql并设置密码
- [x] 登录postgresql  
- 切换用户`su - postgres`此时会见到`-bash-4.2$`这个小东西时候直接输入下面这个小东东
- 输入`psql`进入数据库（postgresql在安装时默认添加用户postgres）
- [x] 设置密码
- `ALTER USER postgres WITH PASSWORD '你要设置的密码';`
- 退出`\q`,见到-bash-4.2$时候输入`exit`,即可退出。
- 其他指令`列出所有库\l  列出所有用户\du 列出库下所有表\d`

>安装完成！


### 4. 设置远程登录
- [x]  修改访问认证配置文件`vim /var/lib/pgsql/10/data/pg_hba.conf` 
- 改成我放在这里的这样即可。
```
  # TYPE  DATABASE        USER            ADDRESS                 METHOD

  # "local" is for Unix domain socket connections only
  local   all             all                                     peer
  # IPv4 local connections:
  host    all             all             127.0.0.1/32            ident
  # IPv6 local connections:
  host    all             all             ::1/128                 ident
  # Allow replication connections from localhost, by a user with the
  # replication privilege.
  local   replication     all                                     peer
  host    replication     all             127.0.0.1/32            ident
  host    replication     all             ::1/128                 ident
  host    all             all             0.0.0.0/0               md5     就加上这一行就好了！
  ```

- [x]  修改pg自己的配置文件`vim /var/lib/pgsql/10/data/postgresql.conf` 
- 改成我放在这里的这样即可。
```
  #------------------------------------------------------------------------------
  # CONNECTIONS AND AUTHENTICATION
  #------------------------------------------------------------------------------

  # - Connection Settings -
  #改这一行，把 localhost改成* ，开放端口监听，看注释写得很清楚
  listen_addresses = '*'          # what IP address(es) to listen on;    
                                          # comma-separated list of addresses;
                                          # defaults to 'localhost'; use '*' for all
  #打开端口                                      # (change requires restart)
  port = 5432                             # (change requires restart)
  max_connections = 100                   # (change requires restart)
  #superuser_reserved_connections = 3     # (change requires restart)
  #unix_socket_directories = '/var/run/postgresql, /tmp'  # comma-separated list of directories
                                          # (change requires restart)
  #unix_socket_group = ''                 # (change requires restart)
  #unix_socket_permissions = 0777         # begin with 0 to use octal notation
                                          # (change requires restart)
  #bonjour = off                          # advertise server via Bonjour
                                          # (change requires restart)
  #bonjour_name = ''                      # defaults to the computer name
                                          # (change requires restart)

  注意后面的  # (change requires restart)表示改完是要重启重新加载配置的。
```
- [x]  重启服务 `systemctl restart  postgresql-10.service` 
**远程连接问题解决！**  

------
开启扩展
------


### 开启UUID扩展 
- [x] 进入pg数据库
- [ ] 查看可用扩展 `SELECT * FROM pg_available_extensions;`
- [x] 启动/安装并启用UUID扩展
- 如果已经有uuid的扩展( ***uuid-ossp***)，直接启用`create extension "uuid-ossp" ;`
- 如果没有uuid扩展时，安装并启用`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
*注意点：*这只是对单个数据库进行了扩展安装和启用，所以要先切换到你需要安装的数据库中。
- [ ] 验证扩展安装 `SELECT * FROM pg_extension;`
既可在表中自定义默认值时设置uuid，比如说是***uuid_generate_v4()***。



------
### 参考内容
<i class="icon-share"></i> 安装Pg参考地址：[参考1](https://blog.csdn.net/rudy5348/article/details/79299162)  
<i class="icon-share"></i>安装uuid扩展参考地址:[参考1](http://www.cnblogs.com/WebClerk/p/4507863.html)

<i class="icon-pencil"></i>Markdown编辑器地址:[在线编辑器](https://www.zybuluo.com/mdeditor)
