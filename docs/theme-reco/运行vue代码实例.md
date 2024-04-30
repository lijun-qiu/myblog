---
title: 运行vue代码实例
date: 2024-04-30
tags:
 - 运行vue代码实例
categories:
 - vuepress
---

## 运行vue代码Demo
::: run
```html
<template>
  <el-tabs type="border-card">
    <el-tab-pane label="用户管理">用户管理</el-tab-pane>
    <el-tab-pane label="配置管理">配置管理</el-tab-pane>
    <el-tab-pane label="角色管理">角色管理</el-tab-pane>
    <el-tab-pane label="定时任务补偿">定时任务补偿</el-tab-pane>
  </el-tabs>
</template>
` ` `
:::

## 使用
### 1.安装
```js
yarn add vuepress-plugin-run # npm install vuepress-plugin-run
```

### 2配置
```js
module.exports = {
    plugins: ['run'],
}

或
  plugins: [
    [
      'run', 
      {
        jsLabs: ['https://unpkg.com/element-ui/lib/index.js'],
        cssLabs: ['https://unpkg.com/element-ui/lib/theme-chalk/index.css'],
      }
    ]
  ],
```

## 使用
```
::: run
```html
<template>
  <el-tabs type="border-card">
    <el-tab-pane label="用户管理">用户管理</el-tab-pane>
    <el-tab-pane label="配置管理">配置管理</el-tab-pane>
    <el-tab-pane label="角色管理">角色管理</el-tab-pane>
    <el-tab-pane label="定时任务补偿">定时任务补偿</el-tab-pane>
  </el-tabs>
</template>
` ` `
:::
```

## 局部配置
```js
::: run {title: '局部配置', 'height': '200px', row: true}
```html
<template>
  <div>通过局部配置实现<b>高度自定义</b>和<b>左右布局</b></div>
</template>
<style>
b {
  color: #3eaf7c;
}
</style>
` ` `
:::
```

## 参考链接 https://github.com/dream2023/vuepress-plugin-run
