# JS小组件模块

最近又撸了一个页面，发现很多组件和逻辑都是以前写过的。

之前归纳的七零八落，要用的时候又重复造轮子，这样可不行:jack_o_lantern:。

记录下一些常用的，但是又比较小的逻辑块:honey_pot:。

*不定时更新~*:chart_with_upwards_trend:

-----

## Checkbox

### checkbox选定检测

```js
$.each($('input:checkbox'),function(){
    var checkedbox_status = ($(this).is(':checked'));
    console.log(checkedbox_status) //被选为true 不被选为false
    });

eg:
要求至少有一个被勾选
var checkedOne = false;
$.each($('input:checkbox'),function(){
    var checkedbox_status = ($(this).is(':checked'));
    checkedOne |= checkedbox_status;
	});
if (checkedOne){
    ...至少有一个被勾选时...
}else {
    ...一个都没被勾选时...
}
```

-----



## Modal模态框

modal模态框是bootstrap很常用的一个弹出框，也用了很多次了，比较简单好用。

事先在页面总隐藏一个模态框，通过事件出发弹出模态框。

模态框内部定制化也很高。

还有一些在模态框显示前后的事件也很好用。

### 模态框显示

```js
一般控制模态框显示
$('#myModal').modal('show');
模态框显示时，点击模态框外模态框不消失
$('#myModal').modal({backdrop:"static"});

```

-----



## 挨个字符打印小效果

```js
//挨个字符打印效果
// obj 对象 比如 #('#info')
// info  string 需要显示的信息
// 此处是写到obj.html中，这个要注意。
function perOut(obj,info){
    var index = 0;
    var str = info;
    setInterval(function() {
    if(index > str.length) {
    //清除定时器
    clearInterval();
    //若要让效果无限循环，把index归0即可
    index = 0;
    }
    var show = [
        "<span style='color: dimgrey'>",
        info.substring(0, index++)+" |",
        "</span>"
        ].join("");
        obj.html(show);
    },200)
}

eg：打印效果现实“上传出错，请重试”
perOut(#('#info'),"上传出错，请重试")
```



# 上传进度条

上传的进度条样式等，基本上在比如[JQ22]()等插件网站和一些UI框架中都很容易找到。  

一般是控制了其css的width参数。

然后部分在数值显示上会绑定data-*对象。

```js
更改data-*对象的显示数值
比如:
<div id="proNum" class="progress pos-rel" data-percent="0%">
要更改其data-percent对象数据的一种方法
$("#proNum")[0].dataset.percent = parseInt(progress) + "%";

更改css的width参数实际上就是用js给对象添加样式
比如
<div  id="proPercent" class="progress-bar" style="width:0%;"></div>
$('#proPercent')[0].style.width = parseInt(progress) + "%";
```



# 异步下载文件

其实异步下载文件一样是下面一个逻辑，即a标签的`download`属性。

请求一个接口，接口返回二进制对象。

<a href="file_path" download="file_name"></a>

```js
eg:
//进行下载
//下载按钮被点击
$("#download").on('click',function () {
    $.ajax({
        url: downloadPath,
        type: "get",
        success: function (result) {
            if (rtc_code == 500005){
               ...返回的是错误码而不是文件对象时的处理逻辑
            return false;
            }else {
            //可以正常下载文件，即创建一个a标签对象，然后点击下载
            var a = document.createElement('a');
            var filename = rep.filename;
            a.href = downloadPath;
            a.download = filename;
            a.click();
           }
       }
    });
});
```

## 需要异步对象的返回值时

在需要相互依赖的异步操作时，比如有多个请求，可后一个操作需要前一个的返回值。

以前的作法是只能callback层层嵌套，比如我在ajax里面的作法:dog:。

但是现在有个更好的处理办法，那就是

[**Promise**对象](<https://www.cnblogs.com/sweeeper/p/8442613.html>)。



# 文件上传

## Dropzone.js

有很多上传控件，这个是在用ACEadmin的时候它所使用的一个上传控件(库)。

[官网](<https://www.dropzonejs.com/>)   [中文手册](<http://wxb.github.io/dropzonejs.com.zh-CN/>)

这个库的使用还是比较方便和简单的，我使用的时候，已经是把它魔改了...。

特别要注意的是它的一些出发时间的参数位置，如果错了，拿到的对象就不是你想要的。

```js
对Dropzone的初始化配置
// 禁止对所有元素的自动查找
 Dropzone.autoDiscover = false;

var myDropzone = new Dropzone('#dropzone', {
// 上传地址
url:upload/path,
// 方式 默认就是post
method:"post",
// 不自动上传 当你需要在上传前控制一些东西的时候
autoProcessQueue: false,
maxFiles:1,// 一次性上传的文件数量上限
// 允许的文件类型 
acceptedFiles: ".pdf，.mp4,.jpg,.png",
.... 配置选项 ...
});


// 有文件拖拽/添加到上传队列触发事件 
myDropzone.on("addedfile", function(file) {
    ...
}
// 除了文件对象之外添加额外的参数 比如需要添加password参数一起post过去
myDropzone.on("sending", function(file, xhr, formData) {
    // fix: apppend -> set 避免key已存在造成多次输入加密进行追加问题
    // 这里如果用对formData对象的append操作的话，会出现追加在后面而不是每次重置参数的问题
    formData.set("password", password);
    
    // 手动发送文件 BIU ~
    myDropzone.processQueue();
});
    
// 传送完毕后的处理
myDropzone.on("complete", function(file,xhr) {
        // 比如移除文件
        myDropzone.removeFile(file);
 });
// 文件上传成功后的回调
myDropzone.on("success",function (o,rep) {
    // rep装着返回内容
}
    

```







