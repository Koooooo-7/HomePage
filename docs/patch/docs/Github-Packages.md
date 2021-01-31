# Github Packages

以`Maven`项目的发布为例，说明如何将自己的项目发布到`Github Packages` 仓库供其他人使用。

示例效果见[KChain  Packages](https://github.com/Koooooo-7/KChain)。



## 创建Github Token

主要是为了获得仓库的包管理权限，创建过程见[创建个人访问令牌](https://docs.github.com/cn/github/authenticating-to-github/creating-a-personal-access-token)。

授权`Github Packages`的相关权限即可，`repo`的相关权限会被自动勾选。



## 配置`setting.xml`

这里是为了配置发布仓库信息，具体过程见[配置 Apache Maven 用于 GitHub 包](https://docs.github.com/cn/packages/guides/configuring-apache-maven-for-use-with-github-packages)。

- 添加`github`的`repository`。

- 激活`github` 的`profile`。
- 设置`github`认证信息。

> 相关信息全小写。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" 
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
  <!-- localRepository
   | The path to the local repository maven will use to store artifacts.
   |
   | Default: ${user.home}/.m2/repository
  <localRepository>/path/to/local/repo</localRepository>
  -->
  
  
  
  <pluginGroups>
    <!-- pluginGroup
     | Specifies a further group identifier to use for plugin lookup.
    <pluginGroup>com.your.plugins</pluginGroup>
    -->
  </pluginGroups>

  
  <proxies>
    
  </proxies>

  
  <mirrors>
    <!-- mirror
     | Specifies a repository mirror site to use instead of a given repository. The repository that
     | this mirror serves has an ID that matches the mirrorOf element of this mirror. IDs are used
     | for inheritance and direct lookup purposes, and must be unique across the set of mirrors.
     |-->
    <mirror>
        <id>alimaven</id>
        <mirrorOf>central</mirrorOf>
        <name>aliyun maven</name>
     <url>http://maven.aliyun.com/nexus/content/repositories/central/</url> 
      
    </mirror>
     
  </mirrors>
  
  <!-- 在这里设置默认激活的profile -->
  <activeProfiles>
    <activeProfile>github</activeProfile>
  </activeProfiles>
  
  <profiles>
    
    <profile>
    

<!-- 在这里添加github 的仓库地址 -->
      <repositories>
      <repository>
          <id>github</id>
          <name>GitHub OWNER Apache Maven Packages</name>
          <url>https://maven.pkg.github.com/OWNER/REPOSITORY</url>
        </repository>
        <repository>
          <id>nexus</id>
          <name>local private nexus</name>
          <url>http://maven.oschina.net/content/groups/public/</url>
          <releases>
      <enabled>true</enabled>
      </releases>
          <snapshots>
      <enabled>false</enabled>
      </snapshots>
        </repository>
      </repositories>
    <pluginRepositories>
    <pluginRepository>
      <id>nexus</id>
          <name>local private nexus</name>
          <url>http://maven.oschina.net/content/groups/public/</url>
          <releases>
      <enabled>true</enabled>
      </releases>
          <snapshots>
      <enabled>false</enabled>
      </snapshots>
    </pluginRepository>
    </pluginRepositories>
    </profile>
    

  </profiles>

  <servers>
  <!-- 在这里添加github的认证信息 -->
   <server>
      <id>github</id>
      <username>KOY_GITHUB_ACCOUNT</username>
      <password>KOY_GITHUB_TOKEN</password>
    </server>
  </servers>

  <!-- activeProfiles
   | List of profiles that are active for all builds.
   |
  <activeProfiles>
    <activeProfile>alwaysActiveProfile</activeProfile>
    <activeProfile>anotherAlwaysActiveProfile</activeProfile>
  </activeProfiles>
  -->
</settings>
```



## 发布包

默认情况下，GitHub 将包发布到名称与包相同的现有仓库中。

具体默认发布规则见[发布包](https://docs.github.com/cn/packages/guides/configuring-apache-maven-for-use-with-github-packages#%E5%8F%91%E5%B8%83%E5%8C%85)。

#### 配置发布仓库地址（可选）

> 相关信息全小写。

```xml
<distributionManagement>
   <repository>
     <id>github</id>
     <name>GitHub OWNER Apache Maven Packages</name>
     <url>https://maven.pkg.github.com/OWNER/REPOSITORY</url>
   </repository>
</distributionManagement>
```



**发布**

```shell
$ mvn deploy
```



## 安装包

>  这里指的是其他项目需要引入对应发布的包的操作。

#### **配置仓库地址**

可以在当前项目的`pom.xml`内配置（推荐，配置示例如下），也可以在`settings.xml`中配置仓库地址。

```xml
    <repositories>
        <repository>
            <id>github</id>
            <name>KChain</name>
            <url>https://maven.pkg.github.com/koooooo-7/kchain</url>
        </repository>
    </repositories>
```



#### **配置Github认证信息**

在`setting.xml`中加入对应（`id`一致）的认证信息，解决`Not Authorized`问题。

```xml
 <!-- 在这里添加github的认证信息 -->
   <server>
      <id>github</id>
      <username>KOY_GITHUB_ACCOUNT</username>
      <password>KOY_GITHUB_TOKEN</password>
    </server>
  </servers>
```



#### **引入依赖**

`pom.xml`

```xml
<dependency>
    <groupId>com.koy</groupId>
    <artifactId>kchain</artifactId>
    <version>1.0.0</version>
</dependency>
```



```shell
$ mvn install
```



---

扩展参考内容：[使用`Github Actions` 发布Maven 包到中央仓库](https://docs.github.com/cn/actions/guides/publishing-java-packages-with-maven#)。

