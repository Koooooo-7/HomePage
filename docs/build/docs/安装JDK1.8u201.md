## 1.清除服务器上的旧版本JDK
安装参考  
https://www.cnblogs.com/ocean-sky/p/8392444.html  
https://blog.csdn.net/fuyuwei2015/article/details/73195936
## 2.官网下载JDK
https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html <tar.gz文件>  

FTP传到`/home/java/`目录下
解压 `tar -zxvf  jdk-8u201-linux-x64.tar.gz`  

## 3.设置环境变量
```
vim /etc/profile
export JAVA_HOME=/home/java/jdk1.8.0_201
export CLASSPATH=.:$JAVA_HOME/jre/lib/rt.jar:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export PATH=$PATH:$JAVA_HOME/bin
```
## 4.生效配置  
运行：`. /etc/profile`           
注意：点和/之间有个空格   
然后`java -version `  
查看版本，安装完成。

