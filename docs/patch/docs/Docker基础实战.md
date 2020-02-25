# Docker基础与实战



## 走近Docker

首先在[Docker的官网](https://www.docker.com/why-docker)最显眼的 地方，放着这样一句话。

![docker](_media\20200220-01.png)

Docker是为了解决复杂（各种各样的接口，各种各样的生命周期等等）的应用部署问题，简化应用部署。

## 什么是容器

提到Docker，避不开的一个词就是**容器**（`container`）。

我们还是看[官网对容器的描述](https://www.docker.com/resources/what-container)。

![](_media\20200220-03.png)

> ### What is a Container? A standardized unit of software

**容器**是打包代码及其所有依赖项的标准软件单元，因此应用程序可以从一个计算环境快速可靠地运行到另一个计算环境。

Docker容器镜像（`image`）是一个轻量级的，独立的，可执行的软件软件包，其中包含运行应用程序所需的一切：代码，[运行时]([https://baike.baidu.com/item/%E8%BF%90%E8%A1%8C%E6%97%B6/3335184?fr=aladdin](https://baike.baidu.com/item/运行时/3335184?fr=aladdin))，系统工具，系统库和设置。

Docker容器的镜像在Docker引擎上运行时就会产生一个容器，不管在Linux或者Windwos平台上，都会保持一致，不会因为基础设施（操作系统等）而产生差异，因为都是运行在Docker自己维护的环境之中。

### Dokcer和传统虚拟机有什么不同

首先需要强调的是，他们并不是一个非此即彼的关系，他们可以结合在一起去适用于更复杂的业务场景。

依旧看[官网的解释](https://www.docker.com/resources/what-container)：

> 容器和虚拟机具有相似的资源隔离和分配优势，但功能不同，因为容器虚拟化了操作系统，而不是硬件。容器更加便携和高效。

![](_media\20200220-04.png)

| 容器（Container）                                            | 虚拟机（VIRTUAL MACHINES）                                   |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| 容器是`应用程序层的抽象`，将代码和依赖项打包在一起。多个容器可以在同一台机器上运行，并与其他容器共享OS内核，每个容器在用户空间中作为`隔离的进程`运行。容器占用的空间少于虚拟机（容器镜像的大小通常为几十MB），可以处理更多的应用程序。 | 虚拟机（`VMs`）是将一台服务器转变为多台服务器的`物理硬件的抽象`。虚拟机管理程序允许多个VM在单台计算机上运行。每个VM都是包含操作系统，应用程序，必要的二进制文件和依赖库的完整副本（占用数十GB）。此外 VM也可能启动缓慢。 |

## Docker常用命令

### 容器相关命令

#### 查看容器

```shell
# 查看当前正在运行的容器
docker ps 

# 查看所有容器，包含未运行的
docker ps -a

# 查看最近创建的容器，指定数量
docker ps -n 5
docker ps -n 5 -a

```

#### 操作容器的生命周期

```shell
# 启动一个新的容器
# 根据名称为image，版本为1.1的镜像创建一个容器并返回交互命令终端，映射容器端口9999到主机端口8888
# 映射容器的数据卷volume为主机目录/hostdir映射到容器内的/home/containerdir目录。
docker run -it --name=mycontianer -v /hostdir:/home/containerdir -p 8888:9999 image:1.1

# 启动一个停止了的容器
docker start 容器ID

# 重启一个容器
docker restart 容器ID

# 停止一个运行中的容器
docker stop 容器ID

# 杀死一个运行中的容器
docker kill 容器ID

```

> `stop`和`kill`的区别：
>
> `stop`是先发送`SIGTERM`信号，在一段等待时间之后再发送`SIGKILL`信号。`Docker`内部的应用程序接收到`SIGTERM`信号后会做“退出前工作”，比如一些保护性、安全性的操作，然后让容器自动停止运行。如果超过等待时间容器还没有退出则会再发送`SIGKILL`信号直接退出。
> ` kill`是直接发送`SIGKILL`信号，应用程序直接强制退出。

#### 删除容器

```shell
docker rm 容器ID
```



## 镜像相关命令

### 获取镜像

```shell
# 从远程仓库中搜索centos镜像
docker search centos

# 从远程仓库获取镜像，默认为latest
docker pull centos
```

 ### 查看镜像

```shell
# 查看查看本地镜像列表
docker images

# 查看本地镜像为centos的镜像列表
docker images centos
```

## 容器数据卷

### 概念

**`Volume`**

> [官网](https://docs.docker.com/storage/volumes/)：容器数据卷是用于持久化由Docker容器生成和使用的数据的首选机制（比较常用）。

简而言之，容器数据卷做的事情就是将容器内部的目录与宿主机的某个目录映射起来，该挂载的目录并不属于容器的生命周期，并且挂载目录内容增大并不会增大使用该目录的容器大小。

需要注意的一点是，我们使用Docker就是为了保证内部环境尽量不依赖外部基础设施，使得迁移更为方便。所以要注意，当你在创建容器时，如果明确指定了对应的宿主机目录时，如果在容器扩展迁移到另外一台机器上时没有对应的目录就会产生问题。

在指定挂载目录时候可以使用`-v` 参数，也可以使用`--mount`，他们的不同[官网这里](https://docs.docker.com/storage/volumes/#choose-the--v-or---mount-flag)有详细对比说明。

一般我使用的是`-v`所以就以此作为讲解。



### 创建数据卷挂载

- 先创建数据卷，然后进行挂载。

  ```shell
  # 创建一个名为koyvolume的数据卷
  docker volume create koyvolume
  # 查看已有的数据卷
  docker volume ls
  # 查看指定数据卷的详细信息
  docker volume inspect koyvolume
  ```



![1582641051136](_media\20200220-10.png)

![1582641196050](_media\20200220-11.png)

此时会发现定义的`volume`是要挂载宿主机的`/var/lib/docker/volumes/koyvolume/_data`目录。

```shell
# 运行一个centos的容器，指定容器名称为koytest0 将koyvolume数据卷挂载到容器内的/home/cv0/目录
docker run -it --name koytest0 -v koyvolume:/home/cv0 centos:latest
```



- 直接挂载目录

```shell
# 运行一个centos的容器，指定容器名称为koytest 将宿主机的/home/hv/目录挂载到容器内的/home/cv/目录
docker run -it --name koytest -v /home/hv:/home/cv centos:latest
```

> 请自觉先忽略掉中间的网络警告。:dog:

![](_media\20200220-05.png)

此时我们看一看容器内的目录信息，发现已经有了`/home/cv`目录。

![](_media\20200220-06.png)

同样的，我们退出（`Ctrl+P+Q`）容器看看宿主机目录，发现`/home/hv`目录也已经有了。

![](_media\20200220-07.png)

这样看可能不够详细和明确，我们来使用`docker inspect`看看容器的信息。

![](_media\20200220-08.png)

![1582640049936](C:\Users\Wood Zhuang\Desktop\HomePage\docs\patch\docs\_media\20200220-09.png)

此时发现对应的目录已经挂载上去了。:dog:

> 可以自己在宿主机和容器目录下分别创建点什么，看两边是否都有。

此时你注意到了，我们在看容器信息的`Mounts`时，还有一些参数，尤其是`RW`。

这个参数是为了指定挂载进去的数据卷对容器而言，是可读写（默认）的，还是只读（`ro`）的。

```shell
# 挂载数据卷到容器内，容器对该数据卷只能进行读操作
docker run -it --name koytest -v /home/hv1:/home/cv1:ro centos:latest
```

### 删除数据卷

由于数据卷并不会随着容器的结束而结束，所以当我们不需要这个容器卷时，我们需要对其单独删除。

```shell
# 删除myvolume
docker volume rm myvolume
```

![1582641998950](C:\Users\Wood Zhuang\Desktop\HomePage\docs\patch\docs\_media\20200220-12.png)

