# Mockito 入门指南

>  基于日常单元测试的使用总结。

## Mock对象设置返回值

顾名思义，就是简单mock一个对象设置返回值。

```java

    @Test
    void shouldReturnNull_whenCallGetDish_GivenEmptyFoodName(){
        var food = mock(Food.class);
        // 两者等效
//        when(food.getName()).thenReturn("");
        doReturn("").when(food).getName();
        var dish = getDish(food);
        Assertions.assertNull(dish);
    }
```



## Mock对象注入依赖对象

@InjectMock

@Mock

