# Quick Start   *docsify*

## 安装使用

> 电脑系统  Windows8.1

### 安装nmp（nodejs）

- [官网地址](https://nodejs.org/en/)下载nodejs
- 安装，检测是否成功`CMD，node -v 和 npm -v命令`
- 打开命令行小黑框，即可进行nmp命令操作（环境变量安装时保证已经添加）。  

### 安装`docsify-cli` 工具

首先因为国内的问题，换掉npm的源到某宝。

```
`npm config set registry https://registry.npm.taobao.org `
```

检查换源是否OK(查看当前源地址)

```
npm config get registry 
```

安装docsify-cli工具( `-g` 全局安装)

```
npm i docsify-cli -g
```

看到安装效果如图。  
![](_media/install-docsify.jpg)  
安装完成！

### 使用指南

[docsify文档地址](https://docsify.js.org/#/)  

---

## 参与开发

> 相关指令可以看`package.json`文件中的`scripts`。

### 拉取依赖

**`npm run bootstrap`**

- 实际命令

  `npm i && lerna bootstrap && npm run build:ssr`

### 重新构建

修改代码后进行重新构建，如有如`themes`下主题`.css`缺失等问题，构建完毕后放入（偷懒）即可:dog:。

**`npm run build`**

- 实际命令

  `rimraf lib themes/* && run-s build:js build:css build:css:min build:ssr build:cover`

### 效果测试

**`npm run dev`**   
或直接  
**`npm run serve`**

- 实际命令

  `run-p serve watch:*`

  

