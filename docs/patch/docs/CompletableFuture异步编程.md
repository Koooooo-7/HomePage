# CompletableFuture异步编程

## 写在前面

>假期也能摸到好东西:dog:,使用的话目前还是应该以`JDK1.8`为准,不过要学着怎么用的更优雅才对:rocket:。


**Future模式的缺点**

`Future`虽然可以实现获取异步执行结果的需求，但是它没有提供通知的机制，我们无法得知`Future`什么时候完成。

- 要么使用阻塞，在`future.get()`的地方等待`future`返回的结果，这时又变成同步操作。
- 要么使用`isDone()`轮询地判断`Future`是否完成，这样会耗费`CPU`的资源。

**`CompletableFuture`简述**

>`Netty`、`Guava`分别扩展了Java 的 `Future` 接口，方便异步编程。
>
>Java 8新增的`CompletableFuture`类正是吸收了所有Google Guava中`ListenableFuture`和`SettableFuture`的特征，还提供了其它强大的功能，让Java拥有了完整的非阻塞编程模型：`Future`、`Promise` 和 `Callback`(在Java8之前，只有无Callback 的Future)。
>
>`CompletableFuture`能够将回调放到与任务不同的线程中执行，也能将回调作为继续执行的同步函数，在与任务相同的线程中执行。它避免了传统回调最大的问题，那就是能够将控制流分离到不同的事件处理器中。`CompletableFuture`弥补了Future模式的缺点。在异步的任务完成后，需要用其结果继续操作时，无需等待。可以直接通过`thenAccept`、`thenApply`、`thenCompose`等方式将前面异步处理的结果交给另外一个异步事件处理线程来处理。



## CompletableFuture
在使用的Demo上，我觉得这篇文章就已经包含了很多。

这篇文章的三节相当于就是`CompletableFuture`的`API`文档。

`《Java8新的异步编程方式 CompletableFuture》`。

- [(一)](http://www.imooc.com/article/21654)
- [(二)](https://www.imooc.com/article/21655)
- [(三)](https://www.imooc.com/article/21656)