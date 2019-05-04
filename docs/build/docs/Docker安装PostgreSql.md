# Docker安装PostgreSql.

------

先开始postgreSql的主从搭建，之后再分布式，服务器资源有限，我就想试试Docker行不行。

>**三步走的战略**
> * 安装镜像
> * 启动服务
> * 查看服务

------
- [x] 必须
- [ ] 可选

### 1. 安装Postgresql的Docker镜像

因为我之前安装的是PostgreSql10.7，所以这次就延续了这个版本。

- [x] 安装镜像 `docker pull postgres:10.7`
- [ ] [这里](https://hub.docker.com/_/postgres/?tab=description)可以查看Postgresql有哪些版本tag的镜像。
- [ ] [这里](https://docs.docker.com/engine/reference/commandline/pull/)是Docker的文档，夜晚模式很帅。
- [ ] 查看安装了哪些镜像 `docker image ls`。 


### 2. 启动Postgresql容器

- [x] 启动容器，命令是将容器的5432端口映射到服务器的54321端口，
并对默认的数据库postgres设置了密码为password。  ` docker run --name postgres2 -e POSTGRES_PASSWORD=password -p 54321:5432 -d postgres:10.7
`
- [ ] 查看容器运行状态   
```
 [root@centos-test2 data]# docker ps 
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                NAMES
25bd8203ca05        postgres:10.7       "docker-entrypoint.s…"   12 seconds ago      Up 11 seconds         0.0.0.0:5432->54321/tcp   postgres2
[root@centos-test2 data]# docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                NAMES
25bd8203ca05        postgres:10.7       "docker-entrypoint.s…"   33 seconds ago      Up 31 seconds         0.0.0.0:5432->54321/tcp   postgres2
```
### 3. 进入Postgresql看一看
- 在服务器上进去看一看 ` docker exec -it postgres2  psql -U postgres -d postgres`
- 远程连接(phpAdmin/Navcat)上去看一看,记得端口是54321不是5432，防火墙要放行端口。
<hr>

<i class="icon-desktop"></i> **安装完成！**
[主要参考](https://blog.csdn.net/chuckchen1222/article/details/82180514)

