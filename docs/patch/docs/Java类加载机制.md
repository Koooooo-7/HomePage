# 类加载

> 其实这个东西已经遇到很多次了，看`Dubbo`的增强`SPI`扩展时又遇到了，不如，就记录下来吧。:feet:

## 类加载机制

> 类加载概念：Java虚拟机`.class`文件加载到内存，并对数据进行校验、转换解析(连接)和初始化，然后被使用和卸载。
>
> `.class`文件由类装载器装载后，在`JVM`将形成一份描述Class结构的元信息对象(如`String.class`)。
>
> 通过该元信息对象可以获知Class的结构信息：用户可以借由这个Class相关的元信息对象间接调用Class对象的功能(如`反射`)。



## 类加载过程

![img](_media\20201224-01)



- 加载

  将类的`.class`以二进制数据字节流的形式读入到内存中，将其放在运行时数据区的`方法区`内，然后在堆区创建一个`java.lang.Class`对象，用来封装类在方法区内的数据结构。

- 连接

  - 验证

    验证的目的是为了确保Class文件中的字节流包含的信息符合当前虚拟机的要求，而且不会危害虚拟机自身的安全。

    大致都会完成以下四个阶段的验证：文件格式的验证、元数据的验证、字节码验证和符号引用验证。

  - 准备

    是正式为类变量分配内存并设置类变量初始值的阶段，这些内存都将在方法区中进行分配。

  - 解析

    解析阶段是虚拟机将常量池内的符号引用替换为直接引用的过程。

- 初始化

   初始化，为类的静态变量赋予正确的初始值，`JVM`负责对类进行初始化，主要对类变量进行初始化。

- 使用

- 卸载



同时，这里也可以引出另外一个问题，`如果静态代码块在初始化时抛出异常会怎么样`(遇到过有人花样作死:dog:)。

答案是会抛出`java.lang.NoClassDefFoundError`异常。

而这个问题简单来说就是在类初始化静态代码块报错后，会被标记为**`erroneous state`**，在调用时并不会重新加载，而是检测到该状态后抛出异常。



## 类加载器

> `一个类在JVM中的唯一性` = `类加载器`+`类全限定名`

对于任何一个类，都需要由加载它的类加载器和这个类来确立其在`JVM`中的唯一性。

也就是说，只有两个类来源于同一个Class文件，并且被同一个类加载器加载，这两个类才相等。

同时，一个类所引用的类，也应是由同一类加载器加载的(`SPI打破了这种机制，下面会讲`)。

这里即是获取默认的类加载器，native方法`getClassLoader0()`返回的就是调用者的类加载器。

```java
 @CallerSensitive
    public ClassLoader getClassLoader() {
        ClassLoader cl = getClassLoader0();
        if (cl == null)
            return null;
        SecurityManager sm = System.getSecurityManager();
        if (sm != null) {
            ClassLoader.checkClassLoaderPermission(cl, Reflection.getCallerClass());
        }
        return cl;
    }
```



### 双亲委派模型

> 注意：这里的双亲委派，并没有继承关系，只是一个向上委托`parent`加载器去加载的流程。

![class loader](_media\20201225-01.png)

`java.lang.ClassLoader#loadClass(java.lang.String, boolean)`的源码如下。

```java
 protected Class<?> loadClass(String name, boolean resolve)
        throws ClassNotFoundException
    {
        synchronized (getClassLoadingLock(name)) {
            // First, check if the class has already been loaded
            Class<?> c = findLoadedClass(name);
            if (c == null) {
                long t0 = System.nanoTime();
                try {
                    if (parent != null) {
                        c = parent.loadClass(name, false);
                    } else {
                        c = findBootstrapClassOrNull(name);
                    }
                } catch (ClassNotFoundException e) {
                    // ClassNotFoundException thrown if class not found
                    // from the non-null parent class loader
                }

                if (c == null) {
                    // If still not found, then invoke findClass in order
                    // to find the class.
                    long t1 = System.nanoTime();
                    c = findClass(name);

                    // this is the defining class loader; record the stats
                    sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                    sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                    sun.misc.PerfCounter.getFindClasses().increment();
                }
            }
            if (resolve) {
                resolveClass(c);
            }
            return c;
        }
    
```



从虚拟机的角度来说，只存在两种不同的类加载器：

一种是启动类加载器（`Bootstrap ClassLoader`），该类加载器使用C++语言实现，属于虚拟机自身的一部分。

另外一种就是所有其它的类加载器，这些类加载器是由Java语言实现，独立于`JVM`外部，并且全部继承自抽象类`java.lang.ClassLoader`。



从Java开发人员的角度来看，大部分Java程序一般会使用到以下三种系统提供的类加载器：

- 启动类加载器（`Bootstrap ClassLoader`）：负责加载`<JAVA_HOME>\lib`目录中并且能被虚拟机识别的类库到JVM内存中，如果名称不符合的类库即使放在lib目录中也不会被加载。该类加载器无法被Java程序直接引用。

- 扩展类加载器（`Extension ClassLoader`）：该加载器主要是负责加载`<JAVA_HOME>\lib\ext`目录中或被`java.ext.dirs`系统变量所指定的路径的类库。

