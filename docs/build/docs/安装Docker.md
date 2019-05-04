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
据说稳定版好，然后我也就安装了一个稳定版本，指定版本安装。
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
