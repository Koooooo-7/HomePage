# MIT 6.824 Distributed System(Spring2020)

>  记录关于系统设计的内容学习，感谢教授🙏。
---
!> Resources:
 - TYB: https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB
 - GFS doc: https://pdos.csail.mit.edu/6.824/papers/gfs.pdf
 - CN translate: https://mit-public-courses-cn-translatio.gitbook.io/mit6-824/

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

- 对于`保活`的问题, 现在各种控制平面的出现和新的架构（k8s）, 提高到了另外一额层面。但与此同时，设计和时代局限性之间，关系却又没有那么大，和本身的业务需求和available的resource才是真正息息相关的。
 
- 对于`通信`的问题, 网络开销是绕不开的话题。两个方面去解决，一个是减少不必要的网络请求(cache, 自包含)，第二是轻量化协议。

- 对于`一致性`的问题，脱离业务去谈CAP的问题很没有意义，在很多时候的技术选型上，合适的才是最好的。