# Vue 学习小记04

## 发起请求

相对于使用`JQ`的`ajax`这一套，在Vue中使用中学习的有两个，分别是[**vue-resource**](<https://github.com/pagekit/vue-resource>)和[**axios**](<https://github.com/axios/axios>)。

在高版本的Vue中，官方更推荐使用axios:rocket:。

## vue-resource实例

在vue-resource中的介绍写的很明白。

> The HTTP client for Vue.js.

所以，它的使用在它自己的`Gayhub`:dog:上​也写得很明白，另外再来一个[参考文档](<https://www.cnblogs.com/yuzhengbo/p/6714355.html>)。

在使用前要引入它，注意顺序，因为有依赖关系，所以要在vue引入之后。

```html
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-resource@1.5.1"></script>
```



### 发起一个get请求

```js
// 基于全局Vue对象使用http
Vue.http.get('/someUrl', [options]).then(successCallback, errorCallback);
// 在一个Vue实例内使用$http
this.$http.get('/someUrl', [options]).then(successCallback, errorCallback);


// 传统写法
this.$http.get('/someUrl', [options]).then(function(response){
    // 响应成功回调
}, function(response){
    // 响应错误回调
});

// Lambda写法  箭头函数
this.$http.get('/someUrl', [options]).then((response) => {
    // 响应成功回调
}, (response) => {
    // 响应错误回调
});
```



### 发起一个post请求

发起form表单的post请求请求需要注意的在于一个配置项`emulateJSON`，表示将请求的`content-type`设置为`application/x-www-form-urlencoded` 发送。

```js
// Lambda写法  箭头函数   //data是json对象
this.$http.post('/someUrl', data,[options]).then((response) => {
    // 响应成功回调
}, (response) => {
    // 响应错误回调
});
```

-----

## axios实例

这个在官方文档上只找到一个关键字匹配的[例子]([https://cn.vuejs.org/v2/guide/migration-vue-router.html#loadingRouteData-%E7%A7%BB%E9%99%A4](https://cn.vuejs.org/v2/guide/migration-vue-router.html#loadingRouteData-移除))，但是看一下，就知道这个怎么使用了。

当然也是一样的要先引入axios。

```html
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```



### 发起一个get请求

```js
methods: {
  fetchData: function () {
    var self = this
    return axios.get('/api/posts')
      .then(function (response) {
        self.posts = response.data.posts
      })
      .catch(function (error) {
        self.fetchError = error
      })
  }
}
```

### 发起一个post请求

```js

this.axios.post('/user',data,[options])
  .then(function (response) {
     // 成功
  })
  .catch(function (error) {
    //错误
  });
```

### 其他

注意在两个调用方式中都有的`.then`，这个是使用了`Promise`。

Promise的学习，稍后再见。~



