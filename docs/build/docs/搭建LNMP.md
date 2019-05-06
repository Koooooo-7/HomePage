

服务器商  **阿里云**
服务器系统 **centOS 7.4**



想要先一步一步学习一下LNMP的搭建，没有去选择用一键安装包：）。
Bilibili上面也有一些视频。
https://www.bilibili.com/video/av7536809?from=search&seid=15982435309227651817
https://www.bilibili.com/video/av7536809?from=search&seid=4666953044647281697  

解决了解析php文件问题,他采用的是添加sever配置文件的方法
而我是直接在Nginx上直接改的配置。

## 1.安装epel源  
这Linux的一个基础扩展，含有一些安装包
`yum install epel-release`    //这里epel-release  没有空格。~

##  2.安装Nginx
`yum install nginx `
参考
https://www.linuxidc.com/Linux/2017-04/142986.htm

查看nginx 版本 ` nginx -v `  查看更多信息 ` nginx -V `

## 3.安装PHP

- 安装 php-fpm   PHP进程管理的一个东东
- 安装PHP7.0  ` yum install -y php70w-fpm ` 

php在centOS上自带的是5.4的版本，有些低了，
结果我还手贱给装上去了。
卸载掉` yum remove php* ` 
卸载参考  https://blog.csdn.net/u012569217/article/details/77506902
然后更换源，安装PHP7.1
参考

https://blog.csdn.net/anzhen0429/article/details/79272893
https://blog.csdn.net/qq_26245325/article/details/78916178

yum安装 php源
`rpm -ivh http://dl.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-5.noarch.rpm`

#### 安装PHP7

两种方式选一个即可

1.直接全部安装  `yum install php70w`  
2.只安装必要的东西 ` yum install -y php70w.x86_64 php70w-cli.x86_64 php70w-common.x86_64 
 php70w-gd.x86_64 php70w-ldap.x86_64 php70w-mbstring.x86_64 php70w-mcrypt.x86_64 php70w-mysql.x86_64 php70w-pdo.x86_64 php70w-fpm`

查看当前php版本
`php -v`

## 4.安装mysql 

参考 https://www.cnblogs.com/bigbrotherer/p/7241845.html
   1）下载并安装MySQL官方的 Yum Repository  
      ` [root@localhost ~]# wget -i -c http://dev.mysql.com/get/mysql57-community-release-el7-10.noarch.rpm `   
   2）`[root@localhost ~]# yum -y install mysql57-community-release-el7-10.noarch.rpm`  
   3）`[root@localhost ~]# yum -y install mysql-community-server`  这步可能会花些时间，安装完成后就会覆盖掉之前的mariadb。  
会直接覆盖掉centOS上自带的mariadb
我之前直接 yum install mysql 过:dog:...。

搭建完了之后就是Nginx的配置问题。  
**tips**: 每次操作完都要重启nginx  

``` 
systemctl restart nginx
service nginx restart
systemctl status nginx

```

**配置**

首先是在Nginx的location当中我试着改了一下根目录

```
location / {
       root /home/demo;
      index index.html;
}
```



然后在`/home/demo/index.html`中写入万能的"hello world!" 重启nginx 就OK啦！  

然后在里面我又新建了一个index.php  
这下就有问题了，出现的时候是页面没办法打开，而且直接给我把index.php下载下来了。  
原来是因为没有把.php的文件去配置进行解析。  
https://www.bilibili.com/video/av7536809?from=search&seid=4666953044647281697

需要在`/etc/nginx/nginx.conf` 中添加

```
location ~.php$ {
  root root/home/demo;
  fastcgi_pass 127.0.0.1:9000   #这是php-fpm 的监听端口
  fastcgi_index index.php;
  fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
  include fastcgi_params  #nginx的一个相关文件
  }

```

## 其他

查看监听端口 TCP/UDP  `netstat -tunlp`
查看监听端口TCP   `netstat -ntpl`