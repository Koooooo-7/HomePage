要求Linux内核3.10以上，升级了Linux内核之后，安装Docker。
[官方文档](https://docs.docker-cn.com/)
[参考1](https://www.cnblogs.com/yufeng218/p/8370670.html)
[参考2](https://www.cnblogs.com/liuxiutianxia/p/8857141.html)

### 1 添加源
` yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo`  
这块可以换成国内的源，比如老马的  
`yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo`

### 2 查看源里可以安装的所有docker版本
`yum list docker-ce --showduplicates | sort -r`

### 3 选择特定版本安装
安装最新版`yum install docker-ce`  

不过据说稳定版好，然后我也就安装了一个稳定版本，指定版本安装。  
`yum install docker-ce-17.12.0.ce-1.el7.centos`


### 4 检查
启动并加入开机启动
`
systemctl start docker
sudo systemctl enable docker
看看版本，检查是否安装成功！
docker version  
`  
:dog: :dog: :dog:

---
> tips:  

- `yum-config-manager`找不到命令。

  缺少`yum-utils`包，安装`yum -y install yum-utils`即可。

- 在虚拟机安装没有网络时的解决办法。

  进入如下目录`cd /etc/sysconfig/network-scripts`，编辑`vi ifcfg-ens33`文件。

  将`ONBOOT`属性更改为`yes`。
  重启`reboot`即可。

  [解决办法参考](https://blog.csdn.net/weixin_44603091/article/details/96297867)  
- 准备工作。
  避免一些问题要先确保如`epel-release`源已安装或者更新，yum也已更新。

