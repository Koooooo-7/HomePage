# 开启Gzip压缩
当response的payload过大的时候，一个最方便的办法就是开启Gzip压缩，即
```
Response Headers

content-encoding: gzip
```

基础配置
```yaml
server:
  compression:
    enabled: true
    min-response-size: 10KB
```

默认的支持压缩的类型。
```java
private String[] mimeTypes = new String[] { "text/html", "text/xml", "text/plain", "text/css", "text/javascript",
			"application/javascript", "application/json", "application/xml" };
```

# Spring 特殊Bean增强 IntroductionAdvisor

`Advisor` 是SpringBoot中对AOP的抽象。包括了两部分:
1. 拦截谁？ 即`PointCut`/`ClassFilter`.
2. 干什么？ 即 `Advice`/`Interceptor`。
在`IntroductionAdvisor` 中可以这样使用:  

首先要引入`AOP`依赖，即
```
org.springframework.boot:spring-boot-starter-aop
```

- 定义两个接口, 一个也行，有一个并不需要实现即可
```java
public interface Book {
    void read();
}

public interface MyInterface {
    void say();
}
```

- 定义一个要增强的MyBook类，并不实现`MyInterface`。
```java
@Component
public class MyBook implements Book {

    @Override
    public void read() {
        System.out.println("read Book");
    }

}
```

- 定义一个`Inteceptor`, 即代理实现逻辑。
这里直接使用了`DelegatingIntroductionInterceptor` 简化了调用。
这里的默认逻辑在查找接口的时候是基于当前实现类MyInterfaceInterceptor查找暴露的接口，可能不够全, 但是这里只用了MyInterface。只需要和自己支持的接口匹配即可。
这样就不会有`validateInterfaces`的问题。
  
```java
public class MyInterfaceInterceptor extends DelegatingIntroductionInterceptor implements MyInterface {

    @Override
    public void say() {
        System.out.println("haha Say() from My Interface");
    }

}

```

- 定义一个`Advisor`组织起来"要拦谁，干什么"。

```java
  public class MyDefaultIntroductionAdvisor implements IntroductionAdvisor {

     // 拦截所有Book类的子类
    @Override
    public ClassFilter getClassFilter() {
        return Book.class::isAssignableFrom;
    }

    @Override
    public void validateInterfaces() throws IllegalArgumentException {
        
    }

    // 暴露出去的Advice, 负责接管对MyInterface的调用逻辑
    @Override
    public Advice getAdvice() {
        return new MyInterfaceInterceptor();
    }

    // 给拦截的类`额外`暴露出去MyInterface.class这个接口
    @Override
    public Class<?>[] getInterfaces() {
        return new Class[]{MyInterface.class};
    }
}
```
然后就完成了。
```java
@Component
public class FinishTest implements ApplicationListener<ApplicationStartedEvent> {

    @Override
    public void onApplicationEvent(ApplicationStartedEvent event) {
        final Book myBook = event.getApplicationContext().getBean(MyBook.class);
        System.out.println(myBook.getClass());
        System.out.println(Arrays.toString(myBook.getClass().getInterfaces()));
        myBook.read();
        final MyInterface myBook1 = (MyInterface) myBook;
        myBook1.say();
    }
}

```