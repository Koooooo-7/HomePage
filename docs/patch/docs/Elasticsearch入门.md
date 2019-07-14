# Elasticsearch入门

> Elasticsearch is a distributed, JSON-based search and analytics engine designed for horizontal scalability, maximum reliability, and easy management.

---

## 版本小坑

**在6.0以后的版本中删除类类型映射（也就是之前与数据库与表的类比并不适用了:dog:）。**[地址](https://www.elastic.co/guide/en/elasticsearch/reference/6.0/removal-of-types.html)

在ES中（在`Lucene`中）同一个index下的type中的相同字段其实是存储在一个字段中的，而不是和数据库一样同一个数据库中的表是彼此独立的，两者之间的同名字段也是独立的。

主要的是看这里，推荐的解决办法。

>The first alternative is to have an index per document type. Instead of storing tweets and users in a single `twitter` index, you could store tweets in the `tweets` index and users in the `user` index. Indices are completely independent of each other and so there will be no conflict of field types between indices.
>
>This approach has two benefits:
>
>- Data is more likely to be dense and so benefit from compression techniques used in Lucene.
>- The term statistics used for scoring in full text search are more likely to be accurate because all documents in the same index represent a single entity.
>
>Each index can be sized appropriately for the number of documents it will contain: you can use a smaller number of primary shards for `users` and a larger number of primary shards for `tweets`.

也就是说，最好在设计的时候一个index下面只对应一个type，或者说弱化掉type直接就是在一个Index有一个document，然后给他新增数据，然后field就是对应的列。

这个在官方示例可以看出来。

```json
# 创建了一个名为customer的索引
PUT /customer?pretty
# 直接给名为_doc的document新增了一条数据，_doc不存在时会自动创建
PUT /customer/_doc/1?pretty
{
  "name": "John Doe"
}

```



创建了一个索引

要不就需要每一个都指明所属的type...。

- 学习资源
  - [官方网站](https://www.elastic.co/guide/en/elasticsearch/reference/7.2/index.html)
  - [小破站视频](https://www.bilibili.com/video/av53178002?from=search&seid=12865348555535296620)

## 基本使用

以下基本使用都在`Kibana`的`DevTools`上进行，用PostMan也是可以的，就是麻烦一点，毕竟输入没有提示。

### 创建索引

```json
# 创建一个索引
# pretty参数是为了告诉serve最好以json的漂亮格式返回，其实带不带目前感觉区别不大
PUT /nba?pretty
```

### 新增一条记录

```json
# 直接给名为player的document新增一条记录，指定id为1，ES也可以不指定ID他自己生成
PUT /nba/player/1?pretty
{
  "name":"科比",
  "number":24,
  "nike_name":"黑曼巴"
}

# 再来一条
PUT /nba/player/2?pretty
{
  "name":"詹姆斯",
  "number":23,
  "nike_name":"小皇帝"
}
```

`tips:` 以上的操作是可以集合成一步的，ES在检测到没有该索引或者document的时候，会自动创建。

`PUT /nba/player/1?pretty`



当在指定PUT方式到指定id的时候，会产生覆盖或者说是更新的效果，实际上ES是干掉了原来的，新生成了一个，然后对应的`version`会`+1`，这和ZK的generation很像，和乐观锁的一种实现也是挺像的:fireworks:。



### 删除一条记录

那就删掉我们的小皇帝试一下。

```json
# 删除ID为2的这条数据
DELETE /nba/player/2
```

### 查询

#### 查询索引下的全部信息

- [x] 我们先把小皇帝加回来，具体操作看你的。

因为我们是在一个`index(nba)`下只有一个`document(player)`，所以下面两种查询方式都可以。

```json
# 查询全部
GET /nba/_search
GET /nba/player/_search
```

如果觉得那要是在一个Index下有多个type的话，就要用第二种指定type就好了，建议自己试一试是不是这样:dog:。

#### 条件查询

- 简单条件查询

  ```json
  # 查询名为 科比 的信息
  # 在这里注意是POST方法
  # 如果你使用GET方法会发现也是可以的，但是打开控制台看看请求信息就知道Kibana帮你转成了POST请求
  POST /nba/player/_search
  {
    "query": {
      "match": {
        "name": "科比"
      }
    }
  }
  ```

- 复杂一点的bool查询

  - should   就是or的意思，在should下只有一个条件的时候，和must的效果是一样的，毕竟没得选
  - must 就是 must的意思，好像没说一样，换个说法就是一定要满足的意思
  - must_not 就是 must_not 的意思，就是no的意思

**should**

```json
# 查询叫 科比 或者 球衣号为23 的信息
POST /nba/player/_search
{
  "query": {
    "bool": {
      "should": [
        {"match": {
          "name": "科比"
        }},
        {"match": {
          "number": 23
        }}
      ]
    }
  }
}
```

**must**

首先我们直接把上面的`should`查询直接搬过来改改。

```json
# 查询叫 科比 而且 球衣号为23 的信息
POST /nba/player/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {
          "name": "科比"
        }},
        {"match": {
          "number": 23
        }}
      ]
    }
  }
}
```

很明显，结果为`[]`，免为其难贴一个响应结果吧:smile_cat:。

```json
{
  "took": 4,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 0,
    "max_score": null,
    "hits": []
  }
}
```

那我们改一下。

```json
# 查询叫 科比 的信息
POST /nba/player/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {
          "name": "科比"
        }}
      ]
    }
  }
}
```

`tips:`

其实在这里，对name有一个分词和模糊匹配的过程，具体匹配程度在返回的`"_score":分数`参数中体现了，比如你把条件改为`"name": "科"`，一样可以查询出来，但是注意`"_score":分数`的变化。

**must_not**

略。:jack_o_lantern:



再接着复杂一丢丢，加一个过滤器。

我先添加一个假装是我自己的新数据，和我们的小皇帝类似的数据。

```json
PUT /nba/player/3?pretty
{
  "name":"Koy",
  "number":24,
  "nike_name":"小木头"
}
```

然后，我这时候加入`filter`，我什么都不输入，看看Kibana的提示给我带出来了什么。

```json
# 注意添加的地方 filter是包含在bool中的，但是与must是相互独立的
POST /nba/player/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {
          "nike_name": "小"
        }}
      ],
      "filter": {
        "range": {
          "FIELD": {
            "gte": 10,
            "lte": 20
          }
        }
      }
    }
  }
}
```

相信很快你就明白了它是什么意思，并且还给了你默认值。

- `gte`   大于等于
- `lte`   小于等于
- `gt`    大于
- `lt`   小于

```json
# 查询昵称里面有  小  的用户 并且通过球衣号要大于等于24过滤一下
POST /nba/player/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {
          "nike_name": "小"
        }}
      ],
      "filter": {
        "range": {
          "number": {
            "gte": 24
          }
        }
      }
    }
  }
}
```

显然，查到的就只有我啦。

```json
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": "nba",
        "_type": "player",
        "_id": "3",
        "_score": 0.2876821,
        "_source": {
          "name": "Koy",
          "number": 24,
          "nike_name": "小木头"
        }
      }
    ]
  }
}
```

###  其他参数

- `_source`指定查询出来的字段

- `size` 指定取出来的数据量
- `sort` 指定排序字段进行排序
- `highlight` 高亮 默认查询出来是以 `"<em>小</em>木头"`包裹
- 此外还有许多有用的参数等你发现和根据业务需求使用

这些参数是在query之外的附加参数，下面是伪请求参数示例。

```json
POST /nba/player/_search
{
  "query": {
    ...
  },
  "size": 20, 
  "sort": [
    {
      "FIELD": {
        "order": "desc"
      }
    }
  ],
  "_source":["name","nike_name"], //只取出来姓名和昵称
  "highlight": {
    "pre_tags": "<b>", // 对高亮词进行包括的标签前缀
    "post_tags": "</b>",   // 对高亮词进行包括的标签后缀
    "fields": {
      "nike_name": {}
    }
  }
}
```





## 结语

ES是一个遵循restful风格的全文搜索引擎，它的`Elastic Stack`比如ELK有更大的世界等你发现。



