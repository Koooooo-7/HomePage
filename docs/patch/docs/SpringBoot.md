# SpringBoot构建优化
参考文档
- [Project leyden](https://spring.io/blog/2024/08/29/spring-boot-cds-support-and-project-leyden-anticipation)
- [Springboot Dockerfiles](https://docs.spring.io/spring-boot/reference/packaging/container-images/dockerfiles.html)


SpringBoot默认会构建成一个`uberjar(fatjar)`来可以直接执行。
如果把这个jar直接打入镜像，不如使用分层构建来使应用的image减轻, 可以在本地测试。

进行依赖导出。

在target下执行
```
java -Djarmode=tools -jar app.jar extract --layers --destination extracted
```
会得到两个目录`application`和`dependencies`。
```
├── extracted
│   ├── application
│   │   └── app.jar
│   ├── dependencies
│   │   └── lib
│   │       ├── HikariCP-5.1.0.jar
│   │       ├── aalto-xml-1.3.3.jar
│   │       ├── bcpkix-jdk18on-1.78.1.jar
│   │       ├── bcprov-jdk18on-1.78.1.jar
│   │       ├── bcutil-jdk18on-1.78.1.jar
│   │       ├── cache-api-1.1.1.jar
│   ├── snapshot-dependencies
│   └── spring-boot-loader


```

- application
  包含应用所在的classes的瘦身后的app.jar, 和之前的fatjar不同，尽管名字一样。
- dependencies/lib
  所有依赖的jar，和fatjar中的一样。

使用分层构建可以将依赖和构建都留给上层镜像，而只留下必要的内容, 示例来自SpringBoot。
```dockerfile
# Perform the extraction in a separate builder container
FROM bellsoft/liberica-openjre-debian:17-cds AS builder
WORKDIR /builder
# This points to the built jar file in the target folder
# Adjust this to 'build/libs/*.jar' if you're using Gradle
ARG JAR_FILE=target/*.jar
# Copy the jar file to the working directory and rename it to application.jar
COPY ${JAR_FILE} application.jar
# Extract the jar file using an efficient layout
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

# This is the runtime container
FROM bellsoft/liberica-openjre-debian:17-cds
WORKDIR /application
# Copy the extracted jar contents from the builder container into the working directory in the runtime container
# Every copy step creates a new docker layer
# This allows docker to only pull the changes it really needs
COPY --from=builder /builder/extracted/dependencies/ ./
COPY --from=builder /builder/extracted/spring-boot-loader/ ./
COPY --from=builder /builder/extracted/snapshot-dependencies/ ./
COPY --from=builder /builder/extracted/application/ ./
# Start the application jar - this is not the uber jar used by the builder
# This jar only contains application code and references to the extracted jar files
# This layout is efficient to start up and CDS friendly
ENTRYPOINT ["java", "-jar", "application.jar"]
```

这就完了吗，不，还有后续，即`CDS` （Class Data Sharing）。 
SpringBoot在3.3.4版本后支持[CDS](https://docs.spring.io/spring-boot/reference/packaging/class-data-sharing.html), 即给应用做一次warmup之后，记录下所需要的load的
一些class, JVM dump下来成为`jsa`文件后就成为一个shared archive做memory map。
```
When the JVM starts, the shared archive is memory-mapped to allow sharing of read-only JVM metadata for these classes among multiple JVM processes. Because accessing the shared archive is faster than loading the classes, startup time is reduced.
```
这个很简单，直接在生成的extracted目录下即可运行下面的命令来生成`jsa`文件。
```
java -XX:ArchiveClassesAtExit=application.jsa -Dspring.context.exit=onRefresh -jar app.jar
```
但是当你遇到`CDS没有enable`导致的没有`jsa`文件生成这个问题时，你需要先运行`java -Xshare:dump`。
```
-Xshare:on：启用共享类数据，JVM 会加载并使用已经存在的共享类数据文件。
-Xshare:off：禁用共享类数据，不使用共享的类数据文件。
-Xshare:auto：自动判断是否使用共享类数据文件。
```
然后再使用它,同时这里会生成`cds.log`文件来log类是从哪里加载的。
```
java -Xlog:class+load:file=cds.log  -XX:SharedArchiveFile=application.jsa -jar app.jar

```
打开log文件你会看到这样的内容。
```cds.log
[0.051s][info][class,load] java.lang.Object source: shared objects file
[0.052s][info][class,load] java.io.Serializable source: shared objects file
[0.052s][info][class,load] java.lang.Comparable source: shared objects file
[0.052s][info][class,load] java.lang.CharSequence source: shared objects file
[0.052s][info][class,load] java.lang.constant.Constable source: shared objects file
[0.052s][info][class,load] java.lang.constant.ConstantDesc source: shared objects file
[0.052s][info][class,load] java.lang.String source: shared objects file
[0.052s][info][class,load] java.lang.reflect.AnnotatedElement source: shared objects file
[0.052s][info][class,load] java.lang.reflect.GenericDeclaration source: shared objects file
[0.052s][info][class,load] java.lang.reflect.Type source: shared objects file
[0.052s][info][class,load] java.lang.invoke.TypeDescriptor source: shared objects file
[0.052s][info][class,load] java.lang.invoke.TypeDescriptor$OfField source: shared objects file
[0.052s][info][class,load] java.lang.Class source: shared objects file
[0.052s][info][class,load] java.lang.Cloneable source: shared objects file
[0.052s][info][class,load] java.lang.ClassLoader source: shared objects file
[0.052s][info][class,load] java.lang.System source: shared objects file
[0.052s][info][class,load] java.lang.Throwable source: shared objects file
...
```

只需要在上面的镜像加上生成`jsa`文件的操作即可。

相比于native build，这个算是一个折中的方案，不会有太多的refactor的effort也不会有过长的构建时间。
但是获得的效果也没有native好，大概是可以提升2~3倍左右，作为一个过渡，还是很可以的。
后面可能更需要关注的，可能就是SpringBoot带来的优化的SpringIoT了。


---
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
