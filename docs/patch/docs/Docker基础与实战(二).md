# Docker基础与实战（二）

> 有了基于先有镜像来对容器生命周期的操作学习之后，开始构建镜像的学习。

## 再深入一点了解Docker

`Docker`对容器是实现是依赖于` Linux` 内核技术`namespace` 、`cgroup`  和 `chroot`。

### namespace对运行环境隔离

`namespace`是将内核的全局资源做封装，使得每个`namespace`都有一份独立的资源，因此不同的进程在各自的`namespace`内对同一种资源的使用不会互相干扰。

目前Linux内核总共实现了6种`namespace`：

- PID（Process ID）：进行进程隔离。
- IPC：管理进程间通信资源。
- NET（Networking）: 管理网络接口，隔离网络资源。
- MNT(Mount)：隔离文件系统挂载点，每个容器能看到不同的文件系统层次结构。
- UTS：隔离主机名和域名，内核和版本标识。
- User：隔离用户ID和组ID。

### cgroup对使用资源隔离

`Cgroup`（`control group`），属于`Linux`内核提供的一个特性，用于限制和隔离一组进程对系统资源的使用。这些资源主要包括CPU、内存、Block I/O和网络带宽。

`Cgroups`主要提供了以下四大功能:

- 资源限制（Memory）：对进程组使用的资源总额进行限制。
- 优先级分配（CPU）：并不能像硬件虚拟化方案一样定义`CPU`的能力。通过分配的CPU时间片数量及硬盘IO带宽大小，实际上就相当于控制了进程运行的优先级，也可以对进程组执行挂起、恢复等操作。
- 资源统计（Block I/O）：可以统计系统的资源使用量，如CPU使用时长、内存用量等等。
- 进程控制（Device）：可以对进程组执行挂起、恢复等操作。

### chroot

