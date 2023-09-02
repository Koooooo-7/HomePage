# @FunctionalInterface

> Java8 函数式编程小结。

在Java8引入了`@FunctionalInterface`新的函数式编接口，在面向对象中引入函数式接口，其实是对某些具体的可部分`自定义`的部分的一种抽离和整合。

个人感觉是利用了函数式接口尽量保持了整个过程内部不可变的特性。在部分特定逻辑自定义的时候，将函数（方法）也是对象的面向对象进行了一次新的整合（Python/Go这种函数式编程的对象传入一样），而在整个的形成链式调用过程中，则是形成了对于`闭包`的使用。

在这里主要讲两个东西，也是目前在业务当中进行`魔改`实现了`规则链`的使用。

## Function

Function 接口简单来说，就是对Lambda表达式的一次抽象，将一个固定的Lambda表达式封装成了一个函数，可以作为入参进行调用。这样在不同的Lambda表达式对Function的`实现`上实现了面向接口的多态。（个人理解）

目前在JDK8中自带的有两个函数式接口，会调用`apply`方法对传入的参数做处理然后返回。

- ```java
  @FunctionalInterface
  public interface Function<T, R>
  
  ```

- ```java
  @FunctionalInterface
  public interface BiFunction<T, U, R>
  ```

这两个的区别在于，`BiFunction`是两个入参一个出参，`Function`是一个入参一个出参。我们知道Java的返回参数只能是一个，这个和Python或者Go的多返回值有一些不一样（虽然实际上Python返回的时候也是元组的拆包）。而这，也是决定了在后面使用`andThen(Function<? super R, ? extends V> after) `方法的时候，只能是以`Function<? super R, ? extends V> after`为入参。

这里不想去讲基础的运用，比如

```java
// 入参是t,v，如果t>3就返回t+v的字符串，否则返回t这个字符串。 
BiFunction<String,Integer,String> p = (t,v) -> v > 3? t+v : t; 
```

这里我要讲一下包装之后作为校验链的用法。

- 定义一个规则的接口，表示要实现的不同的校验规则。

```java
 public interface Rule {
        boolean handler(Integer t);
}

 class  DemoRule1 implements Rule{

        @Override
        public boolean handler(Integer t) {
            // 这里可以干点什么，比如看看t是不是大于1
            return t > 1;
        }
    }
```

- 定义一个`Funtion`方法表示要对一个`Interger`进行处理，返回值满足返回的是定义的返回值类型(这里是`Integer`)即可。

```java
  public static Function<Integer, Integer> doCheck(Rule rule) {
        return p->{
            boolean handler = rule.handler(p);
            // 在干点其他的
            return p+1;
        };
    }
```

这样就可以直接这么使用。

```java
   Integer result = doCheck(new DemoRule()).apply(1);
```

当然，就可以这么用了，使用`doThen()`实现不同的`Rule`(推荐使用单例)链式对入参`1`进行一系列的处理。

```java
  Integer result = doCheck(new DemoRule()).andThen(doCheck(new DemoRule1())).apply(1);
```

---

## Predicate

```java
@FunctionalInterface
public interface Predicate<T>
```

**Predicate** 也是函数式接口，主要用于返回一个定义好的表达式返回的值`boolean`，是不是觉得做校验和过滤最合适了，没错，通常会用它配合流的表达式比如`filter`一起使用。

```java
// 获取列表中所有大于3的数。
Predicate<Integer> p = it -> it > 3;

List<Integer> list = new ArrayList<>();

List<Integer> integers = list.stream().filter(p).collect(Collectors.toList());
```

同样的，想讲一下作为校验链的玩法，这里和`Function`十分相似，只不过这里要求返回是`boolean`。

- 定义一个简单的校验器，验某个map里面的字段是否符合这个正则。

  ```java
  public static Predicate<Map<String, Object>> isValidate(String field, String regex) {
      return p -> ((String) p.get(field)).matches(regex);
  }
  ```

- 再来一个校验器，校验某个map里面的某个字段是否不为空。

  ```java
     public static Predicate<Map<String, Object>> isEmpty(String field) {
          return p -> {
              Object o = p.get(field);
              
              if (o instanceof Integer) {
                  return (Integer) o > 220;
              }
  
              if (o instanceof String) {
                  return StringUtils.isEmpty(p.get(field));
              }
              return false;
          };
      }
  ```

  这样，我们就可以直接这样用来校验这个map里面的`a`，`b`，`c`当中的值。

  ```java
  boolean result = isEmpty("a").and(isEmpty("b").and(isValidate("c", "[abc]d+").test(map);
  ```

  > 注意, 看它`and`的实现。
  >
  > ```java
  > default Predicate<T> and(Predicate<? super T> other) {
  >         Objects.requireNonNull(other);
  >         return (t) -> test(t) && other.test(t);
  >     }
  > ```
  >
  > 可知在Predicate中是符合`短路原则`的，在这里的校验链是`快速失败`的校验链，遇到失败即会返回，后面的校验不会继续。

  那么，知道了这个短路原则，那魔改一下，让返回值都是`true`，那校验链就会一直走下去(逃。

  

## 自定义函数接口

当然，可以自定义函数接口来实现功能，尤其是你要简单使用的时候，默认提供的最多只有2个参数，那当然会蛋疼，所以，也可以魔改呀，这里放上来我的一个项目[`K-bot`](https://github.com/Koooooo-7/K-Bot)里面的一个使用示例，是为了重新处理当发现key已经存在时再存入一个值到map的问题。

```java
@FunctionalInterface
public interface PutIfExistFunction<R, K, V1, V2> {
    /**
     * @param k  key
     * @param v1 the value already in the map
     * @param v2 the value wanna put in
     * @return
     */
    R apply(K k, V1 v1, V2 v2);
}
```

## 函数式Builder
> 我们可以通过函数式来玩一点花的构建模式，本质上其实是`Function<String, Function<Long, Function<..., Target>>>`,
> 通过函数式区分定义，让其更可读了。
```java
public class Coffee {
    private final Long sugarWeight;
    private final String milkBrand;

    public Coffee(Long sugarWeight, String milkBrand) {
        this.sugarWeight = sugarWeight;
        this.milkBrand = milkBrand;
    }

    public Coffee build() {
        // do some check
        return this;
    }

}

public class CoffeeBuilder {

    @FunctionalInterface
    public interface AddSugar {

        AddMilk sugar(Long g);


    }

    @FunctionalInterface
    public interface AddMilk {
        Coffee milk(String brand);
    }

    public static AddSugar builder() {
        return sugar -> mile -> new Coffee(sugar, mile);
    }

}

// 使用
public class Demo {
    public static void main(String[] args) {
        final Coffee coffee = CoffeeBuilder.builder()
                .sugar(10L)
                .milk("SanM")
                .build();
    }
}
```

---

## 参考

[HowToDoInJava-Functional Interfaces](https://howtodoinjava.com/java8/functional-interface-tutorial/)

[HowToDoInJava-Predicate Filter](https://howtodoinjava.com/java8/how-to-use-predicate-in-java-8/)

[Next level Java 8 staged builders](https://medium.com/linagora-engineering/next-level-java-8-staged-builders-602530f68b75)









