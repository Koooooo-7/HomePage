# 0513-Kafka学习小记

kafka单从基本使用上来说，结合业务场景应该都能搞定:dog:。

但是只有知道后面的原理，才更明白为什么有这么些配置项以及配置项为什么这么配。

学习kafka的基本知识，发现还是消费者这一块有点绕，总结一下。


## Kafka的性能优化 （update）
> 回头看写的东西，确实深度有限...

### 技术上
这个更侧重于Kafka本身的调优，尤其是在Cloud上。
- 首先要确定的是，Kafka在网络socket相关层面都默认会采用系统的配置，所以部署相应服务时候，需要清楚自己的容器内的系统配置size，避免用了某个特别的基础镜像
  出现一些低吞吐的奇怪的问题。所以对于默认的socket缓冲区，链接等，也有可能存在优化空间。
- 在Pod部署上，对于rebalance其实在敏捷开发下是一个经常性的问题，因为rollout发生的更加频繁。这时候使用静态成员策略`group.instance.id`或许是一种选择。但要
  解决在多环境内，不同数量的Pod实例的问题。如果是在有HPA之类scale逻辑时候的处理可能问题更大。
- 至于Kafka集群本身，目前云厂商会有专门的调优，倒是用担心，不然在`ISR`配比，controller的配置上，也要坑一波...。

### 业务上


集群服务端：
控制数据刷盘的时间`log.flush.interval.ms`可以在某种极端情况下保证重要数据的安全性，如果不是硬盘损害的假设下。
针对不同的业务类型，是否可以对日志进行压缩而不是清理，以及对应的频率设置。
数据压缩，针对如果不是完全要求连续性数据，而是要求在时序性上最终状态可重放的话，可以开启压缩，来减少实际消费的offsets，
通过控制压缩延迟时间`min.compaction.lag.ms`来控制压缩率。同时其他的清理日志的保留窗口时间也可以·根据业务相应调整。

发送者端：
Kafka 的设计上就是一个`poll模型`，在业务上通常我们一般想到的就是添加partition让其吞吐更大，落partition的key更均匀，而不是采用默认的`粘性分区策略`。
但是根据业务来说，不一定所有的业务都适用的。
可能你可以在业务上对某个/某些partition做处理，剩下的做均衡，保证了一个topic中不同kind的业务数据类型的分类。也许你可以说放在另一个topic里面做完全隔离，
那也是一种解决办法。但是这并不能说Customize Partitioner就不是一种解决办法。尤其是通过解藕做异步notification时候，部分消息类型有优先级问题时。
同时，发送的`batch.size`也可以根据业务进行调整，来取得更大的吞吐，如果是间歇性的高消息流, 则要搭配`linger.ms`避免在低消息时等待的延迟时间过长。

同时在`max.request.partition.size`上可能需要进行配置（默认大小是1M），并且相应配置`max.request.partition.size`，尤其是某些数据集成时候有大对象时。但也许你应该优先开启`compression.type`压缩并设计对应的压缩级别`compression.压缩类型.level`（`compression.gzip.level`）。

消费者端：
如果吞吐有限，在拉取数据的的时候是可以做到调节到消费者和调用的业务接口I/O都到一个相对舒服的状态的，拉取的时候`max.poll.records`, 同时配合`fetch.max.bytes（默认50M）`和``。 通过。
另外，虽然说Kafka本身都是使用二进制进行交换的，但是数据本身的序列化时间和序列化方式，也会影响很多性能。
如果使用`json`做序列化，会换来可读性和可见性，但是占用的体积也更大。



## 为什么要用消息队列

**解耦**   不同应用间不直接通信交互，采用消息队列订阅和发布，生产和消费。

**异步**   异步非阻塞的交互模式，提高应用响应。

**削峰**   将消息队列近似作为一个缓冲区，减少峰值变动时对数据库等的鸭梨。

-----

## 几个概念

**broker**  Kafka实例，基本上可以理解成在一个集群中，一台服务器就是一个Kafka实例，一个broker。

**topic** 话题。通常是以业务区分，简单说就是一个大桶，topic name就是这个大桶上贴的名字，所有这个业务相关需要进行处理的队列信息都会丢到这个里面。

**partition** 分区。为了实现均衡负载和高可用，一般将topic分成多个区，放在不同的broker中。其实就是topic这个大桶中的小桶。但是，并不是每个broker中分别放一份单独的，那样一个挂掉了，那一份分区就丢掉了，显然不合适，所以有了复制replica的概念，在不同的broker上会保留一份，具体复制多少份自己设置，但然最保险的就是有多少台broker就复制多少份。
其实Kafka处理的粒度就是partition level, 更确切的说，就是（Topic, Partition-n）对应的LOG。

