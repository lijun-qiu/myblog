---
title: js数组常用方法实现（map、foreach、filter等）
date: 2023-05-18
tags:
 - js数组
categories:
 - map、foreach、filter等
---

#  js数组常用方法实现（map、foreach、filter等）

## 1.map实现
```js
Array.prototype.myMap = function map(fn, context) {
  if (typeof fn !== "function") {
    throw new Error("you should give a function");
  }
  let arr = this;
  let temp = [];
  for (let i = 0; i < arr.length; i++) {
    let result = fn.call(context, arr[i], i, arr);
    temp.push(result);
  }
  return temp;
};

let arr = ["张三", "李四", "王五"];


let obj = { a: 1 };


const arr2 = arr.myMap(function (item, index, arr) {
  // console.log(this);指向obj,不能用()=>{}函数
  return arr[index] + 1;
}, obj);
console.log(arr2);//[ '张三1', '李四1', '王五1' ]
```
## 2.forEach实现
```js
Array.prototype.myForch = function forch(fn, context) {
  if (typeof fn !== "function") {
    throw new Error("you should give a function");
  }
  let arr = this;
  for (let i = 0; i < arr.length; i++) {
    fn.call(context, arr[i], i, arr);
  }
};

let arr = [1, 2, 35, 2, 1, 35];

arr.myForch(function (temp, index, arr) {
  console.log(temp ** 2);
});
//1,4,1225,4,1,1225
```
## 3.find实现
```js
Array.prototype.myFind = function (fn, context) {
  if (typeof fn !== "function") {
    throw new Error("请传入一个函数作为参数");
  }
  let arr = this;
  for (let i = 0; i < arr.length; i++) {
    if (fn.call(context, arr[i], i, arr)) {
      return arr[i];
    }
  }
};

let arr = [12, 19, 18, 16, 20];
let obj = { a: 1 };
const arr2 = arr.myFind(function (item) {
  return item > 18;
}, obj);
console.log(arr2);//19
```
## 4.some实现.js
```js
Array.prototype.mySome = function (cb, context) {
  if (typeof cb !== "function") {
    throw new Error("请传入一个函数作为参数");
  }
  const arr = this; //获取当前操作数组
  for (let i = 0; i < arr.length; i++) {
    const flag = cb.call(context, arr[i], i, arr);
    if (flag) {
      return true;
    }
  }
  return false;
};

let arr = [1, 4, 3, 6, 7, 3, 4, 65, 0];
arr.mySome((item, index, arr) => {
  if (item >= 4) {
    arr[index] = 0; //更改第一个匹配到的值
    return true;
  }
});
console.log(arr);//[1, 0,  3, 6, 7,3, 4, 65, 0]将4改为了0
```
## 5.filter实现.js
```js
Array.prototype.myFilter = function fillter(fn, context) {
  if (typeof fn !== "function") {
    throw new Error("you should give a function");
  }
  let arr = this;
  var newArr = [];
  for (let i = 0; i < arr.length; i++) {
    fn.call(context, arr[i]) && newArr.push(arr[i]);
  }
  return newArr;
};

let arr = [1, 4, 7, 34, 22, 1, 45, 57, 3, 4, 124, 2, 44, 6, 2];

let arr2 = arr.myFilter(function (item) {
  return item > 5;
});
console.log(arr, arr2);//[7,  34, 22, 45,57, 124, 44,  6]
```
## 6.reduce实现.js
```js
Array.prototype.myReduce = function (fn, initValue) {
  if (typeof fn !== "function") {
    throw new Error("请传入一个函数作为参数");
  }
  let arr = this;
  let arr2 = [...arr];
  if (initValue) arr2 = [initValue, ...arr2];//如果initValue有值，放入数组第一个元素
  let index = -1, //标识当前值的数组元素索引
    newValue; //数组中第一个和第二个元素的和
  while (arr2.length >= 2) {
    //当前数组元素大于2时
    index++;
    newValue = fn.call(null, arr2[0], arr2[1], index, arr);
    arr2.splice(0, 2, newValue); //将数组下标为0和1的数据累加的和替换数组元素
  }
  if (newValue) {
    return newValue;
  } else {
    return initValue ? initValue : 0;
  }
};

const arr = [1, 2, 3, 4];
const arr2 = arr.myReduce((pre, cur, index, arr) => {
  // console.log(pre, cur, index, arr);
  return pre + cur;
}, 3);
console.log(arr2);//13
```
