---
title: js发布与订阅
date: 2023-04-10
tags:
 - js发布与订阅
categories:
 - js
---
# JavaScript实现的发布/订阅(Pub/Sub)模式

## 最近在学习react过程中使用到了pubsub-js插件来实现组件间通信，基本使用方法如下
```js
//发布
import Pubsub from 'pubsub-js'
//...
Pubsub.publish(eventType, data)
```
```js
//订阅
import Pubsub from 'pubsub-js'
//...//生命周期中调用
componentDidMount() {
    const pubsub = Pubsub.subscribe(eventType, (msg, data) => {
        console.log(msg) // 这里将会输出对应设置的 eventType
        console.log(data) // 这里将会输出对应设置的参数
    })
}
componentWillUnmount() { 　　
  /** * 取消指定的订阅 */ Pubsub.unsubscribe(pubsub) 　　
  /** * 取消全部订阅 */  //PubSub.clearAllSubscriptions() 
}
```

## 对应上述的发布与订阅模式，自己进行了一个简单的实现
```js
class PubSubJs {
  constructor() {
    this.handles = {};//储存事件对象
  }
  //订阅事件
  on(eventType, handle) {
    //将订阅事件保存在handles中
    this.handles[eventType]
      ? this.handles[eventType].push(handle)
      : (this.handles[eventType] = []).push(handle);
  }
  //触发事件
  emit(eventType) {
    const [, ...args] = arguments; //获取第一个参数之后的参数
    //匹配对应事件
    this.handles[eventType] &&
      this.handles[eventType].forEach((e) => {
        //循环遍历找到的已经注册的事件,绑定this，如果为null则绑定windows
        e.apply(null, args);
      });
  }
  //删除订阅事件
  off(eventType, handle) {
    if (this.handles[eventType]) {
      this.handles[eventType] = this.handles[eventType].filter((e) => {
        return e != handle;
      });
    } else {
      //当前eventType没有订阅事件
    }
  }
}

const first = function (data) {
  console.log("我是first,接收到的数据为" + data.a);
};
const second = function (data) {
  console.log("我是second,接收到的数据为" + data.b);
};
//创建实例
const mypubsub = new PubSubJs();
//订阅事件
mypubsub.on("A", first);
mypubsub.on("A", second);
//触发事件
mypubsub.emit("A", { a: 1, b: 2 }); //我是first,接收到的数据为1   我是second,接收到的数据为2
//删除事件
mypubsub.off("A", first);
console.log(mypubsub.handles); //{ A: [ [Function: second] ] }
```
### 当然还有异步发布和订阅，此处只实现了同步，如有问题，欢迎指出。

