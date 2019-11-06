# `MyBatis-Plus`整合`PageHelper`

[`MyBatis-Plus`](https://mybatis.plus)在基本的使用上其实很像JPA（比如继承`BaseMapper<T>`后集成的常用`CRUD`），简化开发。

其实`MyBatis-Plus`自身也是带有分页插件的，但是其功能没有[`PageHelper`](https://pagehelper.github.io/)封装的更满足目前的需求，所以需要各取所长。

但是在整合的时候，会出现`Jar`包冲突的问题，因为二者都集成了`Mybatis`在其中（以我引入的版本而言）。

---

## MyBatis-Plus配置

`pom.xml`

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid-spring-boot-starter</artifactId>
    <version>1.1.10</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<!--引入mybatis-plus 其中已经包含了mybatis-->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.2.0</version>
</dependency>
```

## PageHelper配置

`application.yml`

```yaml
# 分页插件配置
pagehelper:
  # 分页插件会自动检测当前的数据库链接，自动选择合适的分页方式，也可指定分页插件使用哪种数据库方言
  helperDialect: mysql 
  # 默认值为 false，当该参数设置为 true 时，如果 pageSize=0 或者 RowBounds.limit = 0 就会查询出全部的结果（相当于没有执行分页查询，但是返回结果仍然是 Page 类型）。
  reasonable: true
  # 支持通过 Mapper 接口参数来传递分页参数。
  supportMethodsArguments: true
  params: count=countSql
```

`pom.xml`

```xml
<!--排除冲突的jar包 -->
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.2.3</version>
    <exclusions>
        <exclusion>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```



## 测试

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("mt_user")
public class User {

    private int id;
    private String username;
    @TableField(select = false)
    private String password;
    @EnumValue
    private RoleEnums role;
    private Date createTime;
    private Date updateTime;
}
```

```java
/**
 * @Description
 * @Auther Koy  https://github.com/Koooooo-7
 */
public interface UserDAO  extends BaseMapper<User> {
    
}
```

```java
    @Test
    public void testPage(){
        PageHelper.startPage(1, 2);
        List<User> users = userDAO.selectList(null);
        System.out.println(users);
        PageInfo<User> userPageInfo = new PageInfo<>(users);
        System.out.println(userPageInfo);
    }
```

