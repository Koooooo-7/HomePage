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
然后就可以这样测试了。
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
---
查看生成的字节码。
在VM参数添加`-Dcglib.debugLocation=./`输出到当前目录，系统参数在IDEA不生效。:dog:
```java
public class MyBook$$SpringCGLIB$$0 extends MyBook implements MyInterface, SpringProxy, Advised, Factory {
    // 省略其他生成部分... 
    private static final Method CGLIB$say$5$Method;
    private static final MethodProxy CGLIB$say$5$Proxy;

    static void CGLIB$STATICHOOK5() {
        CGLIB$THREAD_CALLBACKS = new ThreadLocal();
        CGLIB$emptyArgs = new Object[0];
        Class var0 = Class.forName("com.example.webflux.intro.MyBook$$SpringCGLIB$$0");
        Class var1;
        // 被代理的接口的原始方法
        CGLIB$say$5$Method = ReflectUtils.findMethods(new String[]{"say", "()V"}, (var1 = Class.forName("com.example.webflux.intro.MyInterface")).getDeclaredMethods())[0];
        // 被代理的接口的代理方法
        CGLIB$say$5$Proxy = MethodProxy.create(var1, var0, "()V", "say", "CGLIB$say$5");
        // ... toString equals..
    }

     // 原始方法
     final void CGLIB$say$5() {
        super.say();
    }

    // 子类复写的方法，保证了先去调用MethodInterceptor代理
    public final void say() {
        MethodInterceptor var10000 = this.CGLIB$CALLBACK_0;
        if (var10000 == null) {
            CGLIB$BIND_CALLBACKS(this);
            var10000 = this.CGLIB$CALLBACK_0;
        }

        if (var10000 != null) {
            var10000.intercept(this, CGLIB$say$5$Method, CGLIB$emptyArgs, CGLIB$say$5$Proxy);
        } else {
            super.say();
        }
    }


```

最后会走到`MethodInterceptor`中，而这个就是spring生成的代理类的interceptor所在地。
可以发现它实现了cglib所需要的`Callback`。
```java
package org.springframework.cglib.proxy;

public interface MethodInterceptor
extends Callback
{
    /**
     * All generated proxied methods call this method instead of the original method.
     * The original method may either be invoked by normal reflection using the Method object,
     * or by using the MethodProxy (faster).
     * @param obj "this", the enhanced object
     * @param method intercepted Method
     * @param args argument array; primitive types are wrapped
     * @param proxy used to invoke super (non-intercepted method); may be called
     * as many times as needed
     * @throws Throwable any exception may be thrown; if so, super method will not be invoked
     * @return any value compatible with the signature of the proxied method. Method returning void will ignore this value.
     * @see MethodProxy
     */
    public Object intercept(Object obj, java.lang.reflect.Method method, Object[] args,
                               MethodProxy proxy) throws Throwable;

}
```

对于类，cglib可以这样代理，对于接口也可以，同JDK代理一样。
对于一个接口，还是实现一个代理类并且注册相应的代理Callback。
> JDK > 8 需要设置额外反射参数
```
--add-opens java.base/java.lang=ALL-UNNAMED -Dcglib.debugLocation=./
```


```java
public interface EmptyInterface {

    String say();
}

public static void main(String[] args) {

        Enhancer enhancer = new Enhancer();
        enhancer.setSuperclass(Object.class);
        enhancer.setInterfaces(new Class[]{EmptyInterface.class});
        enhancer.setCallback((MethodInterceptor) (obj, method, args1, proxy) -> {
            System.out.println("Call method is: " + method);
            if (method.getName().equals("say")) {
                return "proxySay";
            }
            return method.invoke(obj);
        });

        EmptyInterface proxy = (EmptyInterface) enhancer.create();
        var result = proxy.say();
        System.out.println(result);
}

```

```java
public class EmptyInterface$$EnhancerByCGLIB$$4ce371ed implements EmptyInterface, Factory {
    // ,,,
}
```
