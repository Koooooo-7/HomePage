# Vue 学习小记02

##  样式绑定

即Class绑定和Style绑定，在对样式的绑定中同样使用的`v-bind`。

### Class 样式绑定

对元素进行Class绑定有多种方式，表达式的类型支持字符串、对象或者数组。

在数组和对象中使用的时候要注意内容中\`单引号的使用，声明是一个字符串而不是一个`变量`。

- 直接给元素添加class

  ```html
  <div :class="['mt-btn','mt-btn-info']"></div>
  ```

  即添加了`mt-btn`、`mt-btn-info`样式。

- 通过对象给元素添加class

  通过对象给元素添加class时，可以**动态**地切换class。

  

  官方示例，简单通过对象来进行设置是否显示样式。

  ```html
  <div
    class="static"
    v-bind:class="{ active: isActive, 'text-danger': hasError }">
  </div>
  ```

  ```js
  data: {
    isActive: true,
    hasError: false
  }
  ```

  渲染结果

  ```html
  <div class="static active"></div>
  ```

  同时，这样写也是等效的。

  ```html
  <div
    class="static"
    v-bind:class="clsObj">
  </div>
  ```

  ```js
  data: {
    clsObj:{ active: true, 'text-danger': false }
  }
  ```

  

  **Tips**

  `三元表达式`可以直接写也可以在`data`中写，但是更方便的是可以通过对象来进行设置。

  ```html
  <div v-bind:class="[{ active: isActive },'mt-btn']"></div>
  ```

  只有在isActive为truely(即[真值](<https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy>))时才会显示active。



-----

### Style 内联样式绑定

Style的样式绑定和class的绑定十分相似。

- 直接通过对象设置样式

  在样式名有`-`存在时，一定要用引号将命名括起来，比如`font-weight`。

  ```html
  <div :style="{ color:'red', 'font-weight': 200}"></div>
  ```

- 通过变量设置样式，即在`data中寻找对应的设置`

  ```html
  <div :style="styleObj"></div>
  ```

  ```js
  data:{
    styleObj:{ color:'red', 'font-weight': 200}
  }
  ```

  同时，可以在data中设置多个对象，通过数组形式装配多个到元素上。

-----



##  v-for 列表渲染

学习过JPS、PHP之后，再来看vue的列表渲染，或者之后的*自定义全局过滤器*，都会觉得比较好理解。

在`v-for`中，可以遍历出

- 普通数组
- 对象数组
- 对象

以及嵌套数组。

进行列表渲染的时候，语法十分接近JS的迭代器语法，方法多样，记一个最好记的就好啦:smiley_cat:。

### 基本渲染

```html
<ul id="example-1">
  <li v-for="item in items">
    {{ item.message }}
  </li>
</ul>
```

```js
var example1 = new Vue({
  el: '#example-1',
  data: {
    items: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  }
})
```



### 对象渲染

**记住这里渲染值的顺序，很重要。**

```html
<div v-for="(value, key, index) in object">
  {{ index }}: {{ key }}: {{ value }}
</div>
```

```JS
 data: {
    object: {
      title: 'Hello',
      author: 'Koooooo',
      age: 24
    }
  }
```

### 嵌套渲染

嵌套渲染和其他模版的嵌套渲染没有什么大的区别。

```html
<div v-for="data in datas">
  <div v-for="d in data">{{d}}</div>
</div>
```

**但是！**嵌套渲染这里有一个坑，当你把上面的`div`全部换成`<p>`标签后，就会出错。



### 维护状态  key

[当 Vue 正在更新使用 v-for 渲染的元素列表时，它默认使用“就地更新”的策略。如果数据项的顺序被改变，Vue 将不会移动 DOM 元素来匹配数据项的顺序，而是就地更新每个元素，并且确保它们在每个索引位置正确渲染。]: https://cn.vuejs.org/v2/guide/list.html#%E7%BB%B4%E6%8A%A4%E7%8A%B6%E6%80%81	"维护状态"

为了将比如checkbox勾选后，在添加新的checkbox时，避免索引位置错乱，需要进行key进行指定（绑定）。

```html
<p v-for = "item in list" :key="item.id">
    <input type="checkbox">{{item.name}}
</p>
```

> 不要使用对象或数组之类的非基本类型值作为 `v-for` 的 `key`。请用字符串或数值类型的值。



-----

## v-if 条件渲染

顾名思义，即在符合条件的情况下对内容进行渲染。

```html
<h1 v-if="show">show!</h1>
```

```js
data:{
   show:true
}
```

即当`show`的值为truly时，进行显示。

> 使用v-if的时候，对元素的操作是渲染或者是移除。



## v-show 条件渲染

v-show也是基于条件进行渲染。

```html
<h1 v-show="show">show!</h1>
```

```html
data:{
   show:true
}
```

> v-show 只是简单地切换元素的 CSS 属性 display:none 样式。



**对比总结**

- 如果元素可能永远不会被显示的时候使用`v-if`。
- 如果元素涉及到频繁切换的时候应该使用`v-show`。





