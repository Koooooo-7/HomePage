# 自定义Springboot的Starter

其实感觉自定义`Springboot`的`starter`和自己在应用中配置自己要注入的`@bean`的配置类很相似，毕竟定义成`starter`的目的就是为了代码服用和更好的封装（工具）。

但是在定义成`starter`的时候肯定也是有一套定义的规范。

- 自定义starter推荐以`xxx-spring-boot-starter`命名。
- 实际应用的并非starter，也是其中配置的`XXXautoconfigure`，可参考官方`starter`。
- 需要在`META-INF/spring.factories`中声明要自动配置的类路径。
- 所有的自定义`starter`都要引入`spring-boot-starter`。

## 创建自定义starter

### 创建项目结构

- 首先创建一个空项目
- 然后在空项目中创建一个`maven`的`module`。
- 再创建一个`Spring Initializr`的`module`。

这时候你的目录应该是这样。

![20190814-01](_media\20190814-01.png)

## 配置pom.xml

##### 在`koy-spring-boot-starter`的`pom.xml`中

添加对`autoconfigure`的依赖引入配置，其实真正起作用的也是它。

```java
 <dependencies>
        <dependency>
            <groupId>com.mt.show</groupId>
            <artifactId>koy-spring-boot-autoconfigure</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>
    </dependencies>
```

在`koy-spring-boot-autoconfigure`的`pom.xml`中

- 所有的自定义`starter`都要引入`spring-boot-starter`就是说的这里。
- `spring-boot-configuration-processor`不陌生，因为之后会有配置`@ConfigurationProperties`。

```java
<dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
```

## 编写配置Demo

我写了一个简单的食物:fish:介绍的一个配置服务（好蠢23333）。

这些内容都写在`koy-spring-boot-autoconfigure`，再次强调，真正起作用配置的是它。

`KoyService`，封装业务的类（Bean）。

```java
package com.mt.show;

public class KoyService {
    
    FoodProperties foodProperties;

    // 定义介绍某种食物
    public String introduce(String foodName) {
        // 字符串拼接内容仅做演示
        return foodProperties.getType() + "的名字叫:" + foodName + "===价格是" + foodProperties.getPrice();
    }

    public FoodProperties getFoodProperties() {
        return foodProperties;
    }

    public void setFoodProperties(FoodProperties foodProperties) {
        this.foodProperties = foodProperties;
    }
}

```

`FoodProperties`，用于配置属性。

```java
package com.mt.show;

import org.springframework.boot.context.properties.ConfigurationProperties;
// 获取如application.yml中配置的以koy.food开头的配置项内容
@ConfigurationProperties(prefix = "koy.food")
public class FoodProperties {

    private String type;
    private int price;

    @Override
    public String toString() {
        return "FoodProperties{" +
                "type='" + type + '\'' +
                ", price=" + price +
                '}';
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }
}

```

`FoodConfiguration`，让配置类生效，让业务类（`KoyService`）这个`Bean`丢到`Springboot`容器中。

```java
package com.mt.show;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

// 使得属性配置类生效
@EnableConfigurationProperties(FoodProperties.class)
// @Conditional注解，在某个条件下才进行配置，比如这里配置的是在Web项目下才生效
@ConditionalOnWebApplication
public class FoodConfiguration {

    @Autowired
    FoodProperties foodProperties;

    @Bean
    public KoyService koyService() {
        KoyService koyService = new KoyService();
        koyService.setFoodProperties(foodProperties);
        return koyService;
    }
}

```

这时候简单的目录结构是这样。

![](_media\20190814-02.png)

其实到这里看到的整个流程和在开发的时候自己配置加载一个`@bean`的区别并不大。:doge:

最关键的在于如何让`Springboot`知道他要加载你的这个配置的东西。

这时候，就需要配置这个`spring.factories`了，其实可以看看如`spring-boot-autoconfigure`下的这个文件。

![](_media\20190814-03.png)

它配置得十分详细了，其实用过`SSM`那一套应该会更熟悉这里面的这些东西。

![](_media\20190814-04.png)

这个文件配置在`resources`目录下的`META-INF`（自建）目录下。

目录结构应该是`resources/META-INF/spring.factories`。

`spring.factories`，放入`FoodConfiguration`的引用路径。

```xml
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.mt.show.FoodConfiguration

```

这时候，一个简单的Demo就搭建完毕了。

## 验证

我们直接把它`install`到我们的本地仓库，注意顺序。（`maven`的`install`就不赘述了）。

- [x] `koy-spring-boot-autoconfigure`
- [x] `koy-spring-boot-starter`

这时候我们新建一个`Springboot`的`web`项目（因为我在配置加了`@ConditionalOnWebApplication`）

- 导包

```java
        <dependency>
            <groupId>com.mt.show</groupId>
            <artifactId>koy-spring-boot-starter</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
```



- 在`application.yml`配置

```yml
koy:
  food:
    type: 甜点
    price: 24
```

- 测试

```java
package com.koy.test.demo;

import com.mt.show.KoyService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class DemoApplicationTests {

    @Autowired
    KoyService koyService;

    @Test
    public void testKoyService(){
        String cake = koyService.introduce("蛋糕");
        System.out.println(cake);
    }
}

```

- 查看输出

![](_media\20190814-05.png)

---

是的，你没看错，一个简单的自定义starter就配置完毕了。:rocket:

