# Project Loom: Fibers and Continuations for the Java Virtual Machine

> 翻译概述一下JDK21 虚拟线程的前身提议，`the Fibers`. 基于原文, 不谈JDK19也不谈zgc。:dog:
> 原文地址 [Project Loom: Fibers and Continuations for the Java Virtual Machine](https://cr.openjdk.org/~rpressler/loom/Loom-Proposal.html)
> [Loom - Fibers, Continuations and Tail-Calls for the JVM](https://openjdk.org/projects/loom/)
> [ytb-Java 21 new feature: Virtual Threads #RoadTo21](https://www.youtube.com/watch?v=5E0LU85EnTI)


## 概述
Project Loom主要是为了满足当今的大并发需求去更简单容易地编写，测试，观测和管理并发应用。
线程是在Java诞生之初就一直存在的一个解决并发问题方式,但是也相对死板，因为它当前的实现就是基于和操作系统
的内核线程一一对应的（不讨论绿色线程和操作系统的超线程虚拟线程问题）。
同时线程是按顺序执行的计算机指令序列。当我们进行一些比如IO， 暂停之类需要等待外部相应的操作时，线程应该要能够自己挂起，让渡出CPU资源。
并且能在外部响应返回时，继续后面的调用指令。
显然，这样对于当今的各种云服务来说是非常浪费计算资源的。所以现在想要引入一个被JVM管理的轻量级的高效线程，即Fibers。
Fibers由两个部分组成：

-  一个 Continuation 应该要能够按顺序执行指令并且能在需要的时候（阻塞调用时）挂起自己。
-  一个 Scheduler，能够将continuation分配给CPU调度，当遇到阻塞时可以转而调用两外一个continuation。当阻塞的continuation可以被恢复时，能够
  重新分配CPU继续调度。

目前Java已经有了一个非常棒的`ForkJoinPool`, 所以现在就需要在JVM中实现一个continuation就好了。
`ForkJoinPool`是一个`stealing-work scheduler`, 即首先是分而治之的思想（类似归并排序），其次是它会给
每一个工作线程一个单独的task队列自己消费自己的，但是当自己的消费完毕之后，会找其他未消费完的队列从`队尾`开始`偷`走task到
自己的队列中进行消费。


## 动机
现在很多应用都有计算资源的竞争问题，比如数据库请求，服务请求等等。但是比如servlet处理http请求之类的，都是提供了一个非常原始和简单的并发模型。
即现在的单线程模型，无法处理大量的请求，哪怕socket链接在操作系统层面可以支持上百万个请求。这样对于性能来说，就有一个非常大的损耗。
为了解决这样的问题，目前只能通过更改请求到达后面的代码做并发处理或者异步处理来达到高的相应，但是在请求接入这个地方依旧没有办法解决。
不过随着NIO等各种异步技术的引入，高并发的解决情况有了好转。但是对应的API缺并不是很好用（reactor之类），而且很难去维护和debug。
使用和内核线程想对应的线程模型，好处是可以直接使用一些native的API去操作线程，但是这样对于上面提到的问题来说，显然是一个需要解决的问题。
而Fibers的目的就是为了提供一种轻量级的线程，JVM层面的简单高效的API，对于各种同步，阻塞操作而言，几乎是无痛的。


> 这一段来自原文解释Threads的内容，但是我觉得他们的行文关联性不太好, 放在这里。
同时，为什么我们需要用户级线程而不是使用的原因：
- 当线程阻塞调用时候，操作系统的调度器转而调度其他线程，这时候就会发生一次上下文转换，这个开销不小。
- 操作系统的调度起是为了所有的线程调度的，但是在应用层面，可能一个线程是做计算操作，一个线程是做IO网络请求，这两个都使用的同一个
线程调度算法。在操作系统层面没有办法针对特定的应用进行优化。
- 很多时候，多个线程之间的处理，比如处理请求的线程A接受请求X处理X后交给后续业务线程继续操作时，如果B也是在同一个CPU核上的话，以为X已经在缓存中（L1），所以也会
  有性能提升。但是目前来说，通常会被调度到另外一个核上，而让缓存并没有什么效果。

## 目标和范围
Fibers主要的目的就是提供一个底层的轻量级线程的API，而不是为了提供上层的比如channel, actors或者dataflow的应用解决方案（库）。
因为这个引入是直接在JDK层面的，涉及到线程内存访问限制的问题，所以和其他相关的项目可能会相互影响。

一些想法:

- 一个简单的轻量级的线程抽象，能尽量少得需要对现在已有的线程模型相关的代码的改动。
- 给JDK提供一个新的纤程/协程（delimited continuation / coroutine)的实现，但是不一定会是一个开放的API。
- 需要有一个调度器(Scheduler), 目前觉得可以直接选择ForkJoinPool作为Fibers的调度器.

为了实现这些功能，显然要有一个可以操作JVM调用栈的能力（需要有能力把调用栈中某一个块提取出来和恢复的功能，因为Fibers是有栈协程）。
所以打算提供一个能力，称为展开和调用 (unwind-and-invoke)，或 UAI。

所以要引入的特性可能有如下这些:

- `Continuations` 和 `UAI` 会在JVM中实现，并且暴露出一个非常轻量级的Java API。
- Fibers会在JDK中作为一个库实现，但可能会需要一些JVM层面的支持。
- Java库中一些阻塞线程的native调用需要更改支持Fibers，如`java.io` 库。
- Debug, 分析和其他维护性的服务工具也需要看是不是可以使用Fibers进行优化，如 JFR，JVMTI和MBeans。 
- 目前在Java语言层面本身，不需要有改动。


## Fibers的设想

Fibers 是我们想要实现的用户态的线程。这里要讨论对其的观点和设计思路。
首先它要满足当前的线程模型的基本生命周期处理，比如`LockSupport's park/unpark`去实现挂起和唤醒。
同时兼容Thread的API避免带来过多的改动。

同时Fibers也会有一些特别的配置，比如它的调度器，以及它应该支持序列化。

因为Fibers是在被Java调度器调度，所以它不需要是GC root。它要么是runnable的，在被调度器件持有，要么是被阻塞它的对象持有以便可以unblock。
与此同时`ThreadLocal`也会有问题。当前我们使用`(Inheritable)ThreadLocal`通常是为了绑定当前的上下文，Fibers应该支持它, 但是会导致
非常多的线程对象被存储（后期估计打算用`ScopedLocal`解决）。另外一种是当作一个本地的CPU核心（因为当前
线程和CPU核心肯定在某一运行时刻绑定），但是这是一种滥用，如果`Fibers`要支持的话，可能要提供单独的操作处理器的API。

对于内核线程和Fibers来说，并不是非此即彼的。当你在使用Fibers做一些短而快的大吞吐io操作时，你会得到很大的性能提升。
但是在做一个耗时很长的计算的时候，其实和内核线程没有什么区别。内核线程采用时间片和抢占时处理，当Fibers调用都是很长时间的计算任务的话，没有任何调度器
可以优化此时的性能。所以在对于长时间的计算型任务，使用原来的Thread反而会更合适。
同时因为Fiber的引入，对于线程的操作比如`synchronized锁`或者`Object.wait`就会有一些不同。因为Fibers是在用户态而不是内核线程，但是当进行这样的调用的时候，
会导致内核线程的阻塞，但是我们相信`synchronized锁`这样的代码块一般是小而快的，而`Object.wait`一般也不常用。所以我们保留了在这些调用的时候对内核线程的阻塞。
如果要完全利用Fibers的特性在多线程竞争环境下不阻塞内核线程的话，应该优先使用`j.u.c `包（对Fiber友好）。同时，阻塞底层线程的时候，也可以触发`JFR/MBeans`的监控
事件。

此外Fibers也可以对现在已经存在的异步操作进行同步封装，即使用`park/unpark`阻塞当前的Fiber直到异步回调结束，这样可以很轻松的用Fibers来适配当前的异步代码。

## Continuations的设想

添加Continuations到Java是为了实现Fibers，但是也同时有更多的用处，所以Continuations应该会被
提供为一个开放的API(JDK内部)，而且是为更低层次的使用。

一个Continuations一定是可分割的，即是一个有`entry point`（入口）的子程序并且能够挂起或者重新执行。
当挂起时（suspension/yield point )，控制权会被交出，当重新恢复这个Continuation时，控制权会重新回到上一个退出
点（suspension/yield point）恢复现场并继续执行。

我们现在讨论的Continuations是`有栈`的，也就是说，可能会在任意嵌套深度的调用栈内阻塞。而`无栈`的协程只能在同一子例程中
进行暂停。同时，所有讨论的Continuations都是不可重入的，因为在任意栈深度内对当前Continuation的调用（即resumed）都会改变其的悬挂点。
即Continuations是有状态的。

目前主要的技术任务就是要实现Continuations，让HotSpot可以去捕获，存储和恢复调用堆栈的能力。而不是作为内核线程的一部份。（JNI 堆栈帧可能不受支持。）
同时，Continuations并不是线程安全的，跨内核线程之间的Continuations之间的调度对于内存可见性的保证，是由Fiber的实现来做的。

## 额外的挑战

如果需要支持Fibers的序列化和反序列化，需要引入类似于`parkAndSerialize, and deserializeAndUnpark`的方法。这样，可以实现在一个实例的
机器中暂停，并且在另外一个机器中反序列化后重启。这个特性在分布式系统中将会非常有用。比如可以让代码在更接近数据的地方运行，获取在FAAS服务中，当前需要等待
外部事件的时候挂起，并且在另一个物理机上在有需要的时候恢复。

为了实现Fibers可以序列化，那么Continuations应该也可以序列化才可以。如果他们可以序列化，那么我们应该可以让他最好也能够`克隆`，这样可以有
更多的可能性。但是在Continuations需要`clone`操作的时候,一个非常大的挑战是Java代码会存很多信息在对栈外（堆/堆外），这就需要`clone`在某种程度上`深度定制`了。

## 另外的途径

另外一种实现Filbers并提供简单和并发性的解决方案是同`C#`或者`Node.js`一样，使用`async/await`。这种方式其实主要就是利用了闭包，即只捕获自己单个子例程的上下文

但是通过`async/await`来实现的话，就会出现一个问题，即["colored function" problem](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/).
也就是同步代码和异步代码的不兼容性，当有一个地方使用了`async`,就意味着整个调用都应该是异步的（类似reactor）。


----

## 扩展阅读
[Java19虚拟线程来了](https://www.cnblogs.com/arthinking/p/16767213.html)

> 新的套接字实现：为了更好的支持虚拟线程，需要让阻塞方法可被中断，为此使用了[JEP 353](https://openjdk.org/jeps/353) (重新实现 Legacy Socket API) and [JEP 373](https://openjdk.org/jeps/373) (重新实现旧版 DatagramSocket API)替换了Socket、ServerScoket和DatagramSocket的实现。
虚拟线程感知：JDK中几乎所有的阻塞点，都做了虚拟线程判断，并且会卸载虚拟线程而不是阻塞它；
重新审视ThreadLocal：JDK中的许多ThreadLocal用法都根据线程使用模式的预期变化进行了修订；
重新审视锁：当虚拟线程在执行synchronized块时，无法从载体线程中卸载，这会影响系统吞吐量的可伸缩性，如果要避免这种情况，请使用ReentrantLock代替synchronized。有一些跟踪排查方法可以使用，具体阅读：[JEP 425](https://openjdk.org/jeps/425): Virtual Threads (Preview)#Executing virtual threads；
改进的线程转储：通过使用jcmd，提供了更好的线程转储，可以过滤掉虚拟线程、将相关的虚拟线程组合在一起，或者以机器可读的方式生成转储，这些转储可以进行后处理以获得更好的可观察性。
