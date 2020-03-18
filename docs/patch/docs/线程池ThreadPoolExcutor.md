# 线程池ThreadPoolExcutor

## 概述

`ThreadPoolExcutor`位于`package java.util.concurrent`下。

它的完整模式长这样，直接从源码拿过来的。

```java
public ThreadPoolExecutor(
    // 核心线程数，是不是空闲都会存在，除非设置了allowCoreThreadTimeOut
    int corePoolSize, 
    // 线程池允许的最大线程数
    int maximumPoolSize, 
    // 大于核心线程数时（在corePoolSize和maximumPoolSize之间）的线程被终止前能保持的空闲时间
    long keepAliveTime,
    // 时间单位
    TimeUnit unit,
    // 队列 用来存当前线程池处理不了的task，不同的队列有不同的保存策略
    BlockingQueue<Runnable> workQueue,
    // 线程工厂，默认使用defaultThreadFactory
    // 使用线程工厂可以对线程进行一些比如命名，编组，优先级设置等操作
    ThreadFactory threadFactory,
    // 当执行器被关闭或者线程列表都满了之后线程的拒绝策略（操作）
    RejectedExecutionHandler handler
    )
```



- 通过`ThreadPoolExcutor`自己显式可控地创建线程池。

- 通过`Excutors`更方便得去获取几种预设的线程池，比如下面几种。

  - `newCachedThreadPool`

  > unbounded thread pool, with automatic thread reclamation

  - `newFixedThreadPool`

  > fixed size thread pool

  - `newSingleThreadExecutor`

  > single background thread

  ---

  

## 代码示例

最直接的还是上代码，主要有3部分组成。

- `SendSMS`实现了`Runnable`接口用来业务调用的类。

- `MyRejectHandler` 实现了`RejectedExecutionHandler`接口处理拒绝后的操作。
- `SmsServiceImpl` 处理`web`业务实现的类。

### `SendSMS`

```java
public class SendSMS implements Runnable{
    private static final Logger logger = LoggerFactory.getLogger(SendSMS.class);
    private String phoneNumber;

    public SendSMS(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    @Override
    public void run() {
        try {
            // 假装在处理发送业务
            Thread.sleep(1000*2);
            logger.info("message send success, phone phoneNumber:{}",phoneNumber);
        } catch (InterruptedException e) {
            logger.error("message send error:{}, phone phoneNumber:{}",e,phoneNumber);
        }
    }
    
   public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
```

### `MyRejectHandler` 

```java
public class MyRejectHandler implements RejectedExecutionHandler {
    private static final Logger logger = LoggerFactory.getLogger(SendSMS.class);

    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        // 可以对被拒绝的请求r进行进一步操作，executor是我们创建的线程池
        SendSMS sendSMS = (SendSMS) r;
        logger.info("rejected phoneNumber：{}",sendSMS.getPhoneNumber());
    }
}
```

### `SmsServiceImpl`

```java
@Service
public class SmsServiceImpl implements SmsService {
    private static final Logger logger = LoggerFactory.getLogger(SmsServiceImpl.class);
    // 假设要发送的号码
    private List<String> phoneNumbers = new ArrayList<String>() {{
        add("123456");
        add("234567");
        add("345678");
        add("456789");
        add("567890");
        add("678901");
        add("789012");
        add("890123");
        add("901234");
        add("012345");
    }};

    @Override
    public void sendSms() {
        // 线程池初始配置
        int corePoolSize = 2;
        int maximumPoolSize = 5;
        long keepAliveTime = 60L;
        // 创建线程池
        ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor
                (corePoolSize, maximumPoolSize, keepAliveTime,
                        TimeUnit.SECONDS,
                        // 有界队列（Bounded queues）
                        new ArrayBlockingQueue<>(2),
                        new MyRejectHandler());
        for (String pn : phoneNumbers) {
            logger.info("send message start, phoneNumber:{}",pn);
            threadPoolExecutor.execute(new SendSMS(pn));
        }
        threadPoolExecutor.shutdown();
    }
}

```

## 输出信息

