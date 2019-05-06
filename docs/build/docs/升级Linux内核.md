CentOS7.2 装过LDAP测试之后，就空下来的一台小机机。  
拿来装下Docker娱乐一下，可是官方要求的内核3.10以上(查看内核版本 uname -r)。  
很不巧，目前内核就是3.10，我就想~~重装系统~~升级内核呀！  
[参考1]（https://blog.csdn.net/kikajack/article/details/79396793）   
[参考2]（https://blog.csdn.net/qq_27281257/article/details/82049634） 

-----

### 1 升级yum仓库  
`yum -y update`  

### 2 安装elrepo的yum源
` rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org`  
`rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-2.el7.elrepo.noarch.rpm`

### 3 升级内核
在yum的elrepo源中有ml和lt两种内核，其中ml(mainline)为最新版本的内核，lt为长期支持的内核。
如果要安装ml内核，使用如下命令：
yum --enablerepo=elrepo-kernel -y install kernel-ml
如果要安装lt内核，使用如下命令：
yum --enablerepo=elrepo-kernel -y install kernel-lt

`yum --enablerepo=elrepo-kernel -y install kernel-ml`

### 4 修改grub.conf文件  
内核升级完毕后，需要我们修改内核的启动顺序，默认启动的顺序应该为1,升级以后内核是往前面插入为0，
打开并编辑 /etc/default/grub并设置GRUB_DEFAULT=0。
一般新安装的内核在第一个位置，所以设置default=0，意思是 GRUB 初始化页面的第一个内核将作为默认内核。  
看到了一个
`GRUB_DEFAULT=saved`  
改成
`GRUB_DEFAULT=0`  
接下来运行下面的命令来重新创建内核配置。
```
grub2-mkconfig -o /boot/grub2/grub.cfg
你会看到
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-5.0.7-1.el7.elrepo.x86_64
Found initrd image: /boot/initramfs-5.0.7-1.el7.elrepo.x86_64.img
Found linux image: /boot/vmlinuz-3.10.0-957.10.1.el7.x86_64
Found initrd image: /boot/initramfs-3.10.0-957.10.1.el7.x86_64.img
Found linux image: /boot/vmlinuz-3.10.0-327.el7.x86_64
Found initrd image: /boot/initramfs-3.10.0-327.el7.x86_64.img
Found linux image: /boot/vmlinuz-0-rescue-54590c1833e34b99ac2624f253601f2d
Found initrd image: /boot/initramfs-0-rescue-54590c1833e34b99ac2624f253601f2d.img
done
```
然后重启服务器`reboot`。

### 5 验证
重新检查内核版本 `uname -r`
我给升级到了 5.0.7-1.el7.elrepo.x86_64  
简直爆炸23333。

### 6 卸载旧的内核（略）
先让我去试试安装Docker:rocket:。

