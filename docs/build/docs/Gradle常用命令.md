# Gradle 常用命令

## gradle <task> --console=verbose

打印展示对应task的执行信息。

examples:

- `gradle build --console=verbose`
- `gradle app:test --console=verbose`


可以在 `gradle.properties` 下新增配置，默认会使用这个config当运行命令时。

>  `org.gradle.console=verbose`




## gradle dependencies 
打印出依赖树，和类似。
examples:
- `gradle dependencies`  
- `gradle app:dependencies`

## gradle build --scan
诊断build的详细信息, 也是升级版本的`dependencies`命令, 会直接生成更直观的分析文件。



## gradle <task> --dry-run

和`kubectl ... --dry run` 类似
> `gradle app:test --dry-run`


## gradle <task> --parallel
并行执行，提高速度。
> gradle.properties
```
org.gradle.parallel=true
```



---
[Gradle Classes](https://learn.tomgregory.com/courses/take/gradle-multi-project-masterclass/lessons/33414639-intro)
[Gradle](https://docs.gradle.org/current/userguide/userguide.html)