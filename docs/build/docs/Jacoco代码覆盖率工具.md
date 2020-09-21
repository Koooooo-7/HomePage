# Jacoco代码覆盖率工具



> 因为需要搭建和整合这一套到Jenkins的CI/CD中，所以纪录一下。在Maven的项目跟着Sonar放到`github workflow`整合倒是十分方便。



## 原理

> `On-the-fly` ：**不经过某种额外步骤而直接进行某项活动**，即兴，简单，随手而为。放在这里就是说不需要进行停机或者其他太多额外的处理。

JaCoCo使用类文件检测来记录执行范围数据。单独说一下它的`Java Agent中的On-the-fly`模式，其实就是通过字节码增强`ASM`技术。在JVM中通过`-javaagent`参数指定特定的jar文件启动`Instrumentation`的代理程序，代理程序在通过`Class Loader`装载一个`class`前判断是否转换修改`class`文件，将统计代码（`Probe探针`）插入`class`，测试覆盖率分析可以在JVM执行测试代码的过程中完成。这个过程即`插桩`。

JaCoCo代理收集执行信息，并根据请求或JVM退出时（实现了`Runtime.getRuntime().addShutdownHook`钩子函数）转储它。

## 基础使用

其代理jacocoagent.jar是JaCoCo发行版的一部分，包含所有必需的依赖关系。可以使用以下JVM选项激活Java代理：

`-javaagent:[yourpath/]jacocoagent.jar=[option1]=[value1],[option2]=[value2]`

>  参数说明原版见[官网Java-agent参数说明](https://www.eclemma.org/jacoco/trunk/doc/agent.html)。

| 选项                  | 描述                                                         | 默认                              |
| :-------------------- | :----------------------------------------------------------- | :-------------------------------- |
| destfile              | 执行数据的输出文件的路径。                                   | jacoco.exec                       |
| append                | 如果设置为true并且执行数据文件已经存在，则将覆盖数据附加到现有文件。如果设置为 false，则将替换现有的执行数据文件。 | true                              |
| includes              | 执行分析中应包含的类名列表。列表条目以冒号（:）分隔，可以使用通配符（*和?）。除了性能优化或技术角落案例，通常不需要此选项。 | * （所有类）                      |
| excludes              | 应从执行分析中排除的类名称列表。列表条目以冒号（:）分隔，可以使用通配符（*和?）。除了性能优化或技术角落案例，通常不需要此选项。 | 空（不排除类）                    |
| exclclassloader       | 应从执行分析中排除的类加载器名称的列表。列表条目以冒号（:）分隔，可以使用通配符（*和 ?）。如果特殊框架与JaCoCo代码工具发生冲突，特别是无法访问Java运行时类的类加载器，则可能需要此选项。 | sun.reflect.DelegatingClassLoader |
| inclbootstrapclasses  | 指定是否还应该检测引导类加载器的类。谨慎使用此功能，需要大量包括/不包括调整。 | false                             |
| inclnolocationclasses | 指定是否还应该检测没有源位置的类。通常这样的类是在运行时产生的，例如通过模拟框架，因此在默认情况下被排除。 | false                             |
| sessionid             | 与执行数据一起写入的会话标识符。没有这个参数，代理就会创建一个随机的标识符。 | 自动生成                          |
| dumponexit            | 如果设置为true覆盖数据，将在VM关闭时写入。如果file指定了转储，或者输出为tcpserver/ tcpclient 并且在虚拟机终止时连接处于打开状态，则只能写入转储。 | true                              |
| output                | 用于写入覆盖率数据的输出方法。有效的选项是：<br /> **file：**在虚拟机终止执行数据写入destfile属性中指定的文件。 <br />**tcpserver：**代理侦听由address和port属性指定的TCP端口上的传入连接。执行数据被写入到这个TCP连接。<br /> **tcpclient：**启动时，代理将连接到由address和port属性指定的TCP端口。执行数据被写入到这个TCP连接。 <br />**none：**不要产生任何输出。 | file                              |
| address               | 当输出方法为tcpserver或连接到 输出方法时要绑定的IP地址或主机名 tcpclient。在tcpserver模式中，值“ *”使代理接受任何本地地址上的连接。 | 回环接口                          |
| port                  | 当输出方法是绑定的端口，tcpserver或者当输出方法是连接的端口tcpclient。在 tcpserver模式下，端口必须可用，这意味着如果多个JaCoCo代理应该在同一台机器上运行，则必须指定不同的端口。 | 6300                              |
| classdumpdir          | agent所调用到的所有class文件的目录。这可以用于调试目的，或者在动态创建类的情况下，例如当使用脚本引擎时。 | 没有转储                          |
| jmx                   | 如果设置为true代理通过名称下的JMX 公开 功能org.jacoco:type=Runtime。请参阅下面的安全考虑。 | false                             |

## 参考

[Jacoco 插桩的不同形式总结和踩坑记录](https://testerhome.com/topics/20632)

[[腾讯 TMQ] JAVA 代码覆盖率工具 JaCoCo-原理篇](https://testerhome.com/topics/5757)

[JACOCO搭建指南](https://www.bstester.com/2019/06/jacoco-da-jian-zhi-nan)

[Jacoco官网 -  Java Agent](https://www.eclemma.org/jacoco/trunk/doc/agent.html)
[Jacoco整合Jenkins](https://www.cnblogs.com/h-zhang/p/12206917.html#_caption0)



