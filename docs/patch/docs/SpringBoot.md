# 开启Gzip压缩
当response的payload过大的时候，一个最方便的办法就是开启Gzip压缩，即
```
Response Headers

content-encoding: gzip
```

基础配置
```yaml
server:
  compression:
    enabled: true
    min-response-size: 10KB
```

默认的支持压缩的类型。
```java
private String[] mimeTypes = new String[] { "text/html", "text/xml", "text/plain", "text/css", "text/javascript",
			"application/javascript", "application/json", "application/xml" };
```

# Spring 特殊Bean增强 IntroductionAdvisor