# Gatlin - Performance 测试

> Gatlin https://gatling.io/

有时候我们需要对自己的接口做一些`e2e`压测，通常可能会用`JMeter`来做这个。

但是除此之外，还有其他的负载测试工具用在不同的环节里，[`Gatlin`](https://gatling.io/)就是其中之一，它很容易集成到如`Jenkins`之中，也是我目前所用到的新的测试工具，并且使用`Java`+`Scala`的模式开发。

---

> Load-Test-As-Code: the best way to load test your applications, designed for **DevOps and CI/CD**. -- gatling.io



## Simulation

`Gatlin`测试形式基本上也是`BDD`的延伸，形式和`Cucumber`很像，也是基于不同的`scenario`。

> HTTP Sample - Java

```java
//package computerdatabase; // 1

// 2
import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

class BasicSimulationJava extends Simulation { // 3

  HttpProtocolBuilder httpProtocol = http // 4
    .baseUrl("http://computer-database.gatling.io") // 5
    .acceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8") // 6
    .doNotTrackHeader("1")
    .acceptLanguageHeader("en-US,en;q=0.5")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0");

  ScenarioBuilder scn = scenario("BasicSimulation") // 7
    .exec(http("request_1") // 8
      .get("/")) // 9
    .pause(5); // 10

  {
    setUp( // 11
      scn.injectOpen(atOnceUsers(1)) // 12
    ).protocols(httpProtocol); // 13
  }
}
```

```
What does it mean?

1. The optional package.
2. The required imports.
3. The class declaration. Note that it extends Simulation.
4. The common configuration to all HTTP requests.
5. The baseUrl that will be prepended to all relative urls.
6. Common HTTP headers that will be sent with all the requests.
7. The scenario definition.
8. An HTTP request, named request_1. This name will be displayed in the final reports.
9. The url this request targets with the GET method.
10.Some pause/think time.
```

只是通过coding的方式去设置请求信息和相关的压测参数来完成压测。



## Feeders

`Inject data into your virtual users from an external source, eg a CSV file`.

通常我们需要对请求的`payload`进行一定的`参数化`和`配置化`来覆盖不同的用例。`Feeders`就是用来解决这个问题的。

它可以读取配置的数据文件（如`csv`），对`template`进行填充。

>  比如对`Json`文件填充的占位符就是`"id": "${id}"`。



## 实际示例 （Scala）

> 获取Token并放入Session 上下文中，构建`HttpConfig`。

```scala
  def auth(): ChainBuilder = {
    val OAUTH_URL = properties.getProperty("oauth")
    val Authorization = properties.getProperty("authorization")
    exec(http("Post get token : " + OAUTH_URL)
      .post(OAUTH_URL)
      .header("Content-Type", "application/json")
      .header("Authorization", s"Basic $Authorization")
      .check(jsonPath("$.auth").saveAs("Token"))
    )
      .exec { session =>
        session
    }
 
    
```

```scala
 val basicHttpConfig: HttpProtocolBuilder = http
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer ${Token}")
```



> 填充`Payload`

```scala
  def getFeeder[T <: DefaultObject](clz: T): BatchableFeederBuilder[String]#F = {
    val presetPath: String = getPresetDataPath(clz)
    logger.info(s"[LOGGER_INFO] Get preset data from : $presetPath")
    val feeder: BatchableFeederBuilder[String]#F = csv(presetPath).batch(200).random
    feeder
  }
```



> 构建`Simulation`

```scala
class DemoObjectTests extends DefaultObjectTests {
  // test instance
  val demo = new DemoObject(env)

  // create scenario
  val scn: ScenarioBuilder = scenario("Gatlin Test Demo")
    // get token (pre-script)
    .exec(token.token())
    // load preset data to fill tpl
    .feed(getFeeder(customerOrder))
    // run test
    .exec(customerOrder.run(baseUrl)
    )

  // config test strategy
  setUp(
    scn.inject(atOnceUsers(users = 20))
      .protocols(basicHttpConfig),
  )
}
```

> 运行

```scala
object SimpleGatlingRunner {

  def main(args: Array[String]): Unit = {
    // This sets the class for the simulation we want to run.
    val simClass = classOf[DemoObjectTests].getName

    val props = new GatlingPropertiesBuilder()
      .resourcesDirectory(IDEPathHelper.mavenResourcesDirectory.toString)
      .resultsDirectory(IDEPathHelper.resultsDirectory.toString)
      .binariesDirectory(IDEPathHelper.mavenBinariesDirectory.toString)
      .simulationClass(simClass)

    Gatling.fromMap(props.build)

  }
}
```



![](_media\20220403-01.png)