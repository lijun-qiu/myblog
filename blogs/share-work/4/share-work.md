---
title: will-change分享
date: 2023-09-28
tags:
 - vue3响应式问题 es14
categories:
 - will-change
---

## vue3子组件接收值并监听问题

```js
  //父组件传值
  <advertisementPopup :show="advertisementType" :advertisementContent="advertisementContent"></advertisementPopup>

  let advertisementType = ref(false)


  //子组件接收值
  const props = defineProps(['show','advertisementContent'])
  //监听show的变化
  watch(show,(newVal)=>{
    if(newVal){
      //执行操作
    }else{
    }
  })
```
监听不到，show被结构出来就没有了响应式，使用以下监听
```js
  //子组件接收值
  const props = defineProps(['show','advertisementContent'])
  //监听show的变化
  watch(()=>props.show,(newVal)=>{
    if(newVal){
      //执行操作
    }else{
    }
  })
```

## 函数只执行一次

```js
export function once(fn) {
  // 利用闭包判断函数是否执行过
  let called = false;
  
  return async function () {
    if (!called) {
      called = true;
      await fn.apply(this, arguments);
      called = false; 
    }
  };
}
```
支付按钮点击，防止多次点击

## es14新特性
  1.Array.prototype.toSorted  
  2.Array.prototype.toReversed  
  3.Array.prototype.with  
  4.Array.prototype.findLast  
  5.Array.prototype.findLastIndex  
  6.Array.prototype.toSpliced  
  7.正式的 shebang 支持  

**toSorted() 与 Array.prototype.sort() 具有相同的签名，但它创建一个新的数组，而不是对原数组进行操作。**
```js
let arr = [5, 4, 2, 3, 1];
arr === arr.sort(); // true - [1, 2, 3, 4, 5]

arr === arr.toSorted(); // false - [1, 2, 3, 4, 5]
```

**toSorted() 和 sort() 一样，接受一个可选参数作为比较函数。例如，我们可以使用 toSorted() 创建一个按降序排列的新数组**
```js
const numbers = [10, 5, 2, 7, 3, 9, 1, 6, 4];
const sortedNumbers = numbers.toSorted((a, b) => {
  return b - a;
});
console.log(sortedNumbers,numbers); // [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]  [10, 5, 2, 7, 3, 9, 1, 6, 4]
```

**与 toSorted() 和 sort() 一样，toReversed() 是 reverse() 的复制版本。**
```js
["a", "b", "c", "d", "e"].toReversed(); // ['e', 'd', 'c', 'b', 'a']
```

**Array.prototype.with新的 with() 方法允许您基于索引修改单个元素，并返回一个新的数组。因此，如果您知道索引和新值，这个方法非常方便。**
```js
const arr = ["I", "am", "the", "Walrus"];

// 用 "Ape Man" 替换字符串 "Walrus"。
const newArr = arr.with(3, "Ape Man");

console.log(newArr); // ["I", "am", "the", "Ape Man"]
```

**findLast() 方法允许您从数组中获取匹配元素的最后一个实例。如果找不到匹配元素，则返回 undefined。下面代码中提供了一个简单的示例，我们从数组中获取最后一个偶数。**
```js

const arr = [54, 34, 55, 75, 98, 77];

const lastEvenIndex = arr.findLast((element) => {
  return element % 2 === 0;
});

console.log(lastEvenIndex); // 98
```
findLast() 还支持传递一个 "thisArg" 来设置上下文。也就是说，第二个参数将告诉第一个参数函数 this 关键字将引用什么。从下面代码中看到这一点，我们使用一个自定义对象来找到可以被 5 整除的第一个元素。
```js
const arr = [54, 34, 55, 75, 98, 77];
const myObject = { testCase: 5 };
const lastEvenIndex = arr.findLast((element) => {
  return element % this.testCase === 0;
}, myObject);

console.log(lastEvenIndex); // 75
```

**findLastIndex() 的工作方式与 findLast() 相同，只是它返回匹配元素的索引而不是元素本身。例如，下面例子展示如何找到最后一个可以被 6 整除的元素的索引。**
```js
const arr = [54, 34, 55, 75, 98, 77];
arr.findLastIndex(x => x % 6 === 0); // 0
```

**toSpliced() 方法是 splice() 的复制版本，splice()是js中数组操作常用的方法；**
假设我们有一个颜色数组，需要在中间插入一些新的颜色（粉红色和青色）。这会创建一个新数组，而不是修改原始数组。
```js
const arr = ["red", "orange", "yellow", "green", "blue", "purple"];
const newArr = arr.toSpliced(2, 1, "pink", "cyan");
console.log(newArr);
// ["red", "orange", "pink", "cyan", "green", "blue", "purple"]
console.log(newArr[3]);
// 'cyan'
console.log(arr[3]);
// 'green'
```

**正式的 shebang 支持**
```js
#!/usr/bin/env node

console.log("Hello, world!");
```
上面例子告诉操作系统使用 node 程序来运行此脚本。只需键入 ./hello.js 即可运行它。如果没有 #!是无法运行的。