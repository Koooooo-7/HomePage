# Vue 学习小记01

<font color ="green" size="15px">vue</font>&emsp;[学习视频](https://www.bilibili.com/video/av50680998/)

## 对MVVM基本认识

在后端中有常见的MVC，而对于MVVM则是前端的概念。

MVVM拆开看是M、V、VM层。

我的理解是M层就是在页面中绑定的数据，涉及到的各种**值**，比如input 的name值，text值，title值等等。

V层就是静态的DOM，也就是直接写出来的纯HTML标签的基础页面架构。

-----

## 起步

用了docsify之后，在回过头看vue，发现好像，轻松了许多:dog:。

先看一下基础的结构。

```html
<!DOCTYPE html>
<html lang="en">
<head>
     ...
     // 引入 vue.js
     <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
     ...
</head>
<body>
// 声明 vue可以控制的DOM范围
<div id="app">
    <div class = "div" v-text="msg"><div> 可类比$('.div').text("hello world !")
    <div>{{msg}}<div>   //单向绑定显示数据  是v-text的简写模式
</div>
</body>
<script>
    // 创建一个vm 对象，也就是在这里面会负责V和M层之间的数据和交互
    var vm = new Vue({
        el:'#app', // element，能管辖的范围 显然就是id=app的div之间。
        data:{
          msg:"hello world !"      //数据对象
        },
        methods: {                 //方法、事件区
      }            
    })
</script>
</html>
```

-----



## 数据以及事件的绑定

### v-text  显示text内容

`v-text `显示`text`内容，可以类比`$(obj).text("hello!")`。

会显示出text内容，简写可以使用`{{msg}}`的形式。

-----



### v-html 显示html内容

和`v-text`的区别可以类比`$(obj).text("<h1>hello!<h1>") ` 与`$(obj).html("<h1>hello!<h1>")`。

-----



### v-bind 绑定属性内容

我直接拿过来官方示例。

```html
<div id="app">
  <span v-bind:title="message">
    鼠标悬停几秒钟查看此处动态绑定的提示信息！
  </span>
</div>
```



```js
var app = new Vue({
  el: '#app',
  data: {
    message: '页面加载于 ' + new Date().toLocaleString()
  }
})
```

可以看到使用了`v-bind` 绑定了`title`这个属性。

那么渲染时会对`title="message"`中的`message`做什么呢。一方面，会去`data`中寻对应`message`的值，另一方面，是支持js的合理语法的，也就是说上面和下面这两种写法是等效的。

```html
<div id="app">
  <span v-bind:title="message + new Date().toLocaleString()">
    鼠标悬停几秒钟查看此处动态绑定的提示信息！
  </span>
</div>
```

```js
var app = new Vue({
  el: '#app',
  data: {
    message: '页面加载于 '
  }
})
```

**简写**

`v-bind:title`可以直接简写成`:title`。

```html
<span v-bind:title="message">
```

```html
<span :title="message">
```

-----



### v-model 双向数据绑定

前面的数据都是从M绑定到V层，那么，能不能从V绑定到M层呢。

一般应用于表单元素，即可以通过用户的输入去控制M层中对应数据的改变。

比如`input(checkbox、radio、email ...)`、`select`、`textarea`等。

同样的，拿来官方的一个简单示例。

```html
<div id="app">
    <input v-model="message" placeholder="edit me">
    <p>Message is: {{ message }}</p>
</div>
```



```js
<script>
    var app= new Vue({
        el: '#app',
        data: {
            message: ''
        }
    })
</script>
```



在`v-model`标记的`message`会自动去寻找`M`里的`message`对象，进行数据的双向绑定，即`message`的值受到`M`和`V`层双向的改变。

即输入的值会改变M中`this.message`的值，而`this.message`中的值，显然会改变`{{message}}`与input框内的值，注意，这里并不需要声明`input框中的value`,也就是说**不要**写成~~~v-model:value="message"~~。

个人觉得这个在`checkedbox`等选择内容上使用，十分方便，[示例](https://cn.vuejs.org/v2/guide/forms.html)。

-----



### v-on 事件监听与处理

事件绑定，很容易理解，比如说`click`事件，`mouseover`事件等等。

在vue的语法中，绑定事件使用`v-on`，简写成`@`。

同样的，拿过来官方的示例。在`click`事件中与`v-bind`一样可以写上简单的js合理语法。

```html
<div id="example-1">
  <button v-on:click="counter += 1">Add 1</button>
  <p>The button above has been clicked {{ counter }} times.</p>
</div>
```

```js
var vm = new Vue({
  el: '#example-1',
  data: {
    counter: 0
  }
})
```

但是在复杂的事件逻辑处理上，简单的js语法肯定是无法满足的。

所以，在使用`v-on`的时候，在`vm`对象中，会有对应的`methods`与之对应。

```
<div id="example-2">
  <button v-on:click="show">点我</button>
  // <button @click="show">点我</button> 简写，等效
</div>
```

```js
<script>
    var vm = new Vue({
        el: '#example-2',
        data: {
        },
        methods:{
            show(){
                alert("点我了！")
            }
        }
    })
</script>
```

即会根据`click`事件对应触发的`show`方法去`methods`中寻找对应的触发方法进行处理。

**其他**

- 在`methods`中事件的写法有两种，即常规写法和ES6的写法，以下两者是等效的。

```js
    var vm = new Vue({
        ...
        methods:{
            show:function(){
                alert("点我了!!!！")
            },
        }
    })
```

```js
    var vm = new Vue({
        ...
        methods:{
            show(){
                alert("点我了！")
            }
        }
    })
```

- **this**指向改变后的两种解决方式

  在`vm`中对应的`data`中的k-v值都可以通过比如`this.message`的方式获取。

  但是在发生的事件函数中，`this`指向发生改变。

  可以用的解决方式

  - 函数外部定义变量 `var _this = this 。`
  - ES6箭头函数`()=>`。



-----

### 小练习

**简易计算器**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    <title>Title</title>
</head>
<body>
<div id="app">
    <input type="text" v-model="n1" >
    <select v-model="method">
        <option value="+">+</option>
        <option value="-">-</option>
        <option value="*">*</option>
        <option value="/">/</option>
    </select>
    <input type="text" v-model="n2">
    <button type="button" @click="get">=</button>
    <input type="text" :value="result">
</div>
</body>
<script>
    var vm = new Vue({
        el:'#app',
        data:{
            // 值
           n1:null,
           n2:null,
            // 符号
           method:null,
           result:null,
        },

        methods: {
            get(){
                if (this.n1 == null || this.n2 == null ) return;
                if (this.method == "/" && this.n2 == 0)return;
                let str = this.n1+this.method+this.n2;
                // console.log(str)
                this.result = eval(str)
            }

      }
    })
</script>
</html>
```







