# JDK1.8的Optional

> `Optional`类主要是为了解决`NPE`问题而生，简而言之就是将`null`进行了二次封装为一个`Optional`对象。

其实在日常的开发中感觉用到的机会并不多，可能是开发规法考虑到团队开发的一些代码可读性之类的东西吧。

> 本次讲解的Optional是基于JDK1.8，后续版本的优化不含在内。

## 基础示例

### 创建一个`Optional`对象

```java

        // 创建一个空的Optional对象， 跟进去源码即可得，其实就是包装了null
        // 注意这里的泛型其实就是Optional作为一个包装类时你传进去的对象作为它的value
        // Optional<T> opt = Optional.xxx()
        // 创建了一个Optional对象，其value值为null
        Optional<Superman> optEmpty = Optional.empty();

        // 创建一个不能为空的Optional对象，如果为null会抛出NPE
        // 同样跟进去源码可得创建时会调用requireNonNull()方法
        // 如果传入构造的对象为null则会抛出NPE
        // Optional<Superman> optOf = Optional.of(null);
        Optional<Superman> optOf = Optional.of(new Superman(null));

        // 创建一个可以为空的Optional对象
        // 当对象为null时创建Optional.empty()对象，否则使用创建Optional.of()创建对象。
        Optional<Superman> optOfNullable = Optional.ofNullable(null);
```



### 取值与校验

```java
        // 创建一个用例对象
        Optional<Superman> optSupermanEg = Optional.ofNullable(new Superman(null));
        // 判断对象是否存在
        boolean present = optSupermanEg.isPresent();
        // 获取对象
        Superman man = optSupermanEg.get();
        // 判断对象对否存在并做点什么,比如如果存在就打印出来
        optSupermanEg.ifPresent(System.out::println);
```

### 返回默认值

#### `orElse`

```java
        // 创建一个用例对象
        Optional<Superman> optSupermanEg1 = Optional.ofNullable(null);
        // A. 最简单的示例
        // 超人存在就返回超人， 没有就创造一个新超人
        Superman superman = optSupermanEg1.orElse(new Superman(null));

        // B. 进一步对获取的值进行操作
        // 在这里orElse其实包含了两种情况：
        // 1. 超人不存在，（默认）创造一种力量！
		// Optional<Superman> optSupermanEg2 = Optional.ofNullable(null);
        // 2. 超人存在，但是超人的力量不存在，也（默认）创造一种力量！
        Optional<Superman> optSupermanEg2 = Optional.ofNullable(new Superman(null));
        Power power = optSupermanEg2.map(Superman::getPower).orElse(new Power("ray"));
```



#### `orElseGet`

基本的用法和概念与`orElse`相同。

**关键**的当然是不同点。

- 当返回值为空时，两者的行为一致，即获取不到对象，进入返回`Else`默认值内。

  而当返回值不为空时，`orElse`任然会执行后面`orElse`的内容，而`orElseGet`不会。

  这一点很重要，特别是当你去想要`以某种形式避免非空来替换三元表达式`的话，你懂得:dog:。

这两者之间的区别示例可以[参考Stack Overflow](https://stackoverflow.com/questions/33170109/difference-between-optional-orelse-and-optional-orelseget#)的这个例子。



## 完整Demo

```java
package com.koy.demo;

import java.util.Optional;
import java.util.function.Consumer;

/**
 * @Description
 * @Auther Koy  https://github.com/Koooooo-7
 * @Date 2020/01/01
 */
public class NewYear2020 {
    public static void main(String[] args) {

        // 创建一个空的Optional对象， 跟进去源码即可得，其实就是包装了null
        // 注意这里的泛型其实就是Optional作为一个包装类时你传进去的对象作为它的value
        // Optional<T> opt = Optional.xxx()
        // 创建了一个Optional对象，其value值为null
        Optional<Superman> optEmpty = Optional.empty();

        // 创建一个不能为空的Optional对象，如果为null会抛出NPE
        // 同样跟进去源码可得创建时会调用requireNonNull()方法
        // 如果传入构造的对象为null则会抛出NPE
        // Optional<Superman> optOf = Optional.of(null);
        Optional<Superman> optOf = Optional.of(new Superman(null));

        // 创建一个可以为空的Optional对象
        // 当对象为null时创建Optional.empty()对象，否则使用创建Optional.of()创建对象。
        Optional<Superman> optOfNullable = Optional.ofNullable(null);

        // 创建一个用例对象
        Optional<Superman> optSupermanEg = Optional.ofNullable(new Superman(null));
        // 判断对象是否存在
        boolean present = optSupermanEg.isPresent();
        // 获取对象
        Superman man = optSupermanEg.get();
        // 判断对象对否存在并做点什么,比如如果存在就打印出来
        optSupermanEg.ifPresent(System.out::println);
        

        // 创建一个用例对象
        Optional<Superman> optSupermanEg1 = Optional.ofNullable(null);
        // A. 最简单的示例
        // 超人存在就返回超人， 没有就创造一个新超人
        Superman superman = optSupermanEg1.orElse(new Superman(null));

        // B. 进一步对获取的值进行操作
        // 在这里orElse其实包含了两种情况：
        // 1. 超人不存在，（默认）创造一种力量！
        // Optional<Superman> optSupermanEg2 = Optional.ofNullable(null);
        // 2. 超人存在，但是超人的力量不存在，也（默认）创造一种力量！
        Optional<Superman> optSupermanEg2 = Optional.ofNullable(new Superman(null));
        Power power = optSupermanEg2.map(Superman::getPower).orElse(new Power("ray"));

    }


}

class Superman {
    private Power power;

    public Superman(Power power) {
        this.power = power;
    }

    public Power getPower() {
        return power;
    }

    public void setPower(Power power) {
        this.power = power;
    }

    @Override
    public String toString() {
        return "Superman{" +
                "power=" + power +
                '}';
    }
}


class Power {
    private String name;

    public Power(String name) {
        this.name = name;
    }

    public void biu() {
        System.out.println(name+" is biu ~");
    }

    @Override
    public String toString() {
        return "Power{" +
                "name='" + name + '\'' +
                '}';
    }
}

```

