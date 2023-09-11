# MIT 6.824 Distributed System(Spring2020)

>  记录关于系统设计的内容学习，感谢教授🙏。
---
!> Resources:
 - TYB: https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB
 - GFS doc: https://pdos.csail.mit.edu/6.824/papers/gfs.pdf
 - CN translate: https://mit-public-courses-cn-translatio.gitbook.io/mit6-824/
 - Labs https://pdos.csail.mit.edu/6.824/

---

## MapReduce
`MapReduce` 这个词其实并不陌生，即 `map` + `reduce`, 在代码里我们也会经常遇到。
```java
DemoList [DemoListItem, DemoListItem1]
DemoListItem { name: "foo"}
DemoListItem1 { name: "bar"}

final var result = DemoList.stream()
                .map(DemoListItem::getName)
                .reduce((a, b) -> a + "/" + b).orElse("");


result "foo/bar"

```

这其实是一种`转换`和`合并`的想法，原子操作简单化，然后大规模集群化提高性能。
不知道为何，这个结构让我想到了[`Mono`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Mono.html)和[`Flux`](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html). 用一种很trikey的方式解释，可以说`operator`做了`map`的事情，而最后的`completes` 也是一种`reduce`。


## GFS
> Google File System

关于这个论文，只能说我们现在是站在前人的肩膀上。很多想法和设计，包括对于如何提高系统的性能考虑，在现在的很多分布式系统上都有它的影子。

下面这些地方，让我有些感想。
- 对于`探活`的问题, 现在在Heartbeat的支持上，主要是通过各种通讯协议自定义化提高性能。

- 对于`保活`的问题, 现在各种控制平面的出现和新的架构（k8s）, 提高到了另外一额层面。但与此同时，设计和时代局限性之间，关系却又没有那么大，和本身的业务需求和available的resource才是真正息息相关的。我们真的需要这样真的“高可用”吗, 我们只有上最新的大的架构才能解决downtime的问题吗? 在这样的高可用下，我们的应用真的适配了吗（multi pod, shared memory, continuely rollout...）。或许带来的是额外的负担。
 
- 对于`通信`的问题, 网络开销是绕不开的话题。两个方面去解决，一个是减少不必要的网络请求(cache, 自包含)，第二是轻量化协议。

- 对于`一致性`的问题，脱离业务去谈CAP的问题很没有意义，在很多时候的技术选型上，合适的才是最好的。

## VMware FT

这个设计更偏向于在操作系统level对指令的编排和复现的主备结构，不太具有分布式意义。

## Raft
这是一个熟悉而又陌生的词汇, 它是一种复制`状态(state)`模型( event-driven, 哈！)。
Quorum思想: 即通过读写Quorum的重合，可以确保总是能看见最新的数据，但是又具备容错性。
主要的思想其实就是保证了在容错和一致性的基础上减少对性能的消耗和后续对脑裂的解决。
即 `少数服从多数`。

另外一个很重要的概念是`version`，这个在各种`新旧替换`之间起到了很重要的作用。
比如数据更新（Test-and-Set...），操作变更(乐观锁...)。
## ZK
关于ZK本身已经在[Zookeeper学习小记](patch/docs/Zookeeper学习小记.md) 中聊过了。
这里主要让我了解的是`zxid`,`顺序读写的保证`和`CP`的问题。
之前我们一直说注册中心里`Eureka`和`Zookeeper` 一个是`AP`, 一个是`CP`, 这个可以说基本是对的（如果`ZK` 一直是`sync()`的)。
但是在极端情况，client端保留了旧的`zxid`，并且Zookeeper的从结点也没有及时sync，这时还是会有不一致的问题。

一种 `优化过的链复制 CRAQ（Chain Replication with Apportioned Queries）`。

[High-throughput chain replication for read-mostly workloads](https://pdos.csail.mit.edu/6.824/papers/craq.pdf)

Ps:
```
传统的`Chain Replication`是这样一种方案，你有多个副本，你想确保它们都看到相同顺序的写请求（这样副本的状态才能保持一致），这与Raft的思想是一致的，但是它却采用了与Raft不同的拓扑结构。
首先，在Chain Replication中，有一些服务器按照链排列。第一个服务器称为HEAD，最后一个被称为TAIL。
**写入**
当客户端想要发送一个写请求，写请求总是发送给HEAD。
HEAD服务器执行完写请求之后，再将写请求向下一个服务器传递，以此类推，所有的服务器都可以看到写请求。
当写请求到达TAIL时，TAIL将回复发送给客户端，表明写请求已经完成了。
**读取**
对于读请求，如果一个客户端想要读数据，它将读请求发往TAIL,TAIL直接根据自己的当前状态来回复读请求。
```


## Aurura

> 其实现是基于MySQL的，同样的也是对`WAL`的log操作。为了提升性能，其存储服务器之间通信得到的只是用来描述data page更新的Log。
这个算是一种数据库读写分离集群化，容错问题的演进过程产品。
```
Quorum系统要求，任意你要发送写请求的W个服务器，必须与任意接收读请求的R个服务器有重叠。这意味着，R加上W必须大于N（ 至少满足R + W = N + 1 ），这样任意W个服务器至少与任意R个服务器有一个重合。
从多个服务端读取数据，可能会得到新旧两个不同结果，它们有着不同的版本号，客户端会挑选版本号最高的结果。

```

---
[分布式系统论文](https://zhuanlan.zhihu.com/p/34427903)