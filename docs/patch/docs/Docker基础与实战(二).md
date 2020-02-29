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

**`chroot`**是在`unix`系统的一个操作，针对正在运作的软件进程和它的[子进程](https://zh.wikipedia.org/wiki/子进程)，改变它外显的[根目录](https://zh.wikipedia.org/wiki/根目录)。一个运行在这个环境下，经由`chroo`t设置根目录的程序，它不能够对这个指定根目录之外的文件进行访问动作，不能读取，也不能更改它的内容。

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



// todo

#### DockerFile

