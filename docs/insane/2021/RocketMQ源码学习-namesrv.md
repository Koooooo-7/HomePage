# RocketMQ源码学习- namesrv

## 概述

**`namesrv`模块下分为**

- `NamesrvStartup`

  解析命令行参数，获取配置信息，构造`NamesrvController`启动。

- `NamesrvController`

  Controller，接收相应的的请求。

- `kvconfig`目录

  `KVConfigManager`保存相关的映射参数。

- `processor`目录

  `netty`套壳。

- `routeinfo`目录

  管理相关的注册信息，包括`broker`,`topic`等等。



## NameStartup

> org.apache.rocketmq.namesrv.NamesrvStartup

### `main0(String[] args)`

这个类就是入口了，它的实现逻辑都放在了`main0`方法中。

```java
    public static NamesrvController main0(String[] args) {

        try {
            // 解析命令参数创建controller
            NamesrvController controller = createNamesrvController(args);
            // 启动
            start(controller);
            String tip = "The Name Server boot success. serializeType=" + RemotingCommand.getSerializeTypeConfigInThisServer();
            log.info(tip);
            System.out.printf("%s%n", tip);
            return controller;
        } catch (Throwable e) {
            e.printStackTrace();
            System.exit(-1);
        }

        return null;
    }
```



### `createNamesrvController(String[] args)`

这里看到的就是要进入`createNamesrvController`方法内去看具体是如何创建`NamesrvController`然后通过`start(controller)`来启动服务的。

```java
    public static NamesrvController createNamesrvController(String[] args) throws IOException, JoranException {
        System.setProperty(RemotingCommand.REMOTING_VERSION_KEY, Integer.toString(MQVersion.CURRENT_VERSION));
        //PackageConflictDetect.detectFastjson();
        // 初始化解析命令行解析，这里写的感觉可以根据《Clean Code》中的demo来重构一波。
        Options options = ServerUtil.buildCommandlineOptions(new Options());
        commandLine = ServerUtil.parseCmdLine("mqnamesrv", args, buildCommandlineOptions(options), new PosixParser());
        if (null == commandLine) {
            System.exit(-1);
            return null;
        }

        // 参数解析主要就是为了生成下面这两个对象
        final NamesrvConfig namesrvConfig = new NamesrvConfig();
        final NettyServerConfig nettyServerConfig = new NettyServerConfig();
        // 设置监听端口9876
        nettyServerConfig.setListenPort(9876);
        if (commandLine.hasOption('c')) {
            String file = commandLine.getOptionValue('c');
            if (file != null) {
                InputStream in = new BufferedInputStream(new FileInputStream(file));
                properties = new Properties();
                properties.load(in);
                MixAll.properties2Object(properties, namesrvConfig);
                MixAll.properties2Object(properties, nettyServerConfig);

                namesrvConfig.setConfigStorePath(file);

                System.out.printf("load config properties file OK, %s%n", file);
                in.close();
            }
        }

        if (commandLine.hasOption('p')) {
            InternalLogger console = InternalLoggerFactory.getLogger(LoggerName.NAMESRV_CONSOLE_NAME);
            MixAll.printObjectProperties(console, namesrvConfig);
            MixAll.printObjectProperties(console, nettyServerConfig);
            System.exit(0);
        }

        MixAll.properties2Object(ServerUtil.commandLine2Properties(commandLine), namesrvConfig);

        if (null == namesrvConfig.getRocketmqHome()) {
            System.out.printf("Please set the %s variable in your environment to match the location of the RocketMQ installation%n", MixAll.ROCKETMQ_HOME_ENV);
            System.exit(-2);
        }

        LoggerContext lc = (LoggerContext) LoggerFactory.getILoggerFactory();
        JoranConfigurator configurator = new JoranConfigurator();
        configurator.setContext(lc);
        lc.reset();
        configurator.doConfigure(namesrvConfig.getRocketmqHome() + "/conf/logback_namesrv.xml");

        log = InternalLoggerFactory.getLogger(LoggerName.NAMESRV_LOGGER_NAME);

        MixAll.printObjectProperties(log, namesrvConfig);
        MixAll.printObjectProperties(log, nettyServerConfig);

        // 根据解析完毕的 namesrvConfig 和nettyServerConfig来完成对controller的装配。 
        final NamesrvController controller = new NamesrvController(namesrvConfig 和nettyServerConfig来完成对controller的装配。 );

        // remember all configs to prevent discard
        controller.getConfiguration().registerConfig(properties);

        return controller;
    }
```



### `start(final NamesrvController controller)`

然后就进入了`start`方法。

```java
    public static NamesrvController start(final NamesrvController controller) throws Exception {

        if (null == controller) {
            throw new IllegalArgumentException("NamesrvController is null");
        }

        // 初始化controller
        boolean initResult = controller.initialize();
        if (!initResult) {
            controller.shutdown();
            System.exit(-3);
        }

        // 注册shotdown钩子
        Runtime.getRuntime().addShutdownHook(new ShutdownHookThread(log, new Callable<Void>() {
            @Override
            public Void call() throws Exception {
                controller.shutdown();
                return null;
            }
        }));

        // 到这里是真的启动了，调用的是controller的start方法
        controller.start();

        return controller;
    }
```

