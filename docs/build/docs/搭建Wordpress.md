搭建Wordpress我是用的LNMP，毕竟之前小站直接就搭好了这个。
当然直接用就好了:dog:。

## 1.下载Wordpress
`wget https://wordpress.org/latest.tar.gz`
解压  
`tar -xzvf lastest.tar.gz`



## 2.创建一个数据库给wordpress 
`create database wordpress;`  
然后去配置给wordpress；  
网上的教程都是去找wordpress目录下的wp-config.php ，但是我下载的版本是比较新的（?）吗，配置的文件是wp-config-sample.php。  

 问题:  
  我访问我的域名/index.php时，wordpress会有  
  `Your PHP installation appears to be missing the MySQL extension which is required by WordPress.`
  提示，我发现是mysql和php的扩展问题，这时需要去安装php-mysql 插件，还有在php.ini配置文件中改扩展的方法。  
  我是直接选择了安装插件`$yum install -y php-mysql`。  
  这时候又遇到了 `php70w-common conflicts with php-common-5.4.16-45.el7.x86_64`的问题，  这是因为有PHP5.4没有卸载干净的问题，这时候可以直接  `$yum install -y php70w-mysql` 指定要安装的版本就好了。  
  然后发现还是有这个问题，然后我就把php.ini的扩展也加上去了`  extension=mysql.os`   
  然后，重启了php-fpm和nginx，  
  然后就可以登录进去了，而且是全英文的。  
  按照步骤来结果说缺失了wp-config.php，我有点怀疑我是不是装了个假的wordpress，  
  然后看了他不能自动写入的内容的代码，说要我自己在目录下创建一个wp-config.php,  我发现就是wp-config-sample.php的内容，然后我就直接复制了这个并且重命名了，然后就好了。  
  之后就可以进入管理后台了。  
  至于到底是哪个地方出了问题，目前还有点迷...。  

   
## 3.汉化
    在wp-config.php中添加一行define('WPLANG', 'zh_CN');
    这时候发现后台"通用"配置有简体中文的选项，但是没有什么卵用。
    因为根本没有这个语言包，去哪换。
    但是会有更新提示，这时候需要ftp，当然，我已经把ftp关了很多年了。
    就想到绕过ftp的办法。
    1)将wordpress文件夹改为777权限
       sudo chmod -R  777 wordpress/    我的是 sudo chmod -R  777 html/
    2)  第一步：打开vim编辑器
       vim wp-config.php  
       第二步：键盘输入i，进行编辑，将下面代码放入wp-config.php文件中
       define("FS_METHOD","direct");
       define("FS_CHMOD_DIR", 0777);
       define("FS_CHMOD_FILE", 0777); 
       输入Esc之后输入：wq!退出vim编辑器
       
       然后点更新就可以直接更新了，然后我就把权限写回来只读444了。
