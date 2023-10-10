---
title: vue开发技巧
date: 2023-05-18
tags:
 - vue
categories:
 - vue开发技巧
---

<!-- vscode-markdown-toc -->
* 1. [路由参数解耦](#)
* 2. [watch的高级使用](#watch)
* 3. [watch监听多个变量](#watch-1)
* 4. [程序化事件监听器](#-1)
* 5. [监听组件生命周期](#-1)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

# 很有用的 Vue 开发技巧

##  1. <a name=''></a>路由参数解耦
通常在组件中使用路由参数，大多数人会做以下事情。
```js
export default {
    methods: {
        getParamsId() {
            return this.$route.params.id
        }
    }
}
```
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
您还可以通过功能模式返回道具。
```
const router = new VueRouter({
    routes: [{
        path:  /user/:id ,
        component: User,
        props: (route) => ({
            id: route.query.id
        })
    }]
})
```
##  2. <a name='watch'></a>watch的高级使用
触发监听器执行多个方法
使用数组，您可以设置多个形式，包括字符串、函数、对象。
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
##  3. <a name='watch-1'></a>watch监听多个变量
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
##  4. <a name='-1'></a>程序化事件监听器
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
##  5. <a name='-1'></a>监听组件生命周期
通常我们使用 $emit 监听组件生命周期，父组件接收事件进行通知。
子组件
```js
export default {
    mounted() {
        this.$emit( listenMounted )
    }
}
```
父组件
```js

<tmplate>
    <div>
        <List @listenMounted="listenMounted" />
    </div>
</template>
```
其实有一种简单的方法就是使用@hook 来监听组件的生命周期，而不需要在组件内部做任何改动。同样，创建、更新等也可以使用这个方法.
```js
<template>
    <List @hook:mounted="listenMounted" />
</template>
```