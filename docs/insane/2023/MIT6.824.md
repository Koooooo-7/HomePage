# MIT 6.824 Distributed System(Spring2020)

>  记录关于系统设计的内容学习，感谢教授🙏。
---
!> Resources:
 - TYB: https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB
 - GFS doc: https://pdos.csail.mit.edu/6.824/papers/gfs.pdf
 - CN translate: https://mit-public-courses-cn-translatio.gitbook.io/mit6-824/

---

### MapReduce
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

