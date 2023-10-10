---
title: js分支优化
date: 2023-05-18
tags:
 - share-work,js分支优化,fetch结果处理
categories:
 - share-work
---

<!-- vscode-markdown-toc -->
* 1. [response.json()和response.text()](#response.jsonresponse.text)
* 2. [h5跳小程序和小程序跳转](#h5)
* 3. [分支优化思想,看下面这段代码](#)
* 4. [简单分支优化](#-1)
* 5. [ 复杂分支优化](#-1)
* 6. [抽离分支](#-1)
* 7. [讨论](#-1)
* 8. [1. 路由参数解耦](#-1)
* 9. [2. watch的高级使用](#watch)
* 10. [3. watch监听多个变量](#watch-1)
* 11. [4. 程序化事件监听器](#-1)


# fetch结果处理
##  1. <a name='response.jsonresponse.text'></a>response.json()和response.text()
base64图片上次服务器返显url地址
````js
 uploadImage(imageFile) {
      const formData = new FormData();
      formData.append('file_data',imageFile.split(',').slice(1).join(','));

      fetch('//upload.shuidi.cn/uploadbase64', {
        method: 'post',
        body: formData,
      })
        .then(response => response.text())
        .then(data => {
          this.formData.autographImgUrl = data
        })
        .catch(error => {
          console.error(error);
        });
    },

````
结果处理方式response.text()和response.json()区别,一个针对字符串结果,一个针对json格式结果,要对应,否则会报错

# 跳转小程序
##  2. <a name='h5'></a>h5跳小程序和小程序跳转

```js
location.href = res.data.url_scheme; // 小程序跳转链接
```
如果当前在小程序内部跳转则会失败,应该用小程序的跳转方式
```js
 wx.miniProgram.navigateTo({ url: `/pages/scan/index?digest=${digest}&plaque_type=${plaque_type}`});
```

# js分支优化

##  3. <a name=''></a>分支优化思想,看下面这段代码
```js
function getUserDescribe(name) {
    if (name === "小刘") {
        console.log("刘哥哥");
    } else if (name === "小红") {
        console.log("小红妹妹");
    } else if (name === "陈龙") {
        console.log("大师");
    } else if (name === "李龙") {
        console.log("师傅");
    } else if (name === "大鹏") {
        console.log("恶人");
    } else {
        console.log("此人比较神秘！");
    }
}
```
咋一看没感觉有什么异常，但如果有1000个判断条件，按照这种写法难不成要写1000个 if 分支？

如果写了大量的 if 分支，并且可能还具有分支套分支，可以想象到整个代码的可读性和可维护都会大大降低，这在实际开发中，确实是一个比较头疼的问题，那有没有什么办法能够即实现需求又能避免这些问题呢？

##  4. <a name='-1'></a>简单分支优化
这就涉及到分支优化，让我们转换思维，去优化一下上面的代码结构：
```js
function getUserDescribe(name) {
    const describeForNameMap = {
        小刘: () => console.log("刘哥哥"),
        小红: () => console.log("小红妹妹"),
        陈龙: () => console.log("大师"),
        李龙: () => console.log("师傅"),
        大鹏: () => console.log("恶人"),
    };
    describeForNameMap[name] ? describeForNameMap[name]() : console.log("此人比较神秘！");
}
```
问题代码中的判断都是简单的相等判断，那么我们就可以将这些判断条件作为一个属性写到对象describeForNameMap 中去，这些属性对应的值就是条件成立后的处理函数。

之后我们就只需通过getUserDescribe函数接收到的参数去获取describeForNameMap对象中对应的值，如果该值存在就运行该值（因为值是一个函数）。

这样一来原本的 if 分支判断就转换成了简单的key value对应值，条件与处理函数一一对应，一目了然。

##  5. <a name='-1'></a> 复杂分支优化
那如果我们的 if 分支中的判断条件不只是简单的相等判断，还具有一些需要计算的表达式时，我们该怎么办呢？（如下所示）
```js
function getUserDescribe(name) {
    if (name.length > 3) {
        console.log("名字太长");
    } else if (name.length < 2) {
        console.log("名字太短");
    } else if (name[0] === "陈") {
        console.log("小陈");
    } else if (name[0] === "李" && name !== "李鹏") {
        console.log("小李");
    } else if (name === "李鹏") {
        console.log("管理员");
    } else {
        console.log("此人比较神秘！");
    }
}
```

对于这种结构的代码就不能引入对象来进行分支优化了，我们可以引入二维数组来进行分支优化：

```js
function getUserDescribe(name) {
    const describeForNameMap = [
        [
            (name) => name.length > 3, // 判断条件
            () => console.log("名字太长") // 执行函数
        ],
        [
            (name) => name.length < 2, 
            () => console.log("名字太短")
        ],
        [
            (name) => name[0] === "陈", 
            () => console.log("小陈")
        ],
        [
            (name) => name === "大鹏", 
            () => console.log("管理员")
        ],
        [
            (name) => name[0] === "李" && name !== "李鹏",
            () => console.log("小李"),
        ],
    ];
    // 获取符合条件的子数组
    const getDescribe = describeForNameMap.find((item) => item[0](name));
    // 子数组存在则运行子数组中的第二个元素（执行函数）
    getDescribe ? getDescribe[1]() : console.log("此人比较神秘！");
}
```
上面我们定义了一个describeForNameMap数组，数组内的每一个元素代表一个判断条件与其执行函数的集合（也是一个数组），之后我们通过数组的find方法查找describeForNameMap数组中符合判断条件的子数组即可。

##  6. <a name='-1'></a>抽离分支

```js
const describeForNameMap = {
    小刘: () => console.log("刘哥哥"),
    小红: () => console.log("小红妹妹"),
    陈龙: () => console.log("大师"),
    李龙: () => console.log("师傅"),
    大鹏: () => console.log("恶人"),
};

function getUserDescribe(name) {
    describeForNameMap[name] ? describeForNameMap[name]() : console.log("此人比较神秘！");
}
```

```js
const describeForNameMap = [
    [
        (name) => name.length > 3, // 判断条件
        () => console.log("名字太长") // 执行函数
    ],
    [
        (name) => name.length < 2, 
        () => console.log("名字太短")
    ],
    [
        (name) => name[0] === "陈", 
        () => console.log("小陈")
    ],
    [
        (name) => name === "大鹏", 
        () => console.log("管理员")
    ],
    [
        (name) => name[0] === "李" && name !== "李鹏",
        () => console.log("小李"),
    ],
];
    
function getUserDescribe(name) {
    // 获取符合条件的子数组
    const getDescribe = describeForNameMap.find((item) => item[0](name));
    // 子数组存在则运行子数组中的第二个元素（执行函数）
    getDescribe ? getDescribe[1]() : console.log("此人比较神秘！");
}
```

<p style="color:#0072ff;">通过模块化的开发也可以将这个map对象写进一个单独的js文件，之后在需要使用的地方导入即可。</p>

##  7. <a name='-1'></a>讨论
分支优化在各种语言中都有不同的实现方式和应用场景，本篇通过JavaScript介绍了两种代码分支优化的思想，代码的实现非常简单，重点在于这种思想的应用。

其实关于分支优化这个问题一直存在争议，目前存在两种观点：

观点1：压根不需要多此一举去优化它，并且优化后的代码因为多创建了一个对象/数组，对对象/数组进行检索反而比单纯的if else还是废性能。<br>
观点2：分支优化后的代码可读性/可维护性更好，并且引入对象/数组所带来的性能问题在当今时代根本不值一提。

# vue开发技巧

##  8. <a name='-1'></a>1. 路由参数解耦
通常在组件中使用路由参数，大多数人会做以下事情。
````js
export default {
    methods: {
        getParamsId() {
            return this.$route.params.id
        }
    }
}
````
在组件中使用 $route 会导致与其相应路由的高度耦合，通过将其限制为某些 URL 来限制组件的灵活性。

正确的做法是通过 props 来解耦。
```js
const router = new VueRouter({
    routes: [{
        path:  /user/:id ,
        component: User,
        props: true
    }]
})
```
将路由的 props 属性设置为 true 后，组件内部可以通过 props 接收 params 参数。
```js
export default {
    props: [ id ],
    methods: {
        getParamsId() {
            return this.id
        }
    }
}
```

##  9. <a name='watch'></a>2. watch的高级使用
触发监听器执行多个方法 使用数组，您可以设置多个形式，包括字符串、函数、对象。
```js
export default {
    data: {
        name:  Joe
    },
    watch: {
        name: [
            sayName1 ,
            function(newVal, oldVal) {
                this.sayName2()
            },
            {
                handler:  sayName3 ,
                immaediate: true
            }
        ]
    },
    methods: {
        sayName1() {
            console.log( sayName1==> , this.name)
        },
        sayName2() {
            console.log( sayName2==> , this.name)
        },
        sayName3() {
            console.log( sayName3==> , this.name)
        }
    }
}
```
##  10. <a name='watch-1'></a>3. watch监听多个变量
watch 本身不能监听多个变量。但是，我们可以通过返回具有计算属性的对象然后监听该对象来“监听多个变量”。
```js
export default {
    data() {
        return {
            msg1:  apple ,
            msg2:  banana
        }
    },
    compouted: {
        msgObj() {
            const { msg1, msg2 } = this
            return {
                msg1,
                msg2
            }
        }
    },
    watch: {
        msgObj: {
            handler(newVal, oldVal) {
                if (newVal.msg1 != oldVal.msg1) {
                    console.log( msg1 is change )
                }
                if (newVal.msg2 != oldVal.msg2) {
                    console.log( msg2 is change )
                }
            },
            deep: true
        }
    }
}
```
##  11. <a name='-1'></a>4. 程序化事件监听器
例如，在页面挂载时定义一个定时器，需要在页面销毁时清除定时器。这似乎不是问题。但仔细观察，this.timer 的唯一目的是能够在 beforeDestroy 中获取计时器编号，否则是无用的。
```js
export default {
    mounted() {
        this.timer = setInterval(() => {
            console.log(Date.now())
        }, 1000)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    }
}
```
如果可能，最好只访问生命周期挂钩。这不是一个严重的问题，但可以认为是混乱。

我们可以通过使用 $on 或 $once 监听页面生命周期销毁来解决这个问题：
```js
export default {
    mounted() {
        this.creatInterval( hello )
        this.creatInterval( world )
    },
    creatInterval(msg) {
        let timer = setInterval(() => {
            console.log(msg)
        }, 1000)
        this.$once( hook:beforeDestroy , function() {
            clearInterval(timer)
        })
    }
}
```
