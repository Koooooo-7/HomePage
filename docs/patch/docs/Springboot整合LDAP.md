# Springboot整合LDAP

> 整个公司以后的权限认证都要结合AD域来做。

LDAP的相关概念就不做赘述了，先说一下查看用户信息吧。

在`Active Directory`中的`查看`勾选`高级功能`，然后查看用户`属性`中的`属性编辑器`。

-----

## 配置LDAP接入

Springboot官方文档在[整合LDAP](https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/boot-features-nosql.html#boot-features-ldap)提供了`spring-boot-starter-data-ldap`来进行操作，只需要简单配置就可以接入AD域进行操作，如下示例使用root用户进行接入。

```yaml
spring:
  ldap:
    urls: ldap://192.168.23.24:389
    username: CN=root,OU=IT,DC=koooooo,DC=com
    password: 123456
    base: DC=koooooo,DC=com
```

配置后Spring会对`LdapContextSource`自动配置，

产生一个`LdapTemplate`自动注入（和redisTemplate和kafkaTemplate是不是有点像:dog:）。

-----



## 获取LDAP用户信息

> Spring Data includes repository support for LDAP. For complete details of Spring Data LDAP, refer to the [reference documentation](https://docs.spring.io/spring-data/ldap/docs/1.0.x/reference/html/).
>
> You can also inject an auto-configured `LdapTemplate` instance as you would with any other Spring Bean, as shown in the following example:

这里可以看到提供了Repository对LDAP的支持，其实就是从LDAP对象到Model的对象映射，想想JPA。

```java
@Entry(objectClasses = { "person"})
public class Person {

    @Attribute(name = "cn")
    private String fullName;

    @Attribute(name = "sn")
    private String lastName;

    @Attribute(name = "description")
    private String description;

    @Attribute(name = "mail")
    private String mail;

    @Attribute(name = "sAMAccountName")
    private String account;

    @Attribute(name = "telephoneNumber")
    private String telephoneNumber;
    ...
        
    @Override
    public String toString() {
        return "Person{" +
                "fullName='" + fullName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", description='" + description + '\'' +
                ", mail='" + mail + '\'' +
                ", account='" + account + '\'' +
                ", telephoneNumber='" + telephoneNumber + '\'' +
              .....
    }
}

```

然后定义一个接口`Repository`来进行对LDAP的CRUD操作（很明显想到这里采用了代理），[文档](https://docs.spring.io/spring-data/ldap/docs/1.0.x/reference/html/)。

```java
public interface PersonRepository extends CrudRepository<Person, Name> {
}
```



但是，我只需要几个LDAP用户的字段，所以我只是用了一个基础的方法，参考[Spring的文档](https://docs.spring.io/spring-ldap/docs/current/reference/#search-and-lookup-using-attributesmapper)。

具体操作示例如下。

1. 定义一个实体类容器

```java
public class Person {

    private String fullName;
    private String lastName;
    private String description;
    private String mail;
    private String account;
    private String telephoneNumber;

    @Override
    public String toString() {
        return "Person{" +
                "fullName='" + fullName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", description='" + description + '\'' +
                ", mail='" + mail + '\'' +
                ", account='" + account + '\'' +
                ", telephoneNumber='" + telephoneNumber + '\'' +
                '}';
    }

    public String getTelephoneNumber() {
        return telephoneNumber;
    }

    public void setTelephoneNumber(String telephoneNumber) {
        this.telephoneNumber = telephoneNumber;
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public Person() {
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
```

2. 定义查询到的数据的映射关系

通过实现AttributesMapper接口来定义映射关系。

```java
public class PersonAttributesMapper implements AttributesMapper {
    @Override
    public Object mapFromAttributes(Attributes attrs) throws NamingException {
            Person person = new Person();
            // 获取LDAP用户信息并且映射到对象上
            // 因为 attr的get内容是否存在不确定，会导致NEP，所以需要用try catch
        try {
            person.setFullName((String) attrs.get("cn").get());
            person.setLastName((String) attrs.get("sn").get());
            // 描述
            person.setDescription((String) attrs.get("description").get());
            person.setMail((String) attrs.get("mail").get());
            // 用户登录账号
            person.setAccount((String) attrs.get("sAMAccountName").get());
             //用户手机号
            person.setTelephoneNumber((String) attrs.get("telephoneNumber").get());
        }catch (Exception e){
            log.error("user get info error {}", e)
        };
            return person;
    }
}
```



2. 进行数据获取操作

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class LdapApplicationTests {

    @Autowired
    private LdapTemplate ldapTemplate;

    @Test
    public void testLDAP(){
        /**
         * https://stackoverflow.com/questions/43041282/spring-ldap-querybuilder-partialresultexception
         * https://myshittycode.com/2017/03/26/ldaptemplate-javax-naming-partialresultexception-unprocessed-continuation-references-remaining-name/
         *
         * 注意：对于Active Directory（AD）用户：AD服务器显然无法自动处理引用，
         * 这会导致在搜索中遇到引用时引发partialResultException。要避免这种情况，
         * 请将IgnorePartialResultException属性设置为true。目前无法以referralException的形式手动处理这些引用，
         * 即，要么您得到异常（结果丢失），要么忽略所有引用（如果服务器无法正确处理）。
         * 也没有任何简单的方法可以得到通知，
         * 即已忽略partialResultException（日志中除外）。
         */
        ldapTemplate.setIgnorePartialResultException(true);
        
        List list = ldapTemplate.search(
                query().where("objectClass").is("Person"), new PersonAttributesMapper());
        // 打印出来看一下
        list.forEach(System.out::println);
    }
}
```

-----



## 验证用户

官方给出的验证用户方式很多，关键在于**需要这个用户的唯一标识和输入的密码**，然后调用LDAP的[验证服务](https://docs.spring.io/spring-ldap/docs/current/reference/#user-authentication)。

简单的，比如我们用`sAMAccountName`即用户的登录账号来标识。

> Using this method authentication becomes as simple as this:

```java
ldapTemplate.authenticate(query().where("sAMAccountName").is("03904"), "123456");
```

其实我们可以简单跟进去看一下认证的源码。调用了

` authenticate(LdapQuery query, String password, AuthenticatedLdapEntryContextMapper<T> mapper)`这个方法。

关键在于传入的最后一个参数是`new NullAuthenticatedLdapEntryContextCallback()`，这样在最后会发现返回的`mapperCallback.collectedObject`值为null，所以回过头看认证方法的返回值为`void`。

会发现在不同情况下抛出的不同异常。

```java
   /**
     * {@inheritDoc}
     */
    @Override
    public <T> T authenticate(LdapQuery query, String password, AuthenticatedLdapEntryContextMapper<T> mapper) {
        SearchControls searchControls = searchControlsForQuery(query, RETURN_OBJ_FLAG);
        ReturningAuthenticatedLdapEntryContext<T> mapperCallback =
                new ReturningAuthenticatedLdapEntryContext<T>(mapper);
        CollectingAuthenticationErrorCallback errorCallback =
                new CollectingAuthenticationErrorCallback();
        // 认证在这里
        AuthenticationStatus authenticationStatus = authenticate(query.base(),
                query.filter().encode(),
                password,
                searchControls,
                mapperCallback,
                errorCallback);

        if(errorCallback.hasError()) {
            Exception error = errorCallback.getError();

            if (error instanceof NamingException) {
                throw (NamingException) error;
            } else {
                throw new UncategorizedLdapException(error);
            }
        } else if(AuthenticationStatus.EMPTYRESULT == authenticationStatus) {
        	throw new EmptyResultDataAccessException(1);
        } else if(!authenticationStatus.isSuccess()) {
            throw new AuthenticationException();
        }
        // 此时返回值为 null
        return mapperCallback.collectedObject;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void authenticate(LdapQuery query, String password) {
        authenticate(query,
                password,
                new NullAuthenticatedLdapEntryContextCallback());
    }

```



- 如果用户不存在，会抛出`org.springframework.dao.EmptyResultDataAccessException`异常。
- 如果验证失败，会抛出`javax.naming.AuthenticationException`异常。

-----

## 总结

在实际业务中结合业务场景使用LDAP的操作可能目前并没有太复杂，结合LDAP服务器的性能和操作的话，需要在前面再多做一层相关的工作，比如用Redis做一个LDAP的同步缓存等。