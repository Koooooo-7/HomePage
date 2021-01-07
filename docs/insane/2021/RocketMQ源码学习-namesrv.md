# RocketMQ源码学习-`namesrv`

## 概述

**`namesrv`模块下分为**

- `NamesrvStartup`

  解析命令行参数，获取配置信息，构造``NamesrvController`启动。

- `NamesrvController`

  Controller，接收相应的的请求。

- `kvconfig`目录

  `KVConfigManager`保存相关的映射参数。

- `processor`目录

  `netty`套壳。

- `routeinfo`目录

  管理相关的注册信息，包括`broker`,`topic`等等。