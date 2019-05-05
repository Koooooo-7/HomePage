# 在Docker中玩一下Metabase。

之前拿Python玩过这样的东西，莫名还是想要玩一下下阿，之前猪场的`有数`或者其他的倒是没这么大兴趣。

毕竟这可是GayHub主页上推送的一个数据可视化工具，直接连接数据库，可以对数据从多个角度透析阿:smile:。

[Metabase是什么？](https://metabase.com/)

#### 安装Metabase

超级简单和方便的一行命令，就帮你把镜像下载下来并且跑起来了(默认端口3000，记得防火墙开放端口。)

`docker run -d -p 3000:3000 --name metabase metabase/metabase`

你会看到的东西。

```
Unable to find image 'metabase/metabase:latest' locally
latest: Pulling from metabase/metabase
cd784148e348: Pull complete 
35920a071f91: Pull complete 
1a5149a464dd: Pull complete 
8ebbf3a20cc2: Pull complete 
421360db25e9: Pull complete 
1ecf2a3cd719: Pull complete 
7951b2d5da7f: Pull complete 
f0d9aa2069ec: Pull complete 
b6babcbaadc4: Pull complete 
Digest: sha256:5393dd8a40bd0f9821bbb770b4f3b77480abd7810d8c76947274aafd2b43ada8
Status: Downloaded newer image for metabase/metabase:latest
a7652d1894196420cd2efa791c909708e69d479343f02505df9fbe0e71123108

```

然后检查一下有没有正常跑起来`docker ps`。

然后直接打开一个浏览器，输入`http://192.168.*.*:3000`你的IP地址就可以访问啦。



#### 页面操作

中文超级简约的操作界面，Nice:white_flower:。

###### 1.设置基本信息

需要进行设置，写你的名字阿，邮箱阿，密码阿，部门阿，balabala，我就随意这么一写。

###### 2，添加你的数据

其实就是关联一下你自己的数据库，Mysql阿，Pg阿什么的，你自己选择。

###### 3.数据引用

官方想要获取信息拿到用户体验balabala，以及订阅他们的推送，看你自己。
我就直接接一下我本地安装的pg就完事数据库了呗，或者选择等下再添加数据源。

但是我不这么干，我要连接到我电脑本地的mysql！

首先就是要mysql开放权限允许远程嘛(记得windows的防火墙端口开放3306喔。)

`cmd`->`mysql -u root -p回车`常规操作进入mysql。

然后选择mysql自己的库`use mysql`回车，就好啦。

看看都允许了哪些链接`select host, user from user;`

都是`localhost`纳尼:question:。

然后就是加入远程连接啦。

- 最简粗暴的办法是这样的

```
允许任何用户使用 root/密码 连接
grant all privileges on *.* to 'root'@'%' identified by '密码' with grant option;
flush  privileges;
```

- 文明一点是这样的

```
允许用户root从ip为192.168.1.3的主机连接到mysql服务器，并使用root作为密码
grant all privileges on *.* to 'root'@'192.168.1.3' identified by 'root' with grant option;
flush privileges;
```

- 再谨慎一点是这样的

```
允许用户root从ip为192.168.1.3的主机连接到mysql服务器的dk数据库，并使用root作为密码
grant all privileges on dk.* to 'root'@'192.168.1.3' identified by 'root' with grant option;
flush privileges;
```

记得后面的`flush privileges;`很重要。

供你选择。

我选择的是`grant all privileges on metabase.* to 'root'@'192.168.*.*' identified by '123456' with grant option;`:dog:。

刷新权限`flush privileges`;



然后点击

**带我去Metabase** !



#### 好像没什么可说的

进去一看，我的天，纯中文界面，友好的要死:basketball:。

自己定义维度，还支持原生查询。

话不多说，自己体验吧，哈哈哈，我好像一个营销号阿:dog:。







