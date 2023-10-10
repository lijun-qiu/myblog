---
title: vue中动态引入图片require
date: 2023-08-03
tags:
 - vue
categories:
 - vue动态引入
---

相信用过vue的小伙伴，肯定被面试官问过这样一个问题：在vue中动态的引入图片为什么要使用require？

有些小伙伴，可能会轻蔑一笑：呵，就这，因为动态添加src被当做静态资源处理了，没有进行编译，所以要加上require， 我倒着都能背出来......

## 1.什么是静态资源
```js
静态资源：一般客户端发送请求到web服务器，web服务器从内存在取到相应的文件，返回给客户端，客户端解析并渲染显示出来。

动态资源：一般客户端请求的动态资源，先将请求交于web容器，web容器连接数据库，数据库处理数据之后，
          将内容交给web服务器，web服务器返回给客户端解析渲染处理。
```
## 2.为什么动态添加的src会被当做的静态的资源？
我们知道浏览器打开一个网页，实际上运行的是html，css，js三种类型的文件。当我们本地启动一个vue项目的时候，实际上是先将vue项目进行打包，打包的过程就是将项目中的一个个vue文件转编译成html，css，js文件的过程，而后再在浏览器上运行的。

那动态添加的src如果我们没有使用require引入，最终会打包成什么样子呢，我带大家实验一波。
```js
// vue文件中动态引入一张图片
<template>
  <div class="home">
      <!-- 通过v-bind引入资源的方式就称之为动态添加 -->
    <img :src="'../assets/logo.png'" alt="logo">
  </div>
</template>

//最终编译的结果(浏览器上运行的结果)
//这张图片是无法被正确打开的
<img src="../assets/logo.png" alt="logo">  
```
<strong>我们可以看出，动态添加的src最终会编译成一个静态的字符串地址。程序运行的时候，会按照这个地址去项目目录中引入资源。而 去项目目录中引入资源的这种方式，就是将该资源当成了静态资源。</strong>

## 3.静态引入是如何编译的
在项目中我们静态的引入一张图片肯定是可以引入成功的，而引用图片所在的vue文件肯定也是被编译的，那静态引入图片最终会被编译成什么样呢，模拟一波：
```js
// vue文件中静态的引入一张图片
<template>
  <div class="home">
      <!-- 直接引入图片静态地址， 不再使用v-bind -->
    <img src="../assets/logo.png" alt="logo">
  </div>
</template>

//最终编译的结果
//这张图片是可以被正确打开的
<img src="/img/logo.6c137b82.png" alt="logo">
```
使用静态的地址去引入一张图片，图片的路径和图片的名称已经发生了改变，并且编译后过后的静态地址是可以成功的引入资源的。

还有一种情况
```js
// vue文件中静态的引入一张图片
<template>
<div class="home">
    <!-- 直接引入图片静态地址， 不再使用v-bind -->
  <img src="../assets/logo.png" alt="logo">
</div>
</template>

//最终编译的结果
//这张图片是可以被正确打开的
<img src="data:image/png;base64,xxx
```
## 4.require引入
```js
// vue文件中使用require动态的引入一张图片
<template>
  <div class="home">
      <!-- 使用require动态引入图片 -->
      <img :src="require('../assets/logo.png')" alt="logo">
  </div>
</template>

//最终编译的结果
//这张图片是可以被正确打开的
<img src="/img/logo.6c137b82.png" alt="logo">
```
<strong>因为动态添加的src，编译过后的文件地址和被编译过后的资源文件地址不一致，从而无法正确引入资源。而使用require，返回的就是资源文件被编译后的文件地址，从而可以正确的引入资源</strong>

## 5.静态的引入一张图片，没有使用require，为什么返回的依然是编译过后的文件地址？
答：在webpack编译的vue文件的时候，遇见src等属性会默认的使用require引入资源路径。引用vue-cli官方的一段原话
```js
当你在 JavaScript、CSS 或 *.vue 文件中使用相对路径 (必须以 . 开头) 引用一个静态资源时，该资源将会被包含
进入 webpack 的依赖图中。在其编译过程中，所有诸如 <img src="...">、background: url(...) 
和 CSS @import 的资源 URL 都会被解析为一个模块依赖。

例如，url(./image.png) 会被翻译为 require('./image.png')，而：

<img src="./image.png">
将会被编译到：

h('img', { attrs: { src: require('./image.png') }})
```
<strong>那么动态添加src的时候也会使用require引入，为什么src编译过后的地址，与图片资源编译过后的资源地址不一致</strong><br>
答：因为动态引入一张图片的时候，src后面的属性值，实际上是一个变量。webpack会根据v-bind指令去解析src后面的属性值。并不会通过reuqire引入资源路径。这也是为什么需要手动的添加require。