**`chroot`**是在`unix`系统的一个操作，针对正在运作的软件进程和它的[子进程](https://zh.wikipedia.org/wiki/子进程)，改变它外显的[根目录](https://zh.wikipedia.org/wiki/根目录)。一个运行在这个环境下，经由`chroot`设置根目录的程序，它不能够对这个指定根目录之外的文件进行访问动作，不能读取，也不能更改它的内容。

**`chroot命令`**用来在指定的根目录下运行指令。`chroot`，即 `change root directory`。在` linux` 系统中，系统默认的目录结构都是以`/`，即是以根 (`root`) 开始的。而在使用` chroot `之后，系统的目录结构将以指定的位置作为`/`位置。

注意，**`chroot`**在很多层面（比如网络层面）上并没有做到完全隔离。



## Docker镜像

> Docker的镜像文件是存储在镜像仓库的，其实它的形式上来说和`Maven`有些相似。

### 镜像原理

#### 联合文件系统(Union File System)

Docker的镜像实际上是一层一层的文件系统组成的，这种层级的文件系统就是联合文件系统。

加载过程：

- `bootfs(boots file system)`

  主要包含`bootsloader`和kernel，`bootloader`主要是引导加载`kernel`，Linux刚启动时会加载`bootfs文件系统`。**`在Docker镜像的最底层就是bootfs`**。`bootloader`主要是引导加载`kernel`，当`kernel`被加载到内存中后 `bootfs`就被卸载了。 

- `rootfs (root file system) `

  包含的就是典型 `Linux` 系统中的`/dev，/proc，/bin，/etc`等标准目录和文件。

> `rootfs在各种不同`Linux`发行版（centos`,`ubuntu`）中会有区别，而`bootfs`却可能是共用的。



在镜像加载的时候，是从底层往上一层一层加载的，并且这每一层是`可以被复用`的，就像是`Maven`仓库中拉下来的包，如果本地有，就直接用，没有再去仓库拉取。



### 创建镜像

#### 根据当前容器生成镜像

```shell
# 对当前的容器打成一个镜像名称为koyimage，tag为1.1
docker commit 容器ID/镜像名  koyimage:1.1
```

此时有一个名为`koytest1`的容器。

![](_media\20200229-01.png)

将容器名称为`koytest1`的容器打成镜像，查看镜像，发现镜像已经生成。

![](_media\20200229-02.png)



---
#### Dockerfile

[官网的地址](https://docs.docker.com/engine/reference/builder/)在这里放在最前面，表示尊重:cat:。

> `DockerFile`，简单来说就是根据配置文件去生成镜像，某些方面来说和`k8s`的声明式`yaml`很像:dog:。

对构建`Dockerfile`的几个建议：

- 尽量构建单独的镜像，不在一个Dokcerfile中构建多个，层次清晰。
- 不要在根目录`/`构建镜像，最好在一个单独的目录中，里面只有构建Dockerfile所需的相关文件。
- 通过`.dokcerignore`文件，将不需要的文件都排除出去，减少镜像体积。

下面介绍一下，构建`Dockerfile`经常使用的几个参数。

| 指令       | 简要说明                                                     |
| ---------- | ------------------------------------------------------------ |
| FROM       | 指定要创建当前镜像所使用的基础镜像。                         |
| MAINTAINER | 指定作者等相关信息，就是一个注释备注内容。                   |
| LABLE      | 相当于给这个镜像备注设置一些元数据信息。                     |
| ENV        | 定义的环境变量，可以在下文和容器中引用。在镜像启动容器后`env`命令可以查看定义的变量。 |
| RUN        | 在构建容器时要执行的命令。                                   |
| COPY       | 单纯把外部源文件拷贝进去容器的目的地地址。                   |
| ADD        | 把外部源文件（可以是连接）拷贝进去容器的目的地地址并解压。   |
| WORKDIR    | 设置进入容器后的`落脚点`。                                   |
| VOLUME     | 定义可以被外部挂载的数据卷。                                 |
| ONBUILD    | 当前容器被作为其他容器引用的基础镜像构建时执行的命令。       |
| EXPOSE     | 容器对外暴露的端口                                           |
| ENTRYPOINT | 指定容器启动程序及参数，在启动容器时添加的参数都会追加在后面。 |
| CMD        | 指定容器启动程序及参数，在启动容器时添加的参数命令会覆盖当前的命令。 |

> 当`ENTRYPOINT`和`CMD`同时存在时，`CMD`的内容就成了`ENTRYPOINT`的参数，即<ENTRYPOINT> "<CMD>"。

下面我们以[mysql的官方镜像](https://github.com/docker-library/mysql/blob/master/8.0/Dockerfile)`Dockfile`来解释一下（`其实debian的命令我也不太懂，主要看结构`）。

```shell
# 以debian的buster-slim版本的镜像为基础镜像。
FROM debian:buster-slim

# 运行命令添加相应的用户和用户组
# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN groupadd -r mysql && useradd -r -g mysql mysql

# 运行命令
RUN apt-get update && apt-get install -y --no-install-recommends gnupg dirmngr && rm -rf /var/lib/apt/lists/*

# 设置环境变量
# add gosu for easy step-down from root
ENV GOSU_VERSION 1.7
RUN set -x \
	&& apt-get update && apt-get install -y --no-install-recommends ca-certificates wget && rm -rf /var/lib/apt/lists/* \
	&& wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture)" \
	&& wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$(dpkg --print-architecture).asc" \
	&& export GNUPGHOME="$(mktemp -d)" \
	&& gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4 \
	&& gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu \
	&& gpgconf --kill all \
	&& rm -rf "$GNUPGHOME" /usr/local/bin/gosu.asc \
	&& chmod +x /usr/local/bin/gosu \
	&& gosu nobody true \
	&& apt-get purge -y --auto-remove ca-certificates wget

RUN mkdir /docker-entrypoint-initdb.d

RUN apt-get update && apt-get install -y --no-install-recommends \
# for MYSQL_RANDOM_ROOT_PASSWORD
		pwgen \
# for mysql_ssl_rsa_setup
		openssl \
# FATAL ERROR: please install the following Perl modules before executing /usr/local/mysql/scripts/mysql_install_db:
# File::Basename
# File::Copy
# Sys::Hostname
# Data::Dumper
		perl \
# install "xz-utils" for .sql.xz docker-entrypoint-initdb.d files
		xz-utils \
	&& rm -rf /var/lib/apt/lists/*

RUN set -ex; \
# gpg: key 5072E1F5: public key "MySQL Release Engineering <mysql-build@oss.oracle.com>" imported
	key='A4A9406876FCBD3C456770C88C718D3B5072E1F5'; \
	export GNUPGHOME="$(mktemp -d)"; \
	gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
	gpg --batch --export "$key" > /etc/apt/trusted.gpg.d/mysql.gpg; \
	gpgconf --kill all; \
	rm -rf "$GNUPGHOME"; \
	apt-key list > /dev/null

ENV MYSQL_MAJOR 8.0
ENV MYSQL_VERSION 8.0.19-1debian10

RUN echo "deb http://repo.mysql.com/apt/debian/ buster mysql-${MYSQL_MAJOR}" > /etc/apt/sources.list.d/mysql.list

# the "/var/lib/mysql" stuff here is because the mysql-server postinst doesn't have an explicit way to disable the mysql_install_db codepath besides having a database already "configured" (ie, stuff in /var/lib/mysql/mysql)
# also, we set debconf keys to make APT a little quieter
RUN { \
		echo mysql-community-server mysql-community-server/data-dir select ''; \
		echo mysql-community-server mysql-community-server/root-pass password ''; \
		echo mysql-community-server mysql-community-server/re-root-pass password ''; \
		echo mysql-community-server mysql-community-server/remove-test-db select false; \
	} | debconf-set-selections \
	&& apt-get update && apt-get install -y mysql-community-client="${MYSQL_VERSION}" mysql-community-server-core="${MYSQL_VERSION}" && rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/lib/mysql && mkdir -p /var/lib/mysql /var/run/mysqld \
	&& chown -R mysql:mysql /var/lib/mysql /var/run/mysqld \
# ensure that /var/run/mysqld (used for socket and lock files) is writable regardless of the UID our mysqld instance ends up having at runtime
	&& chmod 777 /var/run/mysqld
	
# 声明容器可以被挂载的数据卷
VOLUME /var/lib/mysql
# Config files
# 拷贝复制文件
COPY config/ /etc/mysql/
COPY docker-entrypoint.sh /usr/local/bin/
RUN ln -s usr/local/bin/docker-entrypoint.sh /entrypoint.sh # backwards compat
# 定义了一个要执行的脚本
ENTRYPOINT ["docker-entrypoint.sh"]

# 指定暴露出去的端口
EXPOSE 3306 33060
# 因为上面出现了ENTRYPOINT 此时CMD的命令成为了上面的参数
CMD ["mysqld"]
```

上述的[docker-entrypoint.sh](https://github.com/docker-library/mysql/blob/master/8.0/docker-entrypoint.sh)文件里面可以看到，在启动`mysql`前做了很多的工作为了确保可以启动起来。

### 创建自己的CentOS镜像

#### 编写`Dockerfile`

![](_media\20200304-01.png)

#### 生成镜像

> `docker build -f Dokcerfile文件地址  -t 镜像名词:tag  .`

指定Dockerfile（此时的Dockerfile有点小问题你发现了吗）构建了 `koy/image01:1.1`镜像。

![](_media\20200304-02.png)

此时发现镜像已经生成。:rocket:

![](_media\20200304-03.png)

接下来我们看看生成的镜像信息。

`docker [image] inspect koy/image:1.1`

![](_media\20200304-04.png)

![](_media\20200304-05.png)



#### 运行容器

> 我事先创建了一个容器数据卷`koy1`，现在启动时进行挂载。
>
> 添加了`/bin/bash`命令，是因为上面构建`Dockerfile`中的`CMD`命令少了`/`，直接翻车。:dog:

发现容器运行成功，文件也拷贝进来了，并且落脚点也是我们自己设置的`WORKDIR`。

![](_media\20200304-06.png)

再来看看此时容器的信息，发现容器的数据卷已经挂载上去了。

> `docker inspect koyctos`

![](_media\20200304-07.png)





### 总结

对于Docker的基本知识的掌握和使用进行了总结。

基本的常用的命令大致就是上面这些，但是在工程化时就会有更多复杂的配置需要去做了解。

然而对于容器编排，更多的应用，就期待我`K8s`的内容吧。:rocket:



---

参考 [Dockerfile指令详解 && ENTRYPOINT 指令](https://www.cnblogs.com/reachos/p/8609025.html)