# SpringBoot 源码解读 -- @Confitional

说到**`SpringBoot`的自动配置**，自然就不能少了`Condition`接口下的各种`@ConditionalOnXXX`条件注解。通过自定义条件注解，可以实现对配制的可插拔化，按需加载和按需切换。

## 使用示例

比如在我的这个[K-bot](https://github.com/Koooooo-7/K-Bot)中的(`SummonedCondition`)[https://github.com/Koooooo-7/K-Bot/blob/master/src/main/java/com/koy/kbot/configuration/condition/SummonedCondition.java]注解，实现了通过对配置的`Plugin`列表的解析来决定是否加载对应的`Plugin`。

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Conditional(SummonedCondition.class)
public @interface ConditionalOnSummoned {

    String name() default "";

    String havingValue() default "";

    boolean matchIfMissing() default false;

}
```



```java
public class SummonedCondition implements Condition {
    @Override
    public boolean matches(@NotNull ConditionContext conditionContext, @NotNull AnnotatedTypeMetadata annotatedTypeMetadata) {

        // 获取注解下的所有属性字段
        Map<String, Object> attributes = annotatedTypeMetadata.getAnnotationAttributes(ConditionalOnSummoned.class.getName());

        boolean matchIfMissing = (boolean) attributes.get("matchIfMissing");
        if (matchIfMissing) {
            return true;
        }

        // get the value of name property
        String propertyName = (String) attributes.get("name");
        // get the value of havingValue property
        String value = (String) attributes.get("havingValue");

        HashSet<String> plugins = new HashSet<>();
        int i = 0;
        for (; ; ) {
            // get all values from the <propertyName> list in yaml config file
            // 获取配置文件中配置的声明的列表并遍历，注意这里是需要通过构造成对数据下标的查询。
            String plugin = conditionContext.getEnvironment().getProperty(propertyName + "[" + i++ + "]", String.class);
            if (plugin == null) {
                break;
            }
            plugins.add(plugin.toUpperCase());
        }
        return plugins.contains(value.toUpperCase());
    }
}
```



## 源码探究

我们首先就拿这个条件注解`@ConditionalOnClass（org.springframework.boot.autoconfigure.condition.ConditionalOnClass）`来看看。

```java
/**
 * {@link Conditional} that only matches when the specified classes are on the classpath.
 *
 * @author Phillip Webb
 */
@Target({ ElementType.TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Conditional(OnClassCondition.class)
public @interface ConditionalOnClass {

	/**
	 * The classes that must be present. Since this annotation is parsed by loading class
	 * bytecode, it is safe to specify classes here that may ultimately not be on the
	 * classpath, only if this annotation is directly on the affected component and
	 * <b>not</b> if this annotation is used as a composed, meta-annotation. In order to
	 * use this annotation as a meta-annotation, only use the {@link #name} attribute.
	 * @return the classes that must be present
	 */
	Class<?>[] value() default {};

	/**
	 * The classes names that must be present.
	 * @return the class names that must be present.
	 */
	String[] name() default {};

}
```

可以看到`@Conditional(OnClassCondition.class)`注解十分惹人注目，与之相同，可以看到比如`@ConditionalOnBean`注解上是`@Conditional(OnBeanCondition.class)`，所以这两个注解在配置上应该是等价的。而这都引向了`Condition`接口。