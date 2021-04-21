# InheritableThreadLocal 可继承的本地线程变量

>`ThreadLocal` 实质上就是一个以当前线程为`Key`，存入的值为`Value`的`Map`来维持线程自己的局部变量。
>
>如果在该线程下又有子线程（多线程）需要使用父线程的变量时，`InheritableThreadLocal `不失为一种解决方式。
>
>如果说是要引用外部存储或者缓存的话（比如直接丢到`redis`里面），直接去拿就更简单了。





## 代码实例

```java
package com.koy.dodo;


import java.util.ArrayList;

/**
 * @Description
 * @Auther Koy  https://github.com/Koooooo-7
 * @Date 2019/11/28
 */

/***
 * InheritableThreadLocal 在子线程的ThreadLocal中传的是父线程的引用，小心有坑。
 */
public class DemoTests
//        implements Runnable
{

    static InheritableThreadLocal<ArrayList> listContextHolder = new InheritableThreadLocal<>();
    static InheritableThreadLocal<String> stringContextHolder = new InheritableThreadLocal<>();

    public static void main(String[] args) {
        ArrayList<Object> objects = new ArrayList<>();
        objects.add("main thread set value");
        listContextHolder.set(objects);
        new Thread(new SubThread<>(listContextHolder)).start();

        stringContextHolder.set("main set String");
        new Thread(new SubThread<>(stringContextHolder)).start();
        try {
            Thread.sleep(1000*3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("main---"+listContextHolder.get());
        System.out.println("main---"+stringContextHolder.get());
    }

//    @Override
//    public void run() {
//        System.out.println(contextHolder.get());
//        ArrayList<Object> arrayList = (ArrayList<Object>) contextHolder.get();
//        arrayList.add("sub thread set Value");
//        contextHolder.set(arrayList);
//        System.out.println("sub----"+contextHolder.get());
//
//    }

}

    class SubThread<T> implements Runnable {
       private InheritableThreadLocal<T>  subContexttHolder;

        public SubThread(InheritableThreadLocal<T> subContexttHolder) {
            this.subContexttHolder = subContexttHolder;
        }

        public void run() {
            System.out.println(subContexttHolder.get());
            T t = subContexttHolder.get();
            if (t instanceof ArrayList){
                ((ArrayList) t).add("sub thread set Value;");
                subContexttHolder.set(t);
            }else {
                subContexttHolder.set((T)"sub set String");
            }

            System.out.println("sub----"+subContexttHolder.get());

        }
    }
```

## 输出

```java
main set String
[main thread set value]
sub----sub set String
sub----[main thread set value, sub thread set Value;]
main---[main thread set value, sub thread set Value;]
main---main set String
```



## 结果分析

分别使用`listContextHolder`和`stringContextHolder`对线程的局部变量内容进行操作后发现，实际上子线程从父线程复制过来的是变量的**引用**，对于`String`这种不可变类型就直接覆盖掉了，对于`List`则是拿到了`List`对象的引用继续进行的`add`操作。这一点要注意小心有坑。:dog:



## 挖坑进阶

在`线程池`中使用InheritableThreadLocal，会造成其失效，或者准确的说其传递的上下文由于交由线程池自己控制。传递的是复用线程池当时的上下文，而不是调用运行时的上下文，此时的传递已经没有意义。

推荐使用开源包[transmittable-thread-local](https://github.com/alibaba/transmittable-thread-local)。

或者自己封装线程池，使用额外的容器保存在`submit`或`execute`时需要传递的上下文内容。

