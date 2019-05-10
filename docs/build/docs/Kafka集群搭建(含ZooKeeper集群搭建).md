# Kafka集群搭建

皮一下：海边的Kafka原来不是孤独的一个人。:dog:  

| 服务器地址   | broker.id | service.id | 安装内容  |
| ------------ | --------- | ---------- | --------- |
| 192.168.0.87 | 0         | 1          | Kafka, ZK |
| 192.168.0.88 | 1         | 2          | Kafka, ZK |
| 192.168.0.90 | 2         | 3          | Kafka, ZK |

*不采用Kafka自带的ZooKeeper，自行安装。*

**基本搭建顺序**  

1. 安装ZooKeeper（简称ZK）
2. 安装Kafka
3. 搭建ZooKeeper集群
4. 搭建Kafka集群

安装环境以及安装包各版本如下：  

- Java `jdk-8u201-linux-x64.tar`  [下载地址](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) 我服务器中已更换过。  
- Kafka `kafka_2.12-2.2.0` [下载地址](https://www.apache.org/dyn/closer.cgi?path=/kafka/2.2.0/kafka_2.12-2.2.0.tgz)  
- ZooKeeper `zookeeper-3.4.14.tar` [下载地址](https://www.apache.org/dyn/closer.cgi/zookeeper/)    

![](_media\K-kafka-cluster01.jpg)

-----



## 安装ZooKeeper

安装直接按照[官网](https://zookeeper.apache.org/doc/current/zookeeperStarted.html)参考安装步骤即可。

将ZK安装包FTP到服务器上（目录自定，我的是`/opt/zookeeper-3.4.14`）  

解压 `tar -zxvf  zookeeper-3.4.14/zookeeper-3.4.14.tar.gz `  

进入ZK解压目录中

在`conf`目录下新建一个`zoo.cfg`文件，或者直接拿`zoo_sample.cfg`文件重命名

简单写入一下配置内容

```
tickTime=2000  //ZK服务器之间或客户端与服务器之间维持心跳的时间间隔
dataDir=/var/lib/zookeeper  //data目录
clientPort=2181  //监听端口
```

即可启动。

**ZK启动命令**:`./zkServer.sh start` (需要在bin目录下启动，亦可自己[加入环境变量](https://blog.csdn.net/kerry_55/article/details/80319342)中)。



-----



## 安装Kafka

同样，将安装包上传到服务器上（目录自定，我的是`/opt/kafka_2.12-2.2.0`）

具体步骤按照[官网](http://kafka.apache.org/quickstart)来即可。

解压  `tar -xzf kafka_2.12-2.2.0.tgz`

- [ ] 以下只为演示简单配置启动，可略过

进入目录 `cd kafka_2.12-2.2.0`在**config**目录下配置server.properties文件。

```
listeners=PLAINTEXT://localhost:9092
zookeeper.connect=localhost:2181
```

即可**启动Kafka** ，（之前已经启动了ZK，如没有，请先启动ZK）。

Kafka的启动命令，按照官方文档默认是**前台启动**，**在bin所在目录下**

`bin/kafka-server-start.sh     config/server.properties`

**后台启动**方式 **在bin目录内**

`./kafka-server-start.sh -daemon ../config/server.properties`

**关闭Kafka**，**在bin所在目录下**

`bin/kafka-server-stop.sh`

-----



## ZooKeeper集群搭建

以上**分别在每台服务器上**安装好ZK和Kafka，或者先都安装ZK搭建ZK集群后再安装Kafka都行，你高兴就好:smile:。

### 更改配置文件

[参考文档](https://www.cnblogs.com/luotianshuai/p/5206662.html)，参考ZK集群搭建部分，有较为详细参数说明。

**更改zoo.cfg文件**

在每个服务器内的ZK配置文件zoo.cfg中都写入内容如下。  
注意，server.x要都是唯一的，相互会按照myid进行身份识别。

```
tickTime=2000
dataDir=/var/lib/zookeeper
clientPort=2181
initLimit=10
syncLimit=5
server.1=192.168.0.87:2888:3888
server.2=192.168.0.88:2888:3888
server.3=192.168.0.90:2888:3888
                              
```

![](_media\K-kafka-cluster02.jpg)

参数说明

```
#tickTime：
这个时间是作为 Zookeeper 服务器之间或客户端与服务器之间维持心跳的时间间隔，也就是每个 tickTime 时间  
就会发送一个心跳。

#initLimit：
这个配置项是用来配置 Zookeeper 接受客户端（这里所说的客户端不是用户连接 Zookeeper 服务器的客户端，而是
 Zookeeper 服务器集群中连接到 Leader 的 Follower 服务器）初始化连接时最长能忍受多少个心跳时间间隔数。
 当已经超过 5个心跳的时间（也就是 tickTime）长度后 Zookeeper 服务器还没有收到客户端的返回信息，那么表明这个客户端连接失败。总的时间长度就是 5*2000=10 秒

#syncLimit：
这个配置项标识 Leader 与Follower 之间发送消息，请求和应答时间长度，最长不能超过多少个 tickTime 的时间长度，总的时间长度就是5*2000=10秒

#dataDir：
快照日志的存储路径

#dataLogDir：
事物日志的存储路径，如果不配置这个那么事物日志会默认存储到dataDir制定的目录，这样会严重影响zk的性能，
当zk吞吐量较大的时候，产生的事物日志、快照日志太多，但是在这里我没配。

#clientPort：
这个端口就是客户端连接 Zookeeper 服务器的端口，Zookeeper 会监听这个端口，接受客户端的访问请求。
#server.x 这个x是服务器的标识也可以是其他的数字， 表示这个是第几号服务器，用来标识服务器，这个标识要
写到快照目录(dataDir)下面myid文件内。

#192.168.7.107为集群里的IP地址，第一个端口是master和slave之间的通信端口，默认是2888，第二个端口是
leader选举的端口，集群刚启动的时候选举或者leader挂掉之后进行新的选举的端口默认是3888
```

-----



### 创建myid文件

到每个服务器上ZK配置的dataDir目录下创建myid文件。

例如在192.168.0.87下的`/var/lib/zookeeper`（我配置的dataDir）创建myid文件(因为在配置文件中87是server.1)，
写入内容为 `1`

保存退出即可。

秀一波的操作方式

`echo "1" > /var/lib/zookeeper/myid`

其他以此类推。



**启动三台服务器ZK**

进入bin目录下 ` ./zkServer.sh start `

**查看各台状态** 

` ./zkServer.sh status`

发现是一主两从，搭建完毕。

![leader](_media\K-kafka-cluster03.jpg)

![follower1](_media\K-kafka-cluster04.jpg)

![follower2](_media\K-kafka-cluster05.jpg)



:boom:如果有遇到无法启动的异常，可以去看看这个文件`/opt/zookeeper-3.4.14/bin/zookeeper.out` ​。

----



## Kafka集群搭建

如果没有安装Kafka那就按照​上面:up:的套路分别给每个服务器安装。

配置service.conf文件，没什么可说的，IP按照自己服务器的，都对应换掉即可。  
注意broker.id要唯一，我用的0、1、2。

```
以192.168.0.87为例，调整过的配置项如下：
broker.id=0
listeners=PLAINTEXT://192.168.0.87:9092
advertised.listeners=PLAINTEXT://192.168.0.87:9092
num.partitions=3
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
transaction.state.log.min.isr=3
zookeeper.connect=192.168.0.87:2181,192.168.0.88:2181,192.168.0.90:2181
delete.topic.enable=false
auto.create.topics.enable=false
```
[参考文档](https://www.cnblogs.com/luotianshuai/p/5206662.html)，有较为详细Kafka配置文件说明。    

配置完成，启动。  
so easy :white_flower:。



## 测试

指令多从官网而来。

**创建test-topic话题** 

复制3分，分成3块。  

`bin/kafka-topics.sh --create --bootstrap-server 192.168.0.87:9092 --replication-factor 3 --partitions 3 --topic  test-topic`

在一个服务器上创建，会被其他服务器也知道，当然也可以这样  

`bin/kafka-topics.sh --create -bootstrap-server 192.168.0.87:2181,192.168.0.88:2181,192.168.0.90:2181 --replication-factor 3 --partitions 3 --topic test-topic`



**列出所有话题**

在哪个服务器上看都可以。

`bin/kafka-topics.sh --list --bootstrap-server 192.168.0.88:9092`



**查看单个话题情况**

在哪个服务器上看都可以。  

`./kafka-topics.sh --describe --bootstrap-server  192.168.0.90:2181 --topic test-topic`



**创建一个生产者**

随意哪个服务器

`bin/kafka-console-producer.sh --broker-list 192.168.0.87:9092 --topic test-topic`

**创建一个消费者**

随意哪个服务器

`bin/kafka-console-consumer.sh --bootstrap-server 192.168.0.88:9092 --topic test-topic --from-beginning`

多发送几条消息退出进入尝试都可以，最终效果如下：

![](_media\K-kafka-cluster06.jpg)



其他：创建话题` Kafka版本更新后参数是--bootstrap-server 不是 --zookeeper`，按照官网来即可，  

不然ZK可能会报错 `zookeeper is not a recognized option`。


# 总结
总得来说，Kafka和ZK集群的搭建还是比较简单的，但是需要多多去了解它们背后更深的东西:rocket:。



