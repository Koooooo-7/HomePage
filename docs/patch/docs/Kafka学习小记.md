# 0513-Kafka学习小记

kafka单从基本使用上来说，结合业务场景应该都能搞定:dog:。

但是只有知道后面的原理，才更明白为什么有这么些配置项以及配置项为什么这么配。

学习kafka的基本知识，发现还是消费者这一块有点绕，总结一下。



## 为什么要用消息队列

**解耦**   不同应用间不直接通信交互，采用消息队列订阅和发布，生产和消费。

**异步**   异步非阻塞的交互模式，提高应用响应。

**削峰**   将消息队列近似作为一个缓冲区，减少峰值变动时对数据库等的鸭梨。

-----

## 几个概念

**broker**  Kafka实例，基本上可以理解成在一个集群中，一台服务器就是一个Kafka实例，一个broker。

**topic** 话题。通常是以业务区分，简单说就是一个大桶，topic name就是这个大桶上贴的名字，所有这个业务相关需要进行处理的队列信息都会丢到这个里面。

**partition** 分区。为了实现均衡负载和高可用，一般将topic分成多个区，放在不同的broker中。其实就是topic这个大桶中的小桶。但是，并不是每个broker中分别放一份单独的，那样一个挂掉了，那一份分区就丢掉了，显然不合适，所以有了复制replica的概念，在不同的broker上会保留一份，具体复制多少份自己设置，但然最保险的就是有多少台broker就复制多少份。

**每一个分区只能被一个同组消费者消费**。

同时，消息来到的时候，在非指定情况下放到哪个partition中是变化的，但都是以队列的形式追加在后面。

引入了*offset*的概念，老版本这个偏移量是丢zk里面，现在kafka自己干这个事情（`__consumer_offsets`）。


![官网图源](_media\20190513-01.png)

如果指定了消息的key，则会对key做hash后再对分区数取模，这样就可以设置同一个key的时候保证消息会放到同一个分区内。

**producer** 消息生产者，略。

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

[为什么要用消息队列](https://github.com/doocs/advanced-java/blob/master/docs/high-concurrency/why-mq.md)

[官方文档-INTRODUCTION](http://kafka.apache.org/intro)

[Consumer Group详解](http://www.cnblogs.com/huxi2b/p/6223228.html)

[kafka消息模型-系列小视频](https://www.bilibili.com/video/av32925832?t=511)


[认真分析mmap：是什么 为什么 怎么用](https://www.cnblogs.com/huxiao-tee/p/4660352.html)

[AutoMQ 如何解决 Kafka 冷读副作用](https://blog.51cto.com/u_16366971/10072083)



