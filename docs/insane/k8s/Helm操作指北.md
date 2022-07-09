# Helm 基础操作指北

> [Helm](https://helm.sh/)是一个基于k8s的构建和管理工具。
> [Helm命令行](https://helm.sh/zh/docs/helm/helm/)
## Helm 安装
```
brew install helm
```

## Chart 创建
```
helm create <chart-name>
```
## Template 检查
对于自己`Chart`的生成内容进行检查（`--dry-run`）。
```
helm template <chart-name>
helm lint <chart-name>
```