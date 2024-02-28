# Annotation Processor
顾名思义，就是注解处理器。而且是在编译期间处理。
其中处理的方式是`round`, 即对需要处理的注解会一轮一轮进行Processor调用, 直到没有（包含/新生成的）匹配的注解。


> NOTE: 调用顺序无法保证，应该让Processor彼此独立。

## 自定义Processor

实现`AbstractProcessor` , 声明支持处理的注解。
然后通过SPI模式加载进去即可。

**SPI**
加入`com.example.koy.processor.MyProcessor`到如下文件
```
src/main/resources/META-INF/services/javax.annotation.processing.Processor
```

> 或者使用`@AutoService(MyProcessor.class)` from `annotationProcessor 'com.google.auto.service:auto-service:1.0-rc5'`


```java
@SupportedAnnotationTypes(
        "com.example.koy.AutoK"
)
@NoArgsConstructor
public class MyProcessor extends AbstractProcessor {
```

## SpringBoot的ConfiguationMetadataAnnotaionProcessor

> `org.springframework.boot.configurationprocessor.ConfigurationMetadataAnnotationProcessor`    

SpringBoot 对于config文件的hits就是用AnnotationProcessor生成的, 但是带来的就是某些情况下生成的meta也有局限性，比如自定义注解肯定就是不支持了。它能处理的注解已经定义好了。
```java
@SupportedAnnotationTypes({ ConfigurationMetadataAnnotationProcessor.CONFIGURATION_PROPERTIES_ANNOTATION,
		ConfigurationMetadataAnnotationProcessor.CONTROLLER_ENDPOINT_ANNOTATION,
		ConfigurationMetadataAnnotationProcessor.ENDPOINT_ANNOTATION,
		ConfigurationMetadataAnnotationProcessor.JMX_ENDPOINT_ANNOTATION,
		ConfigurationMetadataAnnotationProcessor.REST_CONTROLLER_ENDPOINT_ANNOTATION,
		ConfigurationMetadataAnnotationProcessor.SERVLET_ENDPOINT_ANNOTATION,
		ConfigurationMetadataAnnotationProcessor.WEB_ENDPOINT_ANNOTATION,
		"org.springframework.context.annotation.Configuration" })
public class ConfigurationMetadataAnnotationProcessor extends AbstractProcessor {

	static final String ADDITIONAL_METADATA_LOCATIONS_OPTION = "org.springframework.boot.configurationprocessor.additionalMetadataLocations";

	static final String CONFIGURATION_PROPERTIES_ANNOTATION = "org.springframework.boot.context.properties.ConfigurationProperties";

	static final String NESTED_CONFIGURATION_PROPERTY_ANNOTATION = "org.springframework.boot.context.properties.NestedConfigurationProperty";

	static final String DEPRECATED_CONFIGURATION_PROPERTY_ANNOTATION = "org.springframework.boot.context.properties.DeprecatedConfigurationProperty";

	static final String CONSTRUCTOR_BINDING_ANNOTATION = "org.springframework.boot.context.properties.ConstructorBinding";

	static final String DEFAULT_VALUE_ANNOTATION = "org.springframework.boot.context.properties.bind.DefaultValue";

	static final String CONTROLLER_ENDPOINT_ANNOTATION = "org.springframework.boot.actuate.endpoint.web.annotation.ControllerEndpoint";

	static final String ENDPOINT_ANNOTATION = "org.springframework.boot.actuate.endpoint.annotation.Endpoint";

	static final String JMX_ENDPOINT_ANNOTATION = "org.springframework.boot.actuate.endpoint.jmx.annotation.JmxEndpoint";

	static final String REST_CONTROLLER_ENDPOINT_ANNOTATION = "org.springframework.boot.actuate.endpoint.web.annotation.RestControllerEndpoint";

	static final String SERVLET_ENDPOINT_ANNOTATION = "org.springframework.boot.actuate.endpoint.web.annotation.ServletEndpoint";

	static final String WEB_ENDPOINT_ANNOTATION = "org.springframework.boot.actuate.endpoint.web.annotation.WebEndpoint";

	static final String READ_OPERATION_ANNOTATION = "org.springframework.boot.actuate.endpoint.annotation.ReadOperation";

	static final String NAME_ANNOTATION = "org.springframework.boot.context.properties.bind.Name";

```

## 参考
[Annotation Processing 101](https://hannesdorfmann.com/annotation-processing/annotationprocessing101/)