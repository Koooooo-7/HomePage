# SSHPASS

在不同的服务器之间传输的时候SCP是一个很好用的命令，但是需要进行密码验证。

这里的解决办法有很多种，比如shell脚本的`except`，用Python的`pexpect`等等。

但是简单的业务逻辑复制的时候，这样有些麻烦，这时候**sshpass**你需要了解一下。

-----
### 安装  
```shell
yum install sshpass
```

### 使用
```shell
sshpass -p 明文密码 ssh [-p 端口，默认22时可不设置] 本地文件地址  登录用户@远程服务器IP地址:文件目录
```

示范一下。

```shell
sshpass -p 123456 ssh -p 1000 /home/123.txt  root@192.168.0.22:/home/backup
```

