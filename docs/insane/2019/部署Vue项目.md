# 部署Vue项目

##  打包

`npm run build`

然后会有`dist文件`。

##  采用Nginx部署

简单复习一下[Nginx安装](https://www.cnblogs.com/kaid/p/7640723.html)

- gcc 安装

```shell
yum install gcc-c++
```

- PCRE pcre-devel 安装

```shell
yum install -y pcre pcre-devel
```

- zlib 安装

```shell
yum install -y zlib zlib-devel
```

-  OpenSSL 安装

```shell
yum install -y openssl openssl-devel
```

- 在线下载安装nginx

```shell
wget -c https://nginx.org/download/nginx-1.10.1.tar.gz
# 解压
tar -zxvf nginx-1.10.1.tar.gz

cd nginx-1.10.1

./configure

# 编译安装
make
make install

# 相关操作
cd /usr/local/nginx/sbin/
./nginx 
./nginx -s stop
./nginx -s quit
./nginx -s reload

```

直接将打包的

`index.html`和`static文件夹`或者直接将`dist文件夹`丢到服务器上。

修改`nginx.conf`文件，把root目录指向index.html所在目录即可。



## 采用NPM部署

最靠谱的参考算是[这一篇](https://blog.csdn.net/lihefei_coder/article/details/90700965)了。

----

两个我都搭建了，之前还想安装tomcat搭建了一波，但是和打的Jar包自带的tomcat有丢丢冲突，没有继续折腾。

