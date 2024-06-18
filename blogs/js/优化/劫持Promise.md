---
title: 劫持Promise
date: 2024-06-18
tags:
 - 劫持Promise
categories:
 - 劫持Promise
---

## 前端性能优化：劫持Promise
### 一、使用场景
API 请求优化: 当多个地方需要请求相同的数据时，可以使用 promiseHijack 来避免重复的API请求。例如，在单页应用（SPA）中，如果多个组件需要相同的数据，可以防止多个相同的请求同时发送。  
缓存异步操作: 例如，查询数据库或读取文件系统，如果同一查询在短时间内被多次请求，可以利用这个函数进行优化，避免重复的查询或读取操作。  
并发控制: 在高并发场景下，可以减少对外部资源的压力，如减少对数据库或外部API的重复调用。
### 二、实现原理
当第一个`promise`没有完成时（没有从`pendding`转变为`fulfilled`或`rejected`）,后续异步操作都将等待首个promise的完成并共享它的执行结果
### 三、实现
js
```js
import isEqual from 'lodash/isEqual';

function promiseHijack(promiseFn, options = { isEqual: isEqual }) {
  const pendingMap = new Map();

  return function (...args) {
    const targetArguments = Array.from(pendingMap.keys()).find(key => options.isEqual(key, args));
    const targetValue = pendingMap.get(targetArguments);

    if (targetArguments && targetValue) {
      return new Promise((resolve, reject) => {
        targetValue.push({ resolve, reject });
      });
    }

    return new Promise((resolve, reject) => {
      pendingMap.set(args, [{ resolve, reject }]);
    }).then(() => {
      promiseFn.apply(null, args).then(
        value => {
          targetValue.forEach(({ resolve }) => resolve(value));
          pendingMap.delete(args);
        },
        error => {
          targetValue.forEach(({ reject }) => reject(error));
          pendingMap.delete(args);
        }
      );
    });
  };
}

export default promiseHijack;
```
ts
```js
import { isEqual as lodashIsEqual } from 'lodash';

interface Pending {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface Options {
  isEqual: (prev: any, cur: any) => boolean;
}

export function promiseHijack(promiseFn: (...args: any[]) => Promise<any>, options: Options = { isEqual: lodashIsEqual }) {
  const pendingMap = new Map<any[], Pending[]>(); // [arguments => [{ resolve, reject }]]

  return function (...args: any[]) {
    let [targetArguments, targetValue] = Array.from(pendingMap.entries()).find(([key]) => options.isEqual(key, args)) || [];

    if (targetArguments && targetValue) {
      return new Promise((resolve, reject) => targetValue.push({ resolve, reject }));
    }

    return new Promise((resolve, reject) => {
      pendingMap.set(args, [{ resolve, reject }]);
      promiseFn.apply(null, args as any).then(
        (value) => {
          (pendingMap.get(args) as Pending[]).forEach(({ resolve }) => resolve(value));
          pendingMap.delete(args);
        },
        (error) => {
          (pendingMap.get(args) as Pending[]).forEach(({ reject }) => reject(error));
          pendingMap.delete(args);
        }
      );
    });
  };
}
```
promiseHijack 的作用专注于减少短时间内的冗余操作，不做缓存或其他操作.

短时间：时间的长短不固定，取决于首个promise的执行（发起至完成）时长

例:
```js
// 模拟耗时的promise操作
const delay = () => new Promise(resolve => setTimeout(() => resolve(), 1000))

const delayHijack = promiseHijack(delay)

console.time('hijack1')
delayHijack().then(() => console.timeEnd('hijack1')) // hijack1: 1000.6240234375 ms
console.time('hijack2')
delayHijack().then(() => console.timeEnd('hijack2')) // hijack2: 1000.8291015625 ms
```
该例子中，delay利用setTimeout使得promise在约1000ms后执行完成，结果便是所有被劫持（hijack）的完成时间都接近与“首个promise的执行时长”（1200ms）
## 四、用例
模拟耗时的promise操作
```js
const delay = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

let count = 1;
const mockApi = async (name) => {
    console.log("👻 ~ mockApi ~ running");
    await delay(1000);
    return `${name}-timestamp-${count++}`
}
```
1、被劫持的情况  
不使用promiseHijack
```js
count = 1;
mockApi().then((data) => console.log("mockApi_1:", data));
mockApi().then((data) => console.log("mockApi_2:", data));
mockApi().then((data) => console.log("mockApi_3:", data));

// 👻 ~ mockApi ~ running
// 👻 ~ mockApi ~ running
// 👻 ~ mockApi ~ running

// mockApi_1: undefined-timestamp-1
// mockApi_2: undefined-timestamp-2
// mockApi_3: undefined-timestamp-3
```
使用promiseHijack
```js
count = 1;
const hijackedMockApi = promiseHijack(mockApi);
hijackedMockApi().then((data) => console.log("hijackedMockApi_1:", data));
hijackedMockApi().then((data) => console.log("hijackedMockApi_2:", data));
hijackedMockApi().then((data) => console.log("hijackedMockApi_3:", data));

// 👻 ~ mockApi ~ running

// hijackedMockApi_1: undefined-timestamp-1
// hijackedMockApi_2: undefined-timestamp-1
// hijackedMockApi_3: undefined-timestamp-1
```
分析：  
未使用promiseHijack时，mockApi被执行了三次，三次promise请求的结果都不相同  
使用promiseHijack后，mockApi仅被执行了一次，三次promise请求共用了首个promise的结果  

2、不被劫持的情况（async await）
```js
count = 1;
const hijackedMockApi = promiseHijack(mockApi);
await hijackedMockApi().then((data) => console.log("hijackedMockApi_1:", data));
await hijackedMockApi().then((data) => console.log("hijackedMockApi_2:", data));
await hijackedMockApi().then((data) => console.log("hijackedMockApi_3:", data));

// 👻 ~ mockApi ~ running
// hijackedMockApi_1: undefined-timestamp-1
// 👻 ~ mockApi ~ running
// hijackedMockApi_2: undefined-timestamp-2
// 👻 ~ mockApi ~ running
// hijackedMockApi_3: undefined-timestamp-3
```
这里使用async await来使得各个hijackedMockApi之间变为串行同步调用,也就导致在hijackedMockApi_2执行时hijackedMockApi_1已经执行完毕，则这种情况下他们之间将不共用结果

