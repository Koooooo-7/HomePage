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
## 自定义LDAP接入

参考[官方文档](https://docs.spring.io/spring-ldap/docs/2.3.1.RELEASE/reference/#configuration)的`xml`配置，相应转换一下就好了。

但是这里有一个坑的地方，会在创建`AbstractContextSource.getReadOnlyContext`时抛出NEP。

因为这里需要在配置完毕后调用`afterPropertiesSet()`方法，他的注释是这么描述的。

>/**
> * Checks that all necessary data is set and that there is no compatibility
> * issues, after which the instance is initialized. Note that you need to
> * call this method explicitly after setting all desired properties if using
> * the class outside of a Spring Context.
> */

示例代码，简要地配置。

```java
@Configuration
public class LdapConfigure {
    @Bean
    public LdapTemplate ldapTemplate(){
        LdapContextSource ldapContextSource = new LdapContextSource();
        ldapContextSource.setBase("DC=koooooo,DC=com");
        ldapContextSource.setUrl("ldap://192.168.23.24:389");
        ldapContextSource.setUserDn("CN=root,OU=IT,DC=koooooo,DC=com");
        ldapContextSource.setPassword("123456");
        // 只有调用过这个方法，才能使上面的配置生效
        ldapContextSource.afterPropertiesSet();
        LdapTemplate ldapTemplate = new LdapTemplate();
        ldapTemplate.setContextSource(ldapContextSource);
        return ldapTemplate;
    }
}
```


## 获取LDAP用户信息

> Spring Data includes repository support for LDAP. For complete details of Spring Data LDAP, refer to the [reference documentation](https://docs.spring.io/spring-data/ldap/docs/1.0.x/reference/html/).
>
> You can also inject an auto-configured `LdapTemplate` instance as you would with any other Spring Bean, as shown in the following example:

这里可以看到提供了Repository对LDAP的支持，其实就是从LDAP对象到Model的对象映射，想想JPA。

```java
@Entry(objectClasses = { "person"})
public class Person {

    @Id
    private Name id;
    
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

    private String account;
    private String fullName;
    private String description;
    private String mail;
    private String telephoneNumber;

    @Override
    public String toString() {
        return "Person{" +
                "account='" + account + '\'' +
                ", fullName='" + fullName + '\'' +
                ", description='" + description + '\'' +
                ", mail='" + mail + '\'' +
                ", telephoneNumber='" + telephoneNumber + '\'' +
                '}';
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public String getTelephoneNumber() {
        return telephoneNumber;
    }

    public void setTelephoneNumber(String telephoneNumber) {
        this.telephoneNumber = telephoneNumber;
    }
}
```

2. 定义查询到的数据的映射关系

通过实现AttributesMapper接口来定义映射关系。

```java
public class PersonAttributesMapper implements AttributesMapper<Person> {

    private static final Logger logger = LogUtils.getLogger();

    @Override
    public AuthPersonPO mapFromAttributes(Attributes attrs) {
        Person person = new Person();
        //  获取LDAP用户信息并且映射到对象上
        //  因为 attr的get内容是否存在不确定，直接转换成String会导致NPE
        try {
            // 用户登录账号
            Object userAccount = attrs.get("sAMAccountName").get();
            if (userAccount != null) {
                person.setAccount((String) userAccount);
            }
            // 完整姓名
            Object fullName = attrs.get("displayName").get();
            if (fullName != null) {
                person.setFullName((String) fullName);
            }
            // 描述
            Object description = attrs.get("description").get();
            if (description != null) {
                person.setDescription((String) description);
            }
            // 用户邮箱
            Object mail = attrs.get("mail").get();
            if (mail != null) {
                person.setMail((String) mail);
            }
            //用户手机号
            Object telephoneNumber = attrs.get("telephoneNumber").get();
            if (telephoneNumber != null)
                person.setTelephoneNumber((String) telephoneNumber);
        } catch (Exception e) {
            logger.info("personAttributesMapper mapping exception");
        }
        ;
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

##  用户信息量过大的问题

在测试中发现每次最大只能获取到1000个用户，[微软官方](https://support.microsoft.com/zh-cn/help/315071/how-to-view-and-set-ldap-policy-in-active-directory-by-using-ntdsutil)表示有默认的限制就是一次查询最多只能1000个。

这里显然有两个解决办法。

- 在AD域的层面修改默认的限制数量。
- 代码业务层面去解决这个问题。

显然，能在业务层解决的问题，就不要去动一些很重要的基础配置设施。

参考[Spring文档分页](https://support.microsoft.com/zh-cn/help/315071/how-to-view-and-set-ldap-policy-in-active-directory-by-using-ntdsutil)查询的设置方法。

即设置分页数量`DEFAULT_PAGE_SIZE`之后每次获取，直到获取的数目小于分页数量时（最后一页）。

> tips: 如果此时还继续获取，会重新获取到第一页的内容。

### 实现一

```java
    // 默认分页数量
    private int DEFAULT_PAGE_SIZE = 1000;
    /**
     * 根据query 筛选出全部的用户
     * @param base 根节点位置  为空使用配置文件配置的base
     * @param filter 过滤条件
     * @param mapper 映射关系
     * @param <T>
     * @return
     */
    public<T> List<T> findAll(String base,String filter,AttributesMapper<T> mapper){
            // 当前查询页的内容数量
            int current_search_size;
            // 分页信息查询递进到下一页  当获取到最后一页后继续获取会继续获取第一页
            PagedResultsDirContextProcessor processor=
            new PagedResultsDirContextProcessor(DEFAULT_PAGE_SIZE);

            // 设置搜索对象在子树范围
            final SearchControls searchControls=new SearchControls();
            searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
        
            List<T> authPersonPOList=new ArrayList<>();
            // 获取用户内容
            do{
            List<T> authPersonPOList0=ldapTemplate.search(base,
            filter,searchControls,mapper,processor);
            authPersonPOList.addAll(authPersonPOList0);

            current_search_size=authPersonPOList0.size();
            }while(current_search_size==DEFAULT_PAGE_SIZE);
            return authPersonPOList;
    };
```



### 实现二

实现二是对实现一的重构，进一步对外封装以及递归获取数据。

```java
// 默认分页数量
private int DEFAULT_PAGE_SIZE = 1000;

public <T> List<T> findAll(String base,String filter, AttributesMapper<T> mapper) {
        List<T> authPersonPOList = new ArrayList<>();
        return new findMore<T>(base, filter, mapper).searchMore(authPersonPOList, DEFAULT_PAGE_SIZE);
    };

    private class findMore<T>{
        // 分页信息查询递进到下一页
        PagedResultsDirContextProcessor processor =
                new PagedResultsDirContextProcessor(DEFAULT_PAGE_SIZE);
        // 设置搜索对象在子树范围
        final SearchControls searchControls = new SearchControls();
        private String base;
        private String filter;
        private AttributesMapper<T> mapper;

        findMore(String base,String filter, AttributesMapper<T> mapper){
          this.base = base;
          this.filter  = filter;
          this.mapper = mapper;
        }

        List<T> searchMore(List<T> list, int current_search_size){
            searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
            ldapTemplate.setIgnorePartialResultException(true);
            final SearchControls searchControls = new SearchControls();
            searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
            if (current_search_size != DEFAULT_PAGE_SIZE) return list;
            List<T> authPersonPOList0 = ldapTemplate.search(base,
                    filter, searchControls,mapper, processor);
            list.addAll(authPersonPOList0);
            return searchMore(list,authPersonPOList0.size());

        }
    }
```



### 调用示例

```java
// 获取所有用户信息
List<AuthPersonPO> authPersonPOList = ldapOperation.findAll("","(&(objectCategory=Person)(objectClass=Person)(sAMAccountName=*))", new PersonAttributesMapper());
logger.info("scheduled get data from ldap:{}", authPersonPOList);
```



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
