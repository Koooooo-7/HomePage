# SpringBoot源码02 -- SpringBoot 启动流程

> 本文相关源码的SpringBoot版本 :

```shell
E:\workspace\spring-boot>git status

HEAD detached at v2.1.0.RELEASE
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)

```



## 启动应用

首先，我们就直接从入口进去，这里我们从源码（`org.springframework.boot.SpringApplication#main`）的这里进去来看看这个run方法究竟做了什么，是的，你没看错，内部有自带的main方法。

```java
/**
	 * A basic main that can be used to launch an application. This method is useful when
	 * application sources are defined via a {@literal --spring.main.sources} command line
	 * argument.
	 * <p>
	 * Most developers will want to define their own main method and call the
	 * {@link #run(Class, String...) run} method instead.
	 * @param args command line arguments
	 * @throws Exception if the application cannot be started
	 * @see SpringApplication#run(Class[], String[])
	 * @see SpringApplication#run(Class, String...)
	 */
	public static void main(String[] args) throws Exception {
		SpringApplication.run(new Class<?>[0], args);
	}
```



我们可以看到，这里是创建了`SpringApplication`对象，返回`ApplicationContext`对象。

```java
/**
	 * Static helper that can be used to run a {@link SpringApplication} from the
	 * specified sources using default settings and user supplied arguments.
	 * @param primarySources the primary sources to load
	 * @param args the application arguments (usually passed from a Java main method)
	 * @return the running {@link ApplicationContext}
	 */
	public static ConfigurableApplicationContext run(Class<?>[] primarySources,
			String[] args) {
		return new SpringApplication(primarySources).run(args);
	}
```



## 创建SpringApplication实例

```java
/**
	 * Create a new {@link SpringApplication} instance. The application context will load
	 * beans from the specified primary sources (see {@link SpringApplication class-level}
	 * documentation for details. The instance can be customized before calling
	 * {@link #run(String...)}.
	 * @param resourceLoader the resource loader to use
	 * @param primarySources the primary bean sources
	 * @see #run(Class, String[])
	 * @see #setSources(Set)
	 */
	@SuppressWarnings({ "unchecked", "rawtypes" })
	public SpringApplication(ResourceLoader resourceLoader, Class<?>... primarySources) {
		this.resourceLoader = resourceLoader;
		Assert.notNull(primarySources, "PrimarySources must not be null");
		this.primarySources = new LinkedHashSet<>(Arrays.asList(primarySources));
        // 推断应用的类型：REACTIVE应用、SERVLET应用（默认）、NONE 三种中的某一种，是否需要启动内嵌的web server
        // org.springframework.boot.WebApplicationType#deduceFromClasspath
		this.webApplicationType = WebApplicationType.deduceFromClasspath();
        // SpringFactoriesLoader查找并加载 classpath下 META-INF/spring.factories文件中所有可用的 ApplicationContextInitializer
		setInitializers((Collection) getSpringFactoriesInstances(
				ApplicationContextInitializer.class));
        // SpringFactoriesLoader查找并加载 classpath下 META-INF/spring.factories文件中所有可用的 ApplicationListener
		setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));
        // 推断main函数所在类的方法
		this.mainApplicationClass = deduceMainApplicationClass();
	}
```

> 看到加载`META-INF/spring.factories`很容易就可以想到自己自定义一个新的`Springboot starter`注册到`SpringBoot`的流程。



## 前置准备完毕，run

然后就进入了`run`方法。

```java
/**
	 * Run the Spring application, creating and refreshing a new
	 * {@link ApplicationContext}.
	 * @param args the application arguments (usually passed from a Java main method)
	 * @return a running {@link ApplicationContext}
	 */
	public ConfigurableApplicationContext run(String... args) {
        // stopWatch，一般我们也开发应该在关键位置打上耗时，也便于性能优化
		StopWatch stopWatch = new StopWatch();
		stopWatch.start();
		ConfigurableApplicationContext context = null;
        // 用来存储异常报告器，用来报告SpringBoot启动过程的异常
		Collection<SpringBootExceptionReporter> exceptionReporters = new ArrayList<>();
        // Headless模式是系统的一种配置模式。在系统可能缺少显示设备、键盘或鼠标这些外设的情况下可以使用该模式。
        // 在服务器开发的时候，显然要忽略这些东西，同时也可以联想到做自动化测试或者爬虫时使用无头浏览器。
        // 配置headless属性，即java.awt.headless属性。
		configureHeadlessProperty();
        // 启动SpringApplicationRunListener的监听，表示SpringApplication开始启动。
		SpringApplicationRunListeners listeners = getRunListeners(args);
        // 发送ApplicationStartingEvent事件
		listeners.starting();
		try {
            // 创建ApplicationArguments用来封装应用的启动参数args
			ApplicationArguments applicationArguments = new DefaultApplicationArguments(
					args);
			ConfigurableEnvironment environment = prepareEnvironment(listeners,
					applicationArguments);
			configureIgnoreBeanInfo(environment);
			Banner printedBanner = printBanner(environment);
            // 根据不同类型创建不同类型的Spring ApplicationContext容器(在之前deduceFromClasspath方法判断过类型)
			context = createApplicationContext();
			exceptionReporters = getSpringFactoriesInstances(
					SpringBootExceptionReporter.class,
					new Class[] { ConfigurableApplicationContext.class }, context);
            // 创建完context后进行一些环境和监听器的初步设置工作
			prepareContext(context, environment, listeners, applicationArguments,
					printedBanner);
            // 刷新，这一步就是涉及到bean的加载，后置处理器调用和循环依赖解决等问题的步骤，核心
			refreshContext(context);
            // 执行刷新容器后的方法，空方法，扩展点
			afterRefresh(context, applicationArguments);
			stopWatch.stop();
			if (this.logStartupInfo) {
				new StartupInfoLogger(this.mainApplicationClass)
						.logStarted(getApplicationLog(), stopWatch);
			}
            
            // 发送ApplicationStartedEvent事件，标志spring容器已经刷新，此时所有的bean实例都已经加载完毕
			listeners.started(context);
			callRunners(context, applicationArguments);
		}
		catch (Throwable ex) {
			handleRunFailure(context, ex, exceptionReporters, listeners);
			throw new IllegalStateException(ex);
		}

		try {
			listeners.running(context);
		}
		catch (Throwable ex) {
			handleRunFailure(context, ex, exceptionReporters, null);
			throw new IllegalStateException(ex);
		}
		return context;
	}

```

## 参考

[SpringBoot的启动流程是怎样的？](https://segmentfault.com/a/1190000022119546)

[spring扩展点之五：ApplicationContextInitializer实现与使用](https://www.cnblogs.com/duanxz/p/11239291.html)

[推断main函数所在类原理](http://www.3kkg.com/1133)