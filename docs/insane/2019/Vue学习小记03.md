# Vue 学习小记03

学完了基础的数据绑定和事件之后，开始了一些自定义的内容。

这个**扩展性**的东西才算是学习的开始。



## 自定义过滤器

自定义过滤器这个东西，在模版语言中，如果使用过PHP框架或者Django等，就不会陌生。

> `Vue.js 允许你自定义过滤器，可被用于一些常见的文本格式化。过滤器可以用在两个地方：**双花括号插值和 v-bind 表达式** (后者从 2.1.0+ 开始支持)。过滤器应该被添加在 JavaScript 表达式的尾部，由“管道”符号指示：`

```HTML
<!-- 在双花括号中 -->
{{ message | capitalize }}

<!-- 在 v-bind 中 -->
<div v-bind:id="rawId | formatId"></div>
```

上面是演示如何使用，下面是如何定义它们。

在定义它们的时候，可以分为`全局过滤器`和`（本地）局部过滤器`。

### 定义全局过滤器

```js
// 定义一个让首字母大写的全局过滤器
Vue.filter('capitalize', function (value) {
  if (!value) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
})

var vm = new Vue({
         el:"#app",
         data:{
...
```

### 定义局部过滤器

```js
var vm = new Vue({
         el:"#app",
         data:{},
         // 定义一个局部过滤器
         filters: {
             capitalize: function (value) {
                 if (!value) return ''
                 value = value.toString()
                 return value.charAt(0).toUpperCase() + value.slice(1)
             }
         }
...
```

**注意点**    

- 在使用过滤器的时候，如果存在全局和局部的同名过滤器，会优先使用局部过滤器（就近原则）。

- 过滤器可以串联依次调用：`{{ message | filterA | filterB }}`。
- 过滤器是 JavaScript 函数，因此可以接收参数：`{{ message | filterA('arg1',args) }}`，普通字符串 `'arg1'` 作为第二个参数，表达式 `arg2` 的值作为第三个参数。。

-----



## 自定义指令

用过了什么`v-on`，`v-model`，当然自己也可以定义指令啦:yellow_heart:。

使用自定义指令一样也是`v-xxx`，但是在定义的时候是不需要去加上`v-`的，`Vue`会自己给你加上。

### 自定义指令

自定义指令和自定义过滤器一样，也分为`全局指令`和`局部指令`。

比如要定义一个改变`input`框中输入文本字体颜色的指令`v-color`

```html
<input type="text" name="xx" v-color="'red'">
```

### 定义全局指令

```js
Vue.directive("color",function(el,binding){
    bind:{
        el.style.color = binding.value
    }

})
```

### 定义局部指令

```js
 	var vm = new Vue({
         el:"#app",
         ...
         directives:{
         	"color":function(el,binding){
    	     bind:{
                el.style.color = binding.value
    	      }
         }
     },
         ...
})
```



### 钩子函数

一个指令定义对象会提供[钩子函数]([https://cn.vuejs.org/v2/guide/custom-directive.html#%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%E5%8F%82%E6%95%B0](https://cn.vuejs.org/v2/guide/custom-directive.html#钩子函数参数)) ，我目前用上的只有这俩：

- `bind`：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。

  一般改变元素自身某些属性的时候使用。

- `inserted`：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。

  绑定一些如`focus`等的时候使用。

### 钩子函数参数

同时，在自定义指令中可以看到，钩子函数第一个参数默认是`el`即指令所绑定元素本身。

而`binding`是一个对象，包含以下属性：

- `name`：指令名，不包括 `v-` 前缀。
- `value`：指令的绑定值，例如：`v-my-directive="1 + 1"` 中，绑定值为 `2`。
- `oldValue`：指令绑定的前一个值，仅在 `update` 和 `componentUpdated` 钩子中可用。无论值是否改变都可用。
- `expression`：字符串形式的指令表达式。例如 `v-my-directive="1 + 1"` 中，表达式为 `"1 + 1"`。
- `arg`：传给指令的参数，可选。例如 `v-my-directive:foo` 中，参数为 `"foo"`。
- `modifiers`：一个包含修饰符的对象。例如：`v-my-directive.foo.bar` 中，修饰符对象为 `{ foo: true, bar: true }`。



## 生命周期钩子

> 每个 Vue 实例在被创建时都要经过一系列的初始化过程——例如，需要设置数据监听、编译模板、将实例挂载到 DOM 并在数据变化时更新 DOM 等。同时在这个过程中也会运行一些叫做**生命周期钩子**的函数，这给了用户在不同阶段添加自己的代码的机会。

粗略看了一下，这个在docsify里面看上去就是那几个封装了的插件。



![](../_media/201906-01.png)



