# Lock和Condition

锁这一块之后还需要看更多相关的书籍资料才能了解得更深，现在先有一个初步的认知。

`Lock`的实现类是`ReentrantLock`。

## synchronize和lock的简要区别

1. `synchronized`是`Java`内置关键字，通过`JVM`来控制锁的获取与释放，是一种**隐式锁**。

   > a. 线程执行完同步代码会释放锁 ；b.线程执行过程中发生异常会释放锁

   `Lock`是个`java`类，需要自己显式地手动加锁和释放锁，操作不当容易造成死锁，是一种**显式锁**。

2. `synchronized`无法判断是否获取锁的状态，`Lock`可以判断是否获取到锁。

3. `synchronized`可重入、不可中断、非公平，而`Lock`可重入、可中断、可公平，可非公平（默认）。

## sleep和wait的区别

1. `sleep`是`Thread`中的方法，但是`wait`是`Object`中的方法。
2. `sleep`方法不会释放lock，但是`wait`会释放，而且会加入到等待队列中。
3. `sleep`方法不依赖于同步器`synchronized`，但是`wait`需要依赖`synchronized`关键字。
4. `sleep`不需要被唤醒（休眠之后退出阻塞），但是`wait`需要（不指定时间则需要被中断）。

## Condition的特性

`Condition`中的`await()`方法相当于`Object`的`wait()`方法，`Condition`中的`signal()`方法相当于`Object`的`notify()`方法，`Condition`中的`signalAll()`相当于`Object`的`notifyAll()`方法。

不同的是，`Object`中的这些方法是和同步锁捆绑使用的；而`Condition`是需要与互斥锁/共享锁捆绑使用的。

`Condition`它更强大的地方在于：

能够更细粒度控制多线程的休眠与唤醒。

对于同一个锁，我们可以创建多个Condition，在不同的情况下使用不同的Condition。

## 代码Demo

说得再多都没有代码来得快。

> 注意：因为是通过设置线程优先级去理想化调用顺序，实际上这个例子的调用顺序有偶然性。

**代码**

```java

import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

/**
 * @Description
 * @Auther Koy  https://github.com/Koooooo-7
 * @Date 2019/10/23
 */
public class LockDemo {

    public static void main(String[] args) {
        Service service = new Service();

        Thread sh01 = new Thread(service::sayHi, "sh01");
        Thread sh02 = new Thread(service::sayHi, "sh02");
        Thread sn01 = new Thread(service::sayNo, "sn01");

        // 先让一个线程进去sayHi后等待，
        // 再让一个线程进去sayNo后等待，
        // 再让一个线程唤醒sayNo等待的线程，sayNo等待的线程再唤醒sayHi中第一个等待的线程。

        // 设置线程优先级来近似模拟上诉的流程。

        // 注意注意注意：
        // 线程优先级只是线程被优先调用的概率大小问题, CPU在调度的时候不一定会按照优先级来，所以这个例子的结果有偶然性。
        sh01.setPriority(10);
        sn01.setPriority(8);
        sh02.setPriority(1);

        sh01.start();
        sh02.start();
        sn01.start();


    }
}

class Service {

    private final ReentrantLock lock = new ReentrantLock();
    private final Condition conditionAdd = lock.newCondition();
    private final Condition conditionSub = lock.newCondition();
    private int count = 0;

    public void sayHi() {
        lock.lock();
        try {
            System.out.println("当前在sayHi中拿到锁的Thread 是 ----" + Thread.currentThread().getName());
            if (count == 0) {
                try {
                    // 使count != 0, 下一个进来的线程就不会被await
                    count++;
                    // await当前线程, 会释放掉当前获取的lock
                    System.out.println("当前进入await中的Thread是 ----" + Thread.currentThread().getName());
                    conditionAdd.await();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            // 保证只有第二个进来的线程才会进去唤醒sayNo的线程
            if (count != 0) {
                System.out.println("当前唤醒在await的sayNo的Thread是 ----" + Thread.currentThread().getName());
                conditionSub.signal();
            }
            // 执行业务逻辑
            System.out.println("Hi!");
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 释放锁
            lock.unlock();
        }
    }

    public void sayNo() {
        lock.lock();
        System.out.println("当前在sayNo中拿到锁的Thread 是 ----" + Thread.currentThread().getName());
        try {

            System.out.println("当前进入await中的Thread是 ----" + Thread.currentThread().getName());
            conditionSub.await();
            // 处理一个简单业务逻辑
            System.out.println("No!");
            // 唤醒sayHi中第一个被等待的线程
            System.out.println("当前唤醒在await的sayNi的Thread是 ----" + Thread.currentThread().getName());
            conditionAdd.signal();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}

```

**输出结果**

```shell
当前在sayHi中拿到锁的Thread 是 ----sh01
当前进入await中的Thread是 ----sh01
当前在sayNo中拿到锁的Thread 是 ----sn01
当前进入await中的Thread是 ----sn01
当前在sayHi中拿到锁的Thread 是 ----sh02
当前唤醒在await的sayNo的Thread是 ----sh02
Hi!
No!
当前唤醒在await的sayNi的Thread是 ----sn01
当前唤醒在await的sayNo的Thread是 ----sh01
Hi!
```



