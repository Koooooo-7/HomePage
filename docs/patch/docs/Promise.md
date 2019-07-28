# Promise

## 历史问题

说道为什么需要Promise，最容易提到的一个问题就是**回调地狱**:door:。

用最简单的方式来说，就是异步操作之间有依赖关系的时候，为了保证能有顺序的一次进行下去，那么，就会在异步操作中继续嵌套异步操作，示例一下。

```js
// 假设发起了一个Ajax请求。
$.ajax({
    ...
    ,success:function(res){
    // 后续操作依赖于成功之后返回的res中的data
    //那么就会在这里面继续写，我们夸张一点，要是再继续写一个ajax，以此类推，你懂的。
}
})
```

这样一层一层嵌套进去，万一来个地老天荒多不合适你说对不对。:dog:

于是，Promise就这样被推到了台前。

-----



## Promise的使用

使用可以参考这一篇[文档](<https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises>)和这个[文档](<https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise>)。

Promise有两个很关键的回调函数。

- resolve  成功的回调
- reject 失败的回调