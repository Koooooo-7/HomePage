# **在Docker中搭建Pg主从**

假装正式 :   编辑工具 **Typora**  
Docker中安装Pg的步骤在[这里](/build/docs/Docker安装PostgreSql.md)。

具体这次我们分四步走 ：

创建PostgreSql容器

- 配置前的准备工作
- 配置主库
- 配置从库
- 改成同步复制

------

## 创建PostgreSql容器

创建主数据库 pgmaster设置密码为password

容器5432端口映射到服务器54333端口上

```
docker run --name pgmaster -e POSTGRES_PASSWORD=password -p 54333:5432 -d postgres:10.7
```



创建主数据库 pgslave设置密码为password

容器5432端口映射到服务器54444端口上

```
docker run --name pgslave -e POSTGRES_PASSWORD=password -p 54444:5432 -d postgres:10.7
```

这时候通过`docker ps`可以看到两个服务已经启动了，而且也可以直接用远程工具链接了(记得防火墙开放端口)。

------

## 配置前的准备工作

其实就是知道这两个数据库分别的IP地址和配置文件地址。

主库IP信息

`docker inspect pgmaster|grep IPAddress`  (我的是172.17.0.2)

从库IP信息

`docker inspect pgslave|grep IPAddress`  (我的是172.17.0.3)

主库配置文件地址

`docker inspect pgmaster|grep Source`

我的是`/var/lib/docker/volumes/主库名称噼里啪啦一大串你懂的。/_data`

从库配置文件地址

`docker inspect pgslave|grep Source`

我的是`/var/lib/docker/volumes/从库名称噼里啪啦一大串你懂的。/_data`

------



## 配置主库

###### 创建角色

进入主库

`docker exec -it pgmaster  psql -U postgres -d postgres`

创建一个角色replication，用于给从库登录复制，密码设置为postgres。

`CREATE ROLE replication WITH REPLICATION PASSWORD 'postgres' LOGIN `;

检查用户是否创建成功`\du`看看数据库里面的用户。

或者在远程链接工具上看，比如Navicat。

###### 设置连接权限

进入主库的`pg_hba.conf`中加入下面这一行，干什么的你懂的。

`host    replication     replication     172.17.0.3/32           md5`

###### 设置开启流复制

进入主库的postgres.conf文件中，进行配置，在`REPLICATION`配置项附近喔。

设置`wal_level = replica`（我这里是开启注释即可）

设置`max_wal_senders = 10 `（我这里是开启注释即可）

重启主库服务重载配置`decker restart pgmaster`。

###### 进行主从库基础备份

这里是很重要的一步，我要做你的人，我不得一开始就一心一意和你一样阿对不对:dog:。

其实就是把主库`_data`目录下的东西同步(替换)到从库`_data`目录下面。

**首先**

写一个exclude.txt把不需要进行复制替换的文件名放进去。

`vim /tmp/exclude.txt`

放入如下内容,说明都是不需要进行同步过去的。

```
pg_hba.conf
pg_ident.conf
postgresql.conf
postmaster.pid
```

**然后**

开始基础备份

**开启主库备份**

进入主库中`docker exec -it pgmaster  psql -U postgres -d postgres`

执行`SELECT pg_start_backup('base', true);`

接着退出`\q`后，顺手关闭一下从库`docker stop pgslave`

其实一开始就没必要让从库跑起来，你看到这时候位置都没用过。`

**备份开始**

**rsync -ac 主库_data地址     从库_data地址   --exclude-form=/tmp/exclude.txt**

比如

```
rsync -ac /var/lib/docker/volumes/43926186a8fdbe5ac1900c338a3362616a893383a29ddd3878594fa3b2d446b5/_data
/var/lib/docker/volumes/43926186a8fdbe5ac1900c338a3362616a893383a29ddd3878594fa3b2d446b5/_data  --exclude-from=/tmp/exclude.txt
```

建议这里可以在主库放一个比如123.txt来标识验证一下有没有同步过去，同步过去了从库就应该有这个123.txt文件。rsync 这个有时候同步容易抽风。

**关闭主库备份**

进入主库`docker exec -it pgmaster  psql -U postgres -d postgres`

执行 `SELECT pg_stop_backup(); `即可。

------

## 配置从库

进入从库的配置文件地址，编辑`postgres.conf`。

设置`hot_standby=on` (我这里还是就打开注释即可)

保存退出后，直接在当前目录(`也就是当前的_data目录`)新建一个`recovery.conf`文件，内容如下，就三句。
[recovery.conf文件详解参考](https://www.cnblogs.com/kuang17/p/9492761.html)  

```
standby_mode = 'on'
//用于连接的信息，host主库地址 port主库端口  用于登录复制主库的用户  应用名称(为后面的同步流复制做准备)
primary_conninfo = 'host=172.17.0.2 port=5432 user=replication password=postgres application_name=rep1'

#trigger_file = '/path_to/trigger'  //被注释掉的一行，这一行用于创建出发文件，在主从切换时开启从库的读写
#recovery_target_timeline = 'latest' //寻找最新时间线
```

保存退出后重启从库`docker restart pgslave`。

进入主库执行` select client_addr,sync_state from pg_stat_replication ;`查看一下是否成功。

成功了应该就是这样的

| client_addr | sync_state |
| ----------- | ---------- |
| 172.17.0.3  | async      |

此时看到这个要注意是`async`，即我们的异步流复制已经配置完成！:white_flower:

------



## 改成同步复制

改成同步复制。

同步复制相对异步复制，对数据的一致性进行了保证。

当从库挂掉的时候，主库进行的操作会被挂起，等到从库完成才会算一次事务消息的完成。

 进入主库的配置文件postgres.conf。

设置`synchronous_standby_names = 'rep1'`即recovery.conf中的application_name名称，  

或者直接设置`synchronous_standby_names = '*'`即可，看注释就知道为什么啦。



我这里选择的是直接一个`*`解决问题。:smile:

重启主库`docker restart pgmaster`。

再次进入数据库查看，发现此时已经变成同步`sync`流复制了。

| client_addr | sync_state |
| ----------- | ---------- |
| 172.17.0.3  | sync       |

好了，就是这样，:cat:。

------

**参考**

- [主要参考](<https://www.cnblogs.com/cxy486/p/5164612.html>)
- [其他参考1](<https://www.cnblogs.com/mchina/archive/2012/05/26/2518350.html>)
- [其他参考2](<https://yq.aliyun.com/ask/3177>)

Tips:city_sunrise:

进入容器内部执行指令

`docker exec`  -it [参数]    [需要执行的 指令]。

比如进入从库里面。

`docker exec -it postslave   /bin/bash`


## 在不同服务器之间搭建主从
基本过程一致，默认的数据目录是在` /var/lib/pgsql/10/data/ `下。  
在进行基础备份的时候，在从库使用的命令是。
```
 pg_basebackup -h 192.168.0.* -U replication  -F p  -P -R -D /var/lib/pgsql/10/data/ -l replicationbackup 
 其中的192.168.0.*是主库IP地址 
```
基础备份完毕之后，从库这时候数据文件的默认权限是root，需要重新给到postgres用户。  
`chown -R postgres.postgres /var/lib/pgsql/10/data/ `
不然会无法重启从库。  
其他流程大致一样。  
更详细的配置可以在参考中了解。  
[参考1](https://blog.csdn.net/germany15914326114/article/details/81196778)
[参考2](https://www.cnblogs.com/aegis1019/p/8870251.html)