```shell
2019-08-23 22:36:19.702  INFO 20464 --- [io-10086-exec-1] c.mt.mypoll.service.impl.SmsServiceImpl  : send message start, phoneNumber:123456
2019-08-23 22:36:19.703  INFO 20464 --- [io-10086-exec-1] c.mt.mypoll.service.impl.SmsServiceImpl  : send message start, phoneNumber:234567
2019-08-23 22:36:19.704  INFO 20464 --- [io-10086-exec-1] c.mt.mypoll.service.impl.SmsServiceImpl  : send message start, phoneNumber:345678
2019-08-23 22:36:19.704  INFO 20464 --- [io-10086-exec-1] c.mt.mypoll.service.impl.SmsServiceImpl  : send message start, phoneNumber:456789
2019-08-23 22:36:19.704  INFO 20464 --- [io-10086-exec-1] c.mt.mypoll.service.impl.SmsServiceImpl  : send message start, phoneNumber:567890
2019-08-23 22:36:19.704  INFO 20464 --- [io-10086-exec-1] c.mt.mypoll.service.impl.SmsServiceImpl  : send message start, phoneNumber:678901
2019-08-23 22:36:19.704  INFO 20464 --- [io-10086-exec-1] c.mt.mypoll.service.impl.SmsServiceImpl  : send message start, phoneNumber:789012
2019-08-23 22:36:19.705  INFO 20464 --- [io-10086-exec-1] c.mt.mypoll.service.impl.SmsServiceImpl  : send message start, phoneNumber:890123
2019-08-23 22:36:19.705  INFO 20464 --- [io-10086-exec-1] com.mt.mypoll.Thread.SendSMS             : rejected phoneNumber：890123
2019-08-23 22:36:19.705  INFO 20464 --- [io-10086-exec-1] c.mt.mypoll.service.impl.SmsServiceImpl  : send message start, phoneNumber:901234
2019-08-23 22:36:19.705  INFO 20464 --- [io-10086-exec-1] com.mt.mypoll.Thread.SendSMS             : rejected phoneNumber：901234
2019-08-23 22:36:19.705  INFO 20464 --- [io-10086-exec-1] c.mt.mypoll.service.impl.SmsServiceImpl  : send message start, phoneNumber:012345
2019-08-23 22:36:19.705  INFO 20464 --- [io-10086-exec-1] com.mt.mypoll.Thread.SendSMS             : rejected phoneNumber：012345
2019-08-23 22:36:21.703  INFO 20464 --- [pool-1-thread-1] com.mt.mypoll.Thread.SendSMS             : message send success, phone phoneNumber is:123456
2019-08-23 22:36:21.704  INFO 20464 --- [pool-1-thread-2] com.mt.mypoll.Thread.SendSMS             : message send success, phone phoneNumber is:234567
2019-08-23 22:36:21.704  INFO 20464 --- [pool-1-thread-3] com.mt.mypoll.Thread.SendSMS             : message send success, phone phoneNumber is:567890
2019-08-23 22:36:21.705  INFO 20464 --- [pool-1-thread-5] com.mt.mypoll.Thread.SendSMS             : message send success, phone phoneNumber is:789012
2019-08-23 22:36:21.704  INFO 20464 --- [pool-1-thread-4] com.mt.mypoll.Thread.SendSMS             : message send success, phone phoneNumber is:678901
2019-08-23 22:36:23.703  INFO 20464 --- [pool-1-thread-1] com.mt.mypoll.Thread.SendSMS             : message send success, phone phoneNumber is:345678
2019-08-23 22:36:23.705  INFO 20464 --- [pool-1-thread-2] com.mt.mypoll.Thread.SendSMS             : message send success, phone phoneNumber is:456789

```

## 结果分析

首先，创建了一个线程池，核心线程数是2，最大线程数是5，使用有界队列（队列长度是2）。

当有多个请求过来的时候（10个号码），首先会有2个使用核心线程。

> 当核心线程数少于设定的核心线程数时，不管核心线程是否空闲，都会优先创建核心线程。

接着收到的请求会加入到队列中（队列中可存储2个）。

队列满了之后，再来的请求就会去创建新线程执行，直至线程池的线程数达到最大线程数。

之后再来的请求就会被拒绝掉，使用拒绝策略处理。

## 内置线程池的使用

内置线程池可以直接看源码，其实就是对`ThreadPoolExecutor`的封装。

以`newFixedThreadPool`为例，线程池大小就是核心线程数。

```java
  public static ExecutorService newFixedThreadPool(int nThreads) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>());
    }
```

创建一个固定线程池大小为10的`FixedThreadPool`。

```java
ExecutorService executorService = Executors.newFixedThreadPool(10);
```

其基本的使用和`ThreadPoolExecutor`一样。

## 注意

下面是一份开发手册的推荐使用参考，个人觉得实际使用中还是要结合自己的业务场景，能合理使用即可。

> 线程池不使用 `Executors` 去创建，而是通过` ThreadPoolExecutor` 的方式，这样 的处理方式让写的同学更加明确线程池的运行规则，规避资源耗尽的风险。
>
> 说明：` Executors` 返回的线程池对象的弊端如下：
>
> `FixedThreadPool` 和 `SingleThreadPool` : 允许的请求队列长度为` Integer.MAX_VALUE` ，可能会堆积大量的请求，从而导致 `OOM` 。
> `CachedThreadPool` 和 `ScheduledThreadPool` : 允许的创建线程数量为 `Integer.MAX_VALUE` ，可能会创建大量的线程，从而导致` OOM` 。
>
> ​                                                                                                                               《阿里巴巴`java`开发手册》

// TODO: WaitingRejectHandlerThreadPool 
   记录拒绝次数，可重试的线程池，采用LocalSupport去暂时等待。