- 应用程序类加载器（`Application ClassLoader`）：该类加载器也称为系统类加载器，它负责加载用户类路径（`classpath`）上所指定的类库，开发者可以直接使用该类加载器，如果应用程序中没有自定义过自己的类加载器，一般情况下这个就是程序中默认的类加载器。



### 自定义类加载器

当我们需要动态加载jar或者`.class`文件时，来自于网络资源或者非`classpath`时，就需要使用我们的自定义加载器来指定加载的目录。

```java
public class MyClassLoader extends ClassLoader {

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        try {
            // 查找.class文件
            FileInputStream fis = new FileInputStream(new File("/tmp/classes/" + name + ".class"));
            FileChannel fc = fis.getChannel();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            // NIO 读取
            WritableByteChannel wbc = Channels.newChannel(baos);
            ByteBuffer by = ByteBuffer.allocate(1024);

            while (true) {
                int i = fc.read(by);
                if (i == 0 || i == -1)
                    break;
                by.flip();
                wbc.write(by);
                by.clear();
            }
            byte[] bytes = baos.toByteArray();
            // 交给defineClass
            return defineClass(name, bytes, 0, bytes.length);
        } catch (Exception ignore) {
        }

        return null;
    }
}
```



### 线程上下文加载器

```java
ClassLoader cl = Thread.currentThread().getContextClassLoader();
```

线程上下文加载器是打破了`双亲委派模型`的，为什么这么说呢，那就要说一下`SPI`机制。

#### SPI

> `SPI`全称`Service Provider Interface`，是Java提供的一套用来被第三方实现或者扩展的API，它可以用来启用框架扩展和替换组件。常见的 `SPI` 有 `JDBC、JCE、JNDI、JAXP 和 JBI` 等。
>
> 这些 `SPI` 的接口由 `Java` 核心库来提供，而这些` SPI` 的实现代码则是作为 Java 应用所依赖的 jar 包被包含进类路径`（classpath）`里。

那么问题来了，**SPI的接口**是Java核心库的一部分，是由**启动类加载器(Bootstrap Classloader)**来加载的；**SPI的实现类**是由**系统类加载器(System ClassLoader)**来加载的。引导类加载器是无法找到 SPI 的实现类的，因为依照双亲委派模型，`BootstrapClassloader`无法委派`AppClassLoader`来加载类。

而线程上下文类加载器破坏了“双亲委派模型”，可以在执行线程中抛弃双亲委派加载链模式，使程序可以逆向使用类加载器。

简单来说就是：

> `ClassLoader cl = Thread.currentThread().getContextClassLoader()`;

在`ContextClassLoader`默认存放了`AppClassLoader`的引用，由于它是在**运行时**被放在了线程中，所以不管当前程序处于何处（`BootstrapClassLoader`或是`ExtClassLoader`等），在任何需要的时候都可以用`Thread.currentThread().getContextClassLoader()`取出应用程序类加载器来完成需要的操作，哪怕你是在由`BootstrapClassLoader`加载的类里面要创建依赖。

常见的使用，就是数据库驱动，当然，还有`Dubbo`自己的增强版`SPI`，下面我们讲一下`JDBC`。

**JDBC**

```java
// 加载Class到AppClassLoader（系统类加载器），然后注册驱动类
// Class.forName("com.mysql.jdbc.Driver").newInstance(); 
String url = "jdbc:mysql://localhost:3306/testdb";    
// 通过java库获取数据库连接
Connection conn = java.sql.DriverManager.getConnection(url, "name", "password"); 
```

我们这样可以拿到Connection对象是为什么呢，我们先看`DriverManager.getConnection()(./Java/jdk1.8.0_261/src.zip!/java/sql/DriverManager.java:100)`中。

```java
    /**
     * Load the initial JDBC drivers by checking the System property
     * jdbc.properties and then use the {@code ServiceLoader} mechanism
     */
    static {
        loadInitialDrivers();
        println("JDBC DriverManager initialized");
    }
```

在初始化类的时候会自动调用静态代码块，所以说会执行`loadInitialDrivers()`方法。

这里的`java.sql.DriverManager`很显然是由`BootstrapClassLoader`加载的。

但是对于驱动的实现`com.mysql.jdbc.Driver.Class`并不在`Java`自己的系统目录下，那么`BootstrapClassLoader`显然加载不了，怎么办呢，就从上下文加载器中获取到`AppClassLoader`来加载约定好的应用目录下（`META-INF/services`）的实现类。

## 参考

[Java类加载机制](https://juejin.cn/post/6844903564804882445)

[初始化静态代码块异常](https://stackoverflow.com/questions/6352215/why-noclassdeffounderror-caused-by-static-field-initialization-failure)

[Difference between thread's context class loader and normal classloader](https://stackoverflow.com/questions/1771679/difference-between-threads-context-class-loader-and-normal-classloader)

[真正理解线程上下文类加载器（多案例分析）](https://blog.csdn.net/yangcheng33/article/details/52631940)

[Java中SPI机制深入及源码解析](https://cxis.me/2017/04/17/Java%E4%B8%ADSPI%E6%9C%BA%E5%88%B6%E6%B7%B1%E5%85%A5%E5%8F%8A%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90/)