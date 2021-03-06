# Happens-before

> 以下内容是对《Java并发编程的艺术》第三章`happens-before`部分的笔记。

## JMM设计

>  `Happens-before`是JMM最核心的概念。

在设计JMM时需要考虑两个关键因素：

- 开发者对内存模型易于理解和使用。希望基于一个强内存模型来编写代码。
- 编译器和处理器对内存模型实现时，希望内存模型的束缚越少越好，那样可以做更多的优化来提高性能。希望实现一个若内存模型。

所以，这就需要去找到一个平衡点，既能为开发者提供足够强的内存可见性保证，也能让编译器和处理器有尽可能的优化空间。所以就产生了如下的一个基本原则：

*只要不改变程序的执行结果，编译器和处理器如何优化都可以。*:rocket:

比如：

- 一个锁被认定只会被单线程访问时，这个锁可以被消除。
- 一个`volatile`变量只会被单个线程访问时，这个变量就当作一个普通变量来看待。



## Happens-before

### 定义

1. JMM对开发者的承诺：如果一个操作`happens-before`另一个操作，那么第一个操作的结果将对第二个操作可见。而且第一个操作的执行顺序排在第二个操作之前。
2. JMM对编译器和处理器的约束：两个操作之间存在`happens-before`的关系并不保证实际的执行顺序和1中保证的顺序一致。允许在不改变执行结果的情况下进行重排序。

> happens-before 关系本质上和as-if-serial语义是一致的，都是为了保证在线程中执行结果不被改变。

## 规则

- 程序顺序规则

  一个线程中的每个操作，`happens-before`于该线程的任意后续操作。（即保证和`as-of-serial`语义一样，在单个线程中，执行顺序看上去就像是写的代码顺序一样从上往下执行的。）

- 监视器锁规则

  对一个锁的解锁`happens-before`于随后对这个锁的加锁。

- volatile变量规则

  对一个volatile域的写，`happens-before`于任意后续对这个volatile域的读。

- 传递性

  如果A `happens-before`B，且B  `happens-before`于C，那么A  `happens-before` C。

- start()规则

  如果线程A执行操作`ThreadB.start()`（启动线程B），那么A线程的`ThreadB.start()`操作`happens-before`于B线程中的任意操作。（因为看起来太顺理成章而感觉有点像是废话:cat:）

- join()规则

  如果线程A执行操作`ThreadB.join()`并成功返回，那么线程B中的任意操作`happens-before`于线程A从``ThreadB.join`操作成功的返回。（因为`join`是该线程执行完任务才执行的嘛）