**每一个分区只能被一个同组消费者消费**。

同时，消息来到的时候，在非指定情况下放到哪个partition中是变化的，但都是以队列的形式追加在后面。

引入了*offset*的概念，老版本这个偏移量是丢zk里面，现在kafka自己干这个事情（`__consumer_offsets`）。
同一个topic多个partition共享一个`__consumer_offsets`。


![官网图源](_media\20190513-01.png)


**producer** 消息生产者，略。
对于默认何如发送到哪个partition的数据的behavior也不一样，默认采取粘性分区策略，即尽量放在一个partition里面。
不过也可以根据配置来更改这个行为，例如，如果指定了消息的key，则会对key做hash后再对分区数取模，这样就可以设置同一个key的时候保证消息会放到同一个分区内。

**consumer** 消费者，其实可以看成是只有一个消费者的消费者组。

**consumer group** 消费者组，划重点，等会主要说说它。

-----

##  topic与broker

首先我们就看一下这个命令。  

`bin/kafka-topics.sh --create --bootstrap-server 192.168.0.87:9092 --replication-factor 3 --partitions 3 --topic  test-topic ` 

将test-topic一分为3，并且要求复制三份（每个分区会有3份）。

![](_media\20190513-04.png)

可以看到此时`Replicas`中，3个broker中都分别有各`Partition`的备份，画图大概是这个样纸。

![](_media\20190513-05.png)

值得注意的是，在Kafka中，只会和每一个分区的leader打交道，至于同步问题，那是leader去干的事情。

如果leader挂了，那就会重新选举出来一个leader，具体情况，有点复杂:rofl:。

-----

## Consumer 与 Consumer Group

![](_media\20190513-06.png)



解释一下官网的这张图。

有一个topic，我不知道他叫啥，我就叫**小T**吧。

**小T**把自己拆分成了四个分区，但是在这个kafka集群就俩broker。于是分区（P）0和3放在了server1（broker1）中，分区（P）1和2放在了server2（broker2）中。

然后有两个消费组（Consumer Group A 、Consumer Group B）都订阅了**小T**，这时候可以发现，不管是GroupA还是GroupB，拿到的都是**全量的小T**（所有分区都拿到了）。

从GroupA来看，**小T**的分区被里面的消费者 C1 和 C2均分了，且互不会消费对方的分区。

从GroupB来看，**小T**的分区也被里面的消费者均分了，因为刚好4个消费者，一人一份，也就是说，如果GroupB有5个消费者的话，就会有一个是“打酱油的”。

这就是消费者和消费者组去消费一个topic的基本说明。

-----

## 消费者组 Consumer Group

当消费者组里有多个消费者，然后还订阅了多个不同的topic的时候，要保证可用性和可扩展性也是有招数的。

这里要说一个叫做**rebalance**的东西，见名知意，就是用来重新保持平衡的，本质上是一种协议。

这里针对的主要是消费组里面的两种情况。

- 有新的消费者加入。

- 有组内消费者挂掉。

这时候，有一个协调大佬就起作用了，它的名字叫**coordinator**，他用来处理以上的事情。

这两者我提炼出来的基本流程是这样的，省掉了很多细节。

写在前面**其实，在Group里面，也会有一个隐藏的大佬leader**

1. 当组内消费者数目变动的时候（新加/挂掉）。
2. **coordinator**向各个消费者发送重新申请入组命令
3. 各个消费者携带自己订阅的topic信息申请入组。
4. **coordinator**从申请入组的消费者中选出一个leader并把组内消费者的topic汇总告诉他，让他规划组员的工作内容
5. 被告知成为了leader的消费者开开心心规划各个消费者应该去处理哪个topic的哪个分区。
6. **coordinator**拿到leader的方案，同志组内成员重新开始按照分配工作。
7. 大家集体进入下一代，generation+1。

拿过来大佬的两张时序图。



**新成员加入时**

![](_media\20190513-07.png)



**组成员GG时**

![](_media\20190513-08.png)





## Kafka为什么快

> `Kafka`为什么什么快这个问题，也就是它的实现和特性所在。

- 批量/batch处理
  采用批处理的方式尽量减少io消耗和数据冗余。
  比如在发送消息的时候，会采用batch的方式发送，而不是每一条都单独立刻发送出去。
  在最新的协议中，移除了在每一条消息中冗余的信息，引入了`MessageSet`的概念提取出来了一些冗余的字段，比如`PID`。

- 消息压缩

  即不会每次一条消息的时候就会发送，而是会等到有多条消息的时候才会批量压缩进行发送，减少网络I/O的消耗。
  

