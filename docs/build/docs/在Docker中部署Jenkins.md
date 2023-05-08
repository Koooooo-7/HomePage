# 在Docker中部署Jenkins

> 在Docker中部署Jenkins并不是一件很麻烦的事情，毕竟你都用了Docker了嘛。主要是记录采坑。

## 坑在前面

直接了当，说一下注意的坑的地方，其实主要是在WALL内的原因:dog:。

- 请自己在容器内部署好Java环境和Maven环境，并调整Maven中央仓库地址，添加镜像（比如阿里）地址。
- Java环境通常安装的镜像中会带OpenJDK，如果你觉得网不错，登录Oracle帐号让他下载，也不是不行。



## 安装

**拉取镜像**

```shell
docker pull jenkins
```

**启动容器**

```shell
docker run -dp 8040:8080 -v /data/jenkins:/var/jenkins_home --name jenkins01  jenkins
```

**解决目录授权问题**

```shell
chown -R 1000:1000 /data/jenkins
```

然后一路按照其推荐安装即可，然后登录就可以看到（我设置的用户就是`admin/admin`）。

由于我是在虚拟机内安装的，所以需要看一下虚拟机的IP然后在宿主机上访问。

```shell
ip addr
```



![](_media\20200727-1.png)

## 配置

现在是需要注意的地方，确认自己配置安装的Java和Maven环境后，配置关联的仓库。

- 仓库地址。
- 登录仓库的帐号/密码。

![](_media\20200727-2.png)

## 运行

配置完毕之后直接点击左侧`立即构建`即可。

![](_media\20200727-3.png)

## 其他

顺便记录一下采坑的图片。

- 登录了Oracle帐号，也下载不下来JDK，网不好。:dog:

![](_media\20200727-4.png)



- 没有改Maven的中央仓库地址，拉不下来依赖，网不好。:dog:

![](_media\20200727-5.png)


--- 

使用参考[Learn Jenkins! Complete Jenkins Course - Zero to Hero](https://www.youtube.com/watch?v=6YZvp2GwT0A)