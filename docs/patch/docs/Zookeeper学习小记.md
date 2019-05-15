# Zookeeper学习小记

​        说到zookeeper，它的名字是因为当初它起源雅虎研究院内部一个研究小组，当时需要一个**通用的无单点问题的分布式协调框架**来让开发人员讲精力集中在处理业务逻辑上。然后跟以前的项目一样，本想给它也起一个动物的名字，然后开玩笑说，在这样下去这就变动物园啦!于是，它就真的成了动物园:smile:。

看了很多zk方面的资料，总结小记一下:rainbow:。

## 几个概念

*没事多记几个概念，没坏处。~*

- **CAP**   

  CAP原则又称CAP定理，指的是在一个分布式系统中，Consistency（一致性）、 Availability（可用性）、Partition tolerance（分区容错性），三者不可兼得

- **Paxos算法（协议）**

   莱斯利·兰伯特（Leslie Lamport，就是 LaTeX 中的"La"，此人现在在微软研究院）于1990年提出的一种基于消息传递的一致性算法。[Zookeeper全解析——Paxos作为灵魂](<https://www.douban.com/note/208430424/>)

- **拜占庭将军问题**

  拜占庭将军问题（Byzantine failures），是由莱斯利·兰伯特提出的点对点通信中的基本问题。含义是在存在消息丢失的不可靠信道上试图通过消息传递的方式达到一致性是不可能的。因此对一致性的研究一般假设信道是可靠的，或不存在本问题。[如何理解拜占庭将军问题？-知乎](https://www.zhihu.com/question/23167269/answer/134000043)

- **RMI远程方法调用**

  远程方法调用(Remote Method Invocation)。能够让在客户端Java虚拟机上的对象像调用本地对象一样调用服务端java 虚拟机中的对象上的方法。

  为什么要放在这里，是因为有看了一丢丢基于RMI和zk远程调用的实现。



## Zookeeper

下面来说几个基本的zookeeper的概念。

**Watcher**

Watcher（事件监听器），是Zookeeper中的一个很重要的特性。Zookeeper允许用户在指定节点上注册一些Watcher，并且在一些特定事件触发的时候，ZooKeeper服务端会将事件通知到感兴趣的客户端上去，该机制是Zookeeper实现分布式协调服务的重要特性。干这么说没什么用，直接上代码（`CuratorFramework`）放一个watcher进去的时候，再改变一下结点（`zkui`，一个zk可视化界面）后看控制台监听输出会比较有体会。

**Zxid**

基于Paxos算法，zk自己鼓捣出来了一套[ZAB协议](<https://www.cnblogs.com/stateis0/p/9062133.html>)，基于这个协议的实现中，它的事务ID就用Zxid表示。

这里就顺便简单说一下zk的集群架构下的选举，我印象最深的是下面几个小点。

- 选举采取半数原则，过半就OK，这也是ZK为什么最好是单数，根据2n+1原则，单数比2n+2节约呀。

- 选举的时候，看的是Server.id和Zxid，谁这俩综合起来大，谁得票就多，谁就NB做新leader。

- 在选举的事情没做完的时候，是不对外提供服务的。

  

![集群架构](_media\20190515-01.png)



在集群中存在的各个角色和主要工作如图。

![集群角色](_media\20190515-04.png)



**Znode**

顾名思义，就是zk里面的数据节点。

在zk中是以树形结构进行存储的，如图。

![树形结构](_media\20190515-02.png)



我们比如进入/app1/p_1看看它`get /app1/p_1`。

它长得是下面这个样子的（代码），简单注释。

```
my_data
cZxid = 0x47 // c -> create   
ctime = Sun Jan 20 10:22:59 CST 2019
mZxid = 0x47 // m -> modify
mtime = Sun Jan 20 10:22:59 CST 2019
pZxid = 0x4a // p->path   只与本节点（/app1/p_1）的子节点更新有关，与孙子节点无关。
cversion = 1    
dataVersion = 0
aclVersion = 0 // 节点ACL(授权信息)的更新次数.
ephemeralOwner = 0x0  // 该Znode节点状态，当为持久节点时是0x0，非持久化时为sessionID
dataLength = 7 // 存储的data长度 即 这里的 `my_data`
numChildren = 1
```

![](_media\20190515-03.png)

**Znode有4个可选的状态，这个是一定要记住的。**

- **临时节点（EPHEMERAL）**

  临时创建的，会话结束节点自动被删除，也可以手动删除，临时节点不能拥有子节点，这个一般就是。

- **临时顺序节点（EPHEMERAL_SEQUENTIAL）**

  具有临时节点特征，但是它会有序列号，分布式锁中会用到该类型节点。

- **持久节点（PERSISTENT）**

  创建后永久存在，除非主动删除。

- **持久顺序节点（PERSISTENT_SEQUENTIAL）**

  该节点创建后持久存在，相对于持久节点它会在节点名称后面自动增加一个10位数字的序列号，这个计数对于此节点的父节点是唯一，如果这个序列号大于2^32-1就会溢出。





## 其他

一个`help`助你玩转ZK:sunglasses:。  
*BTW:zk的指令比如删除节点等操作，是不支持通配符的...。*:alien:

```
当你已经通过 ./zkCli.sh -server yourip:2181进入zk后直接输入help即可看到（以下内容来自官网）
[zkshell: 0] help
ZooKeeper host:port cmd args
    get path [watch]
    ls path [watch]
    set path data [version]
    delquota [-n|-b] path
    quit
    printwatches on|off
    create path data acl
    stat path [watch]
    listquota path
    history
    setAcl path acl
    getAcl path
    sync path
    redo cmdno
    addauth scheme auth
    delete path [version]
    deleteall path
    setquota -n|-b val path

```

-----

## 参考

看了贼多的视频和论坛，确实是有些绕晕了，还是要慢慢的梳理（让我盗和谐图的参考如下）。

[Zookeeper初始](<https://github.com/Snailclimb/JavaGuide/blob/master/docs/system-design/framework/ZooKeeper.md>)

[Zookeeper数据模型]([https://github.com/Snailclimb/JavaGuide/blob/master/docs/system-design/framework/ZooKeeper%E6%95%B0%E6%8D%AE%E6%A8%A1%E5%9E%8B%E5%92%8C%E5%B8%B8%E8%A7%81%E5%91%BD%E4%BB%A4.md](https://github.com/Snailclimb/JavaGuide/blob/master/docs/system-design/framework/ZooKeeper数据模型和常见命令.md))

