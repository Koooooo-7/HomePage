# 发布包到MavenCentral仓库

发现网上很多教程包括`sonatype` 官网的文档都已经过时了，比如gradle的`uploadArchives` 就早已经给`publishing` 取代了，所以还是记录一下最新可用的流程。

## 申请账号
要想能给`Maven Central Repository` 发布自己的包，首先要去
可以参考[`Jetbranins的文档 publish-artifacts-to-maven-central`](https://www.jetbrains.com/help/space/publish-artifacts-to-maven-central.html) 完成账号的[注册](https://issues.sonatype.org/secure/Signup!default.jspa)和提一个[Jira ticket](https://issues.sonatype.org/secure/CreateIssue.jspa?issuetype=21&pid=10134)。

> 并且需要对自己的github 账号以及 域名（如果使用的是你自己的话） 进行验证 （jira相关的repo和域名的CNAME）。

## 配置Gradle
这一步[官方的文档-Deploying to OSSRH with Gradle](https://central.sonatype.org/publish/publish-gradle/)已经不可用了。

最新的配置在这里做参考。
```properties
group = PROJECT_GROUP
version = PROJECT_VERSION

buildscript {
    repositories {
        mavenLocal()
        mavenCentral()
    }
}

subprojects {
    apply plugin: 'java-library'
    apply plugin: 'maven-publish'
    apply plugin: 'signing'


    group = PROJECT_GROUP
    version = PROJECT_VERSION

    repositories {
        mavenCentral()
    }

    sourceCompatibility = JDK_VERSION
    targetCompatibility = JDK_VERSION

    dependencies {
       ...
    }

    tasks.named('jar') {
        if (project.name.contains("core")) {
            archivesBaseName = 'kguarder'
        }
        manifest {
            attributes(
                    'Project': PROJECT_GROUP,
                    'Project-Version': project.version,
                    'Module-Name': project.name,
                    'Built-Tool': "Gradle ${gradle.gradleVersion}",
                    'Build-Jdk': "${System.properties['java.version']}",
                    'Author': 'Koy Zhuang',
                    'License': 'MIT',
            )
        }
    }

    task javadocJar(type: Jar) {
        classifier = 'javadoc'
        from javadoc
    }

    task sourcesJar(type: Jar) {
        classifier = 'sources'
        from sourceSets.main.allSource
    }

    publishing {
        publications {
            mavenJava(MavenPublication) {
                from components.java

                artifact tasks.sourcesJar
                artifact tasks.javadocJar
                pom {
                    
                    // 指定build的jar 名字， ${project.name}-${version}.jar.
                    artifactId = project.name

                    groupId = PROJECT_GROUP
                    version = PROJECT_VERSION
                    name = project.name
                    
                    description = 'decs'
                    url = 'https://github.com/koooooo-7'


                    licenses {
                        license {
                            name = 'MIT Licence'
                            url = 'https://github.com/Koooooo-7/kguarder/blob/main/LICENSE'
                        }
                    }

                    developers {
                        developer {
                            name = 'Koy Zhuang'
                            email = 'koy@ko8e24.top'
                        }
                    }

                    scm {
                        connection = 'https://github.com/Koooooo-7/kguarder.git'
                        developerConnection = 'git@github.com:Koooooo-7/kguarder.git'
                        url = 'https://github.com/koooooo-7/kguarder'
                    }
                }
            }
        }
        repositories {
            mavenLocal()
            maven {
                // 镜像仓库地址
                def releasesRepoUrl = 'https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/'
                def snapshotsRepoUrl = 'https://s01.oss.sonatype.org/content/repositories/snapshots'
                url = version.endsWith('SNAPSHOT') ? snapshotsRepoUrl : releasesRepoUrl

                // 认证，下一节会讲这个具体的内容， 可以放在本地配置中，即`~/.gralde/gradle.properties`
                credentials {
                    def uname = version.endsWith('SNAPSHOT') ? "${ossrhUsername}" : "${sonatypeUsername}"
                    def pwd = version.endsWith('SNAPSHOT') ? "${ossrhPassword}" : "${sonatypePassword}"
                    username uname
                    password pwd
                }


            }
        }
    }

    // 给所有publish的内容签名，必须
    signing {
        sign publishing.publications
    }

    test {
        useJUnitPlatform()
    }

}
```


## 生成密钥和签名
接着上面配置的内容。
在`~/.gradle/gradle.properties`中会配置下面的内容 
```
sonatypeUsername=创建的sonatype账号
sonatypePassword=你懂的
ossrhUsername=和上面是一样的，创建的sonatype账号
ossrhPassword=你懂的

// 
signing.keyId=后面8位
signing.password=你生成key时输入的email
signing.secretKeyRingFile=/Users/我的/.gnupg/secring.gpg
```

Signing部分说明
```
keyId is the public key ID that you can get with gpg -K.

password is the passphrase you used when creating the key.

secretKeyRingFile is the absolute path to the private key.
```

这一部分Signing的内容怎么来呢，是使用`gpg`工具生成的，有多种方式。比如下载那个[官网的tool](https://gpgtools.org/)。
我这里使用的是本地安装的方式，即
`brew install pgp`

1. 生成Key
`gpg --gen-key`

2. 查看Key
`gpg --list-keys`

```
/Users/我的/.gnupg/pubring.kbx
---------------------------------
pub   xxxx 2022-02-22 [GG] [expires: 2099-02-22]
      Key很长的内容XXXXXXXXXXXXXX
uid           [ultimate] Koy <koy@ko8e24.top>
```

这里我们需要的就是后8位作为`KeyId`。

3. 发布Key到`keyserver`。
   
这里有使用命令行的操作，但是目前并不再work。  
- 发布  
`$ gpg --keyserver hkp://pgp.mit.edu --send-keys 你的pubkeyXXXXXX`

- 检查, 通过我的邮箱
`$ gpg --keyserver hkp://pgp.mit.edu --search-keys koy@ko8e24.top `

我是直接去了其中一个keyserver官网[https://keys.openpgp.org/](https://keys.openpgp.org/)上传的这个东西。
上传的内容哪里来呢，即是`pubring.asc`。

默认目录`/Users/我的/.gnupg/secring.gpg`下是没有的，可以这样生成。
```
gpg --export --armor --output pubring.asc
```
然后上传上去即可。

同样的前面所需要的`secretKeyRingFile`也可以这样导出。
```
gpg --keyring secring.gpg --export-secret-keys > ~/.gnupg/secring.gpg
```

常用命令：
```
创建密钥：
$ gpg --gen-key

查看公钥
$ gpg --list-key 

查看私钥
$ gpg --list-secret-key

公钥删除
$ gpg --delete-keys Key标识名

私钥删除
$ gpg --delete-secret-keys Key标识名

公钥导出
$ gpg --export 标识名 > 导出文件名（多以asc为文件后缀）
gpg --armor --export XXXX > pub.key

私钥导出
$ gpg --export-secret-key 标识名 > 导出文件名（多以asc为文件后缀）
gpg --armor --export-secret-keys XXXX > pri.key

密钥导入
$ gpg --import 密钥文件

修改密钥
$ gpg --edit-key 标识名

```
## 发布

本地直接IDEA运行 gradle `signMavenJavaPublication` 和 `publish` 完成签名并发布到中央仓库即可。

此时repo上传到的是`staging`环境， 可以登录[中央仓库](https://s01.oss.sonatype.org/)查看，账号和Jira的一样。

检查下pom等相关内容完毕后点击`Close`， 此时会进入verify的过程。会校验你的签名和规范，如果过了，Release会变active，点击即可。
可以参考官方文档[release](https://central.sonatype.org/publish/release/#metadata-definition-and-upload)。



---
## 参考 
- [如何发布Jar包到Maven Central Repository](https://cloud.tencent.com/developer/article/1188461)

- [To publish an artifact to Maven Central](https://www.jetbrains.com/help/space/publish-artifacts-to-maven-central.html#74576082)

- [github-Generating a new GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key)

- [Gralde-signatory_credentials](https://docs.gradle.org/current/userguide/signing_plugin.html#sec:signatory_credentials)

- [The Central Repository Documentation](https://central.sonatype.org/publish/publish-guide/)