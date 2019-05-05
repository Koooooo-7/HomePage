# 记 ● V站新人首答

表示递归和迭代真的是自己的一块软肋。

#### 唯手熟尔。

------

问题链接在[这里](https://www.v2ex.com/t/558972#reply21)。

问题如下:

```
V友的描述：
$a = ['Date','Media','Geo']; 
$b = ['Num'];

$subject = ['Date'=>'2019-04-26','Media'=>'AAA','Geo'=>'CN','Num'=>105]; 
求一个函数,处理完, 返回结果为
$res['2019-04-26']['AAA']['CN']['Num'] = 105;

$a 和$b 属于可以随意配置的数组,这两个数组的值,一定在 subject 中存在 key。

我的理解：
$a，$b都是不定长的，是要以$a中元素在$subject中的值为键以及$b中的元素为键最后生成一个嵌套数组，
数组最内部那个数组的键值是$b元素最后一个元素在$subject中作为键对应的值。

看到这样的嵌套数组，不知道为什么，我就想用递归来试一下。
```

我的解决办法。

```php
<?php

    $a = [ 'Date','Media','Geo' ];
    $b = [ 'Num'];
    $subject = [ 'Date'=>'2019-04-26','Media'=>'AAA','Geo'=>'CN','Num'=>105];
    $res = myArrayA($subject,$a,$b);
    var_dump($res);
    

    /**
     * 以$a中的元素在$subject中作为键,从$subject中取出对应的值生成新的嵌套数组结构
     * @param $subject
     * @param $a
     * @param $b
     * @return array
     */
    function myArrayA($subject,$a,$b){
        $arr = [];
        //$a递归完了，开始整b了
        if (empty($a)){
            $tmp = myArrayB($subject,$b,$b);
            return $tmp;
        }
        // 拿出来$a的第一个元素
        $point = array_shift($a);
        //找到对应的键值作为key
        $key = $subject[$point];
        //移除在subject中对应的键值 ，突然感觉好像不用这么干，只针对$a继续做操作好像也是可以的阿，之后还要看看。
        //为了可以移除数组，人为构造了一个数组，键值都为1。   
        //优化： 不用这一句去构造数组移除subject，因为是以a为参考去拿subject中对应的值，a的元素是在递减的，在subject中存不存在并没有影响。
        //$subject = array_diff($subject,[$point=>1]);
        
        
        $arr[$key] =  myArrayA($subject,$a,$b);
        return $arr;

    }

    /**
     * 以$b中的元素作为键生成新的嵌套数组结构
     * @param mixed $subject 为了取出最后一个$b对应的键值
     * @param mixed $b
     * @param mixed $c  原始的数组$b，为了获取出最后一个$b对应的元素去$subject中取值
     * @return array
     */
    function myArrayB($subject,$b,$c){
        $arr = [];
        if (empty($b)){
            return $subject[array_pop($c )];
        }
        $key = array_shift($b);
        $arr[$key] = myArrayB($subject,$b,$c);
        return $arr;
    }
    ?>

```

输出结果:

```
其实楼上的代码是我直接拿了以前的一个项目Demo启动wamp了在首页写的23333，
之后从控制器取出来到那个可以在线测试代码的页面调整的格式Orz。
在框架里面的dump()是TP对var_dump()的封装，得换，this关键字也得干掉。

D:\wamp64\www\我的项目地址不能看\controller\IndexController.php:33:
array (size=1)
  '2019-04-26' => 
    array (size=1)
      'AAA' => 
        array (size=1)
          'CN' => 
            array (size=1)
              ...
```

额外收获：

1.在楼上get到了一个[在线演示代码](https://www.dooccn.com//php7/#id/46ae6d604aee73cdd0e1c3ffce4497cf)的网站，赚了阿。

2.一个大佬用索引写的代码，感觉很厉害,可是没有了，他是用github的一个Gist服务，和gitlab的Snippets挺像的。


总结：  
感觉对于递归体的思路还算比较快，但是对递归头的处理不太好，还是要多写，才会有感觉！