- 写入数据

  - 顺序写入，即`offset`追加，避免随机写入不必要的磁盘寻址。

  - `mmap`。

    直接利用操作系统的`Page Cache`来实现文件到物理内存的直接映射，省去了用户空间到内核空间复制的开销。

    但是写到`mmap`中的数据并没有被真正的写到硬盘，操作系统会在程序主动调用flush的时候才把数据真正的写到硬盘。

    `Kafka`提供了`producer.type`来控制是不是主动flush（同步），还是写入`mmap`后立刻返回（异步）。

> Java 使用 MMAP
```java
import java.io.RandomAccessFile;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;

public class MMPCase {

    public static void main(String[] args) throws Exception {
        String path = "example.txt";
        RandomAccessFile file = new RandomAccessFile(path, "rw");
        FileChannel channel = file.getChannel();
        System.out.println(channel.size());

        // 其实位置
        int position = 0;
        // size, 结束位置，即映射区是1kb
        int size = 1024;
        // 映射区间
        MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, position, size);
        String content = "Hello mmap";
        byte[] buf = content.getBytes(StandardCharsets.UTF_8);
        System.out.println(buf.length);
        // 写入数据到内存映射文件
        for (int i = 0; i < 500; i++) {
            buffer.put(buf);
            position += 10;
            buffer.position(position);
        }
        // 强制刷入而不是依赖于操作系统
//        buffer.force();
        channel.close();
        file.close();
    }
}

  ``` 

- 读取数据，`零拷贝`

  基于`sendfile`实现，直接将数据从内核空间的读缓冲区直接拷贝到内核空间的socket缓冲区，然后再写到`NIC`缓冲区。

  避免在内核空间和用户空间之间穿梭。


  而在传统模式下，当需要对一个文件进行传输的时候，需要经过如下几个步骤：

  - 调用read函数，文件数据被copy到内核缓冲区
  - read函数返回，文件数据从内核缓冲区copy到用户缓冲区
  - write函数调用，将文件数据从用户缓冲区copy到内核与socket相关的缓冲区。
  - 数据从socket缓冲区copy到相关协议引擎。

 其中主要是利用了`DMA`技术，即外部设备不通过CPU而直接与系统内存交换数据的接口技术，比如网卡等硬件都支持`DMA`。

> Update
同时，对于`PageCache`的使用，在非`冷读`的情况下甚至可以做到`on the fly`，完全在`PageCache`中完成。同时，Kafka对于`冷读`的问题，进行了分层次存储的优化，但是基于其存储设计，还是很难从根本解决这个问题。

**冷读是如何产生的**
在消息和流系统中，冷读是常见且具有重要价值的场景，包括以下几点：

• 保证削峰填谷的效果： 消息系统通常用于业务解耦和削峰填谷。在削峰填谷场景中，消息队列可暂时保存上游数据，以便下游逐步消费。这些数据通常不在内存中，而是需要进行冷读取。因此，优化冷读效率对于提高削峰填谷的效果至关重要。

• 批处理场景广泛应用： 在与大数据分析结合时，Kafka 通常用于处理批处理场景。在这种情况下，任务需要从几个小时甚至一天前的数据开始扫描计算。冷读的效率直接影响了批处理的时效性。

• 故障恢复效率： 在实际生产环境中，消费者由于逻辑问题或业务 BUG 导致故障宕机是常见问题。消费者恢复后，需要快速消费堆积的历史数据。提高冷读效率可以帮助业务更快从消费者宕机故障中恢复，减少中断时间。

• Kafka 分区迁移时数据复制引发冷读： Kafka 在扩容时需要迁移分区数据，这时候也会引发冷读。


  

-----

## 参考

[Kafka-design](https://kafka.apache.org/documentation/#design)

[为什么要用消息队列](https://github.com/doocs/advanced-java/blob/master/docs/high-concurrency/why-mq.md)

[官方文档-INTRODUCTION](http://kafka.apache.org/intro)

[Consumer Group详解](http://www.cnblogs.com/huxi2b/p/6223228.html)

[kafka消息模型-系列小视频](https://www.bilibili.com/video/av32925832?t=511)


[认真分析mmap：是什么 为什么 怎么用](https://www.cnblogs.com/huxiao-tee/p/4660352.html)

[AutoMQ 如何解决 Kafka 冷读副作用](https://blog.51cto.com/u_16366971/10072083)

[Kafka 事务设计文档 - 必看！](https://docs.google.com/document/d/11Jqy_GjUGtdXJK94XGsEIK7CP1SnQGdp2eF0wSw9ra8/edit?tab=t.0)

[Kafka architecture - 必看！](https://developer.confluent.io/courses/architecture/get-started/)


