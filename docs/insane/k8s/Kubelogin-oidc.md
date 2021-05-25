# Kubelogin - oidc

安装使用[Kubelogin](https://github.com/int128/kubelogin)认证插件访问远程k8s集群。

>  This is a kubectl plugin for [Kubernetes OpenID Connect (OIDC) authentication](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens), also known as `kubectl oidc-login`.

## 安装Krew

> K8s的包管理器

- 使用`brew`安装`krew`

​       ` brew install krew`

- 添加环境变量

  > 我是添加到了.zshrc下。

  `export PATH="${PATH}:${HOME}/.krew/bin"`

- 刷新

  `source .zshrc`或者重启终端。

  



## 安装插件

- 安装插件

    `k krew install ocid-login`

- 检查是否安装成功

    `k plugin list`
   成功应该输出插件信息

  ```shell
  /usr/local/bin/kubectl-krew
  /Users/koy/.krew/bin/kubectl-oidc_login
  ```

   

## 设置KUBECONFIG

- 设置`KUBECONFIG`配置文件。

​       `export KUBECONFIG=config--login.yaml`

- 检查是否配置完成

  `k config get-contexts`

- 设置当前context给oidc （Optional）

  `kubectl config set-context --current --user=oidc`

  

> Note:
>
> 先查看当前使用的上下文信息再看是否要切换context和设置context信息
>
> - 查看
>
>   `k config get-contexts`
>
> - 使用
>
>   `k config use-context xxx-context-name`



## 登陆

​     `k oidc-login`