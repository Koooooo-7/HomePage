# 搭建自己的Git仓库。
  系统：centOS 7.2

### 基础认识
gitlab配置 /etc/gitlab/gitlab.rb
配置重载 gitlab-ctl reconfigure
启动/停止 sudo gitlab-ctl start/stop
参考当然是[官方文档](https://about.gitlab.com/install/#centos-7)啦。

步骤
1 安装依赖&&配置防火墙
```
sudo yum install -y curl policycoreutils-python openssh-server
sudo systemctl enable sshd
sudo systemctl start sshd
sudo firewall-cmd --permanent --add-service=http
sudo systemctl reload firewalld
```


顺便开启邮件服务直接用的postfix,发邮件稍后配置。
```
sudo yum install postfix
sudo systemctl enable postfix
sudo systemctl start postfix
 ```
2.添加Gitlab仓库
  安装包安装Gitlab
  ```curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.rpm.sh | sudo bash```
  这里可以设置页面端你要访问Gitlab的域名。
  ```sudo EXTERNAL_URL="http://192.1xx.xxx.xx.com" yum install -y gitlab-ee```
启动服务，是的，这样你就OK了！

另外的一点文档记录内容，感觉应该会用得上。
```
 配置gitlab使用非绑定的nginx（即使用自己服务器上装的nginx作为它的nginx给他使用）
 参考  https://docs.gitlab.com/omnibus/settings/nginx.html
      https://blog.csdn.net/qq_34894188/article/details/80468889
      按照官网的说明Using a non-bundled web-server 跟着步奏走：

1).Disable bundled Nginx  使绑定的nginx失效    

vi /etc/gitlab/gitlab.rb 添加：nginx['enable'] = false

2).Set the username of the non-bundled web-server user 设置gitlab的用户名为你的webserver

还是在gitlab.rb中添加：web_server['external_users'] = ['nginx'] 我的ngxin的用户名。
（For Debian/Ubuntu the default user is www-data for both Apache/Nginx whereas for RHEL/CentOS the Nginx user is nginx）

3).Add the non-bundled web-server to the list of trusted proxies  将你本地的webserver添加到gitlab的信任代理列表中

  还是在gitlab.rb中添加：gitlab_rails['trusted_proxies'] = [ '127.0.0.1' ](这里是一个数组，可以配置多个，我的就是本机ip)

4).(Optional) Set the right gitlab-workhorse settings if using Apache  (可选)设置gitlab的监听端口，我直接跳过了。

  还是在gitlab.rb中添加：

  gitlab_workhorse['listen_network'] = "tcp"

  gitlab_workhorse['listen_addr'] = "127.0.0.1:8181"  这里8181是默认的，所以你不想变的话，这个第4步是可选的

  到这里gitlab的配置就完成了，我们重载配置文件,执行命令：gitlab-ctl reconfigure等待完成。
```
   
### 配置gitlab 备份仓库
参考https://docs.gitlab.com/omnibus/settings/backups.html

1.更改备份目录（可选） 默认是/var/opt/gitlab/backups
2.执行
  参考 https://docs.gitlab.com/ee/raketasks/backup_restore.html
  #### 前期准备   
            sudo yum install rsync 安装一个必要的工具Rsync （实际上应该是自带了，但是我还是把它更新了。）
            确保tar的版本在1.3以上，我的源里面没有，所以单独去下载的tar-13.2的tar.gz包ftp传上去安装更新的。
            下载tar https://www.gnu.org/software/tar/ 官网 然后找镜像
            http://mirrors.ustc.edu.cn/gnu/tar/
            如果在编译安装的时候遇到 no acceptable C compiler found in $PATH 那可能是你没有安装gcc。
            安装完gcc发现报错
            configure: error: you should not run configure as root (set FORCE_UNSAFE_CONFIGURE=1 in environment to bypass this check)
            需要
            export FORCE_UNSAFE_CONFIGURE=1
            然后再./configure --prefix=/usr --bindir=/bin --libexecdir=/usr/bin一下，指明安装路径覆盖旧版本。
            可以make再make install了。
            检查tar 版本  tar --version
 #### 进行备份      
            直接执行sudo gitlab-rake gitlab:backup:create 进行备份 即在设置的目录（我设置的/home/gitlab/backup）下发现备份文件。
            
            恢复备份 参考https://docs.gitlab.com/ee/raketasks/backup_restore.html
            假设是在另外一台机器上（没有改配置文件的备份地址的话）,那么就要拷贝到/var/opt/gitlab/backups/这个默认目录。
            sudo cp 11493107454_2018_04_25_10.6.4-ce_gitlab_backup.tar /var/opt/gitlab/backups/
            然后授权给git用户
            sudo chown git.git /var/opt/gitlab/backups/11493107454_2018_04_25_10.6.4-ce_gitlab_backup.tar
            
            关闭以下两个进程
            sudo gitlab-ctl stop unicorn
            sudo gitlab-ctl stop sidekiq
            # Verify查看是否关闭成功
            sudo gitlab-ctl status
            执行备份
            sudo gitlab-rake gitlab:backup:restore BACKUP=时间戳-就是那个备份的文件-ee
            然后让你确认还是反悔，一路yes就好了。
            重启服务并检测配置文件。
            sudo gitlab-ctl restart
            sudo gitlab-rake gitlab:check SANITIZE=true
            
   
### 配置gitlab 备份配置文件 
    参考https://docs.gitlab.com/omnibus/settings/backups.html
    因为配置文件都在/etc/gitlab里面，所以直接就备份这一整个目录就好啦。
    直接当场打包成tar
    sudo sh -c 'umask 0077; tar -cf $(date "+etc-gitlab-%s.tar") -C / etc/gitlab'
    (我生成的文件名是etc-gitlab-时间戳.tar)
    
    周期性备份使用Crontab
    开启一个事务
    sudo crontab -e -u root
    例如：工作日天天早上备份（美国工作日周二-周六）
    15 04 * * 2-6  umask 0077; tar cfz /secret/gitlab/backups/$(date "+etc-gitlab-\%s.tgz") -C / etc/gitlab 
    这个需要参考Cron表达式（corn从左到右（用空格隔开）：秒 分 小时 月份中的日期 月份 星期中的日期 年份 后面跟上<执行权限，执行任务>）。
    

### Gitlab基础功能介绍
参考视频https://www.bilibili.com/video/av9310723


### Gitlab发送邮件（使用QQ邮箱）
和用Python/PHP/JAVA的工具包的设置项没有什么不同。
```
gitlab_rails['smtp_enable'] = true
```
官方手册调用的smtp.exmail.qq.con应该换成"smtp.qq.com"不然会一直SMTPAuthenticationError535报错。
~~gitlab_rails['smtp_address'] = "smtp.exmail.qq.com"~~
```
gitlab_rails['smtp_address'] = "smtp.qq.com"
gitlab_rails['smtp_port'] = 465
gitlab_rails['smtp_user_name'] = "xxxx@xx.com"
gitlab_rails['smtp_password'] = "password"(指的是授权码)
gitlab_rails['smtp_authentication'] = "login"
gitlab_rails['smtp_enable_starttls_auto'] = true
gitlab_rails['smtp_tls'] = true
gitlab_rails['gitlab_email_from'] = 'xxxx@xx.com'
gitlab_rails['smtp_domain'] = "exmail.qq.com"
```
测试发送
```
gitlab-rails console
irb(main):003:0> Notify.test_email('destination_email@address.com', 'Message Subject', 'Message Body').deliver_now
```
   
### Gitlab升级
[官方文档](https://about.gitlab.com/update/#centos-7)
1.备份
2.下载最新版本(升级)
    
