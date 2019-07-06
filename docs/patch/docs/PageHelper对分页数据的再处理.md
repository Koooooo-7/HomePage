# PageHelper对分页数据的再处理

## 场景

需要对查询出来的数据(PO)做二次处理然后转化成VO(业务合并没有使用DTO)的时候，发现原来的分页信息丢失。

（显然在二次处理的时候不能有增删操作，不然原来的分页信息也就失效了）

## 原因分析

在进行SQL拦截并且查询出数据以及分页信息（count和相关计算出的分页信息）都在原先PO的PageInfo对象中，而转换后的VO是一个新的并不带原来分页信息的PageInfo对象，所以分页信息都是重新计算。

## 解决办法

[作者给的建议](https://github.com/pagehelper/Mybatis-PageHelper/issues/381)是自己再次封装一个PageInfoVO对象，将之前的PageInfo对象中的分页信息拿过来。

实际上就是更换掉数据，但是在查询之后构造PageInfo对象的时候，对查询出来的数据是已经指定了PO类型的，所以不能直接替换(默默感慨一下弱类型的好:dog:)。

**思路**

- 构造一个新的`PageInfo<VO>`对象
- 复制`PageInfo<PO>`对象中的PageInfo信息
- 通过`.setList()`方法把转换后VO的data数据放进去新构造的`PageInfo<VO>`对象中



## 代码

#### 属性复制Util

```java
    public static <S, T> T convertSource2Target(S s, T t) {
        BeanUtils.copyProperties(s, t);
        return t;
    }
```



#### 新的PageInfo对象

```java
    public BusinessResponse rmsResourceList(Integer pageNum, Integer pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<RmsResourcePO> rmsResourcePOList = rmsResourceDao.selectAll();
        RmsResourceResponse rmsResourceResponse = new RmsResourceResponse();
        // 查询出的数据PO的分页PageInfo对象
        PageInfo<RmsResourcePO> rmsResourcePOPageInfo = new PageInfo<>(rmsResourcePOList);
        // 构造新的PageInfo对象
        PageInfo<RmsResourceResponse> RmsResourceResponsePageInfo = new PageInfo<>();
        // 将分页信息复制到新的PageInfo对象中
        ConvertUtil.convertSource2Target(rmsResourcePOPageInfo, RmsResourceResponsePageInfo);
        // 将查询出来的PO数据批量转换成VO数据
        List<RmsResourceResponse> rmsResourceResponseList = rmsResourceResponse.convertPO2VO(rmsResourcePOList, RmsResourceResponse.class);
        // 将VO数据放到构造的新的PageInfo对象中
        RmsResourceResponsePageInfo.setList(rmsResourceResponseList);
        ...
```



## VO和PO批量互转

关于批量PO与VO互转这个问题，感觉在简单业务场景的时候算是在规则上的一种遵守(妥协:dog:)吧。

**思路**

- 其实就是单个互转（属性复制）的批量操作（遍历）
- 在每一个业务里都给特定的PO和VO对应写一个特定的转换方法显然不优雅
- 要能根据传过来的一个参数来确定需要转换的对象类型并能进行批量产生新实例对象

-----

**解决办法**

- 在遍历上还没有更好的想法，那就遍历吧
- 不给特定的VO和PO写类似的冗余方法，那就要抽象一层出来，泛型

- 需要达到的目的是能够根据传过来的对象批量产生新对象，然后就想到了类模板和通过反射拿到对象
- 优化：在使用泛型的时候，应该在可能的情况下加上一定的类型约束（泛型上下限）





目前我的想法是并没有抽出来成为一个全局公共的Util，

而是将其放在POJO中一个继承`BaseVO`的抽象方法

`AbstractRmsBaseVO`中去给VO们公共调用。

#### 代码实现

**PO 转 VO**

```java
    public <T> List<T> convertPO2VO(List<? extends BaseEntity> po, Class<T> voClass) {

        List<T> voList = new ArrayList<>();
        for (BaseEntity p : po) {
            try {
                T instance = voClass.newInstance();
                ConvertUtil.convertSource2Target(p, instance);
                voList.add(instance);
            } catch (InstantiationException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }

        }
        return voList;
    }
```



**VO转PO**

```java
    public <T> List<T> convertVO2PO(List<? extends BaseVO> vo, Class<T> poClass) {

        List<T> poList = new ArrayList<>();
        for (BaseVO v : vo) {
            try {
                T instance = poClass.newInstance();
                ConvertUtil.convertSource2Target(v, instance);
                poList.add(instance);
            } catch (InstantiationException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }

        }

        return poList;
    }
```



**其他** 

Java的泛型是基于`类型擦除`实现的，所以在使用泛型的时候，要尤其注意和确定各个参数类型变化。

在返回类型中`List<T>`同样也要指定返回的详细类型，不然IDEA也会告诉你使用原始类型的不安全:rocket:。