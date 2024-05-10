---
title: 小程序转uniapp
date: 2024-05-10
tags:
 - uniapp
categories:
 - miniProgram
---

## 原生小程序转uniapp
### 使用工具miniprogram-to-uniapp
```js
$ npm install miniprogram-to-uniapp -g
```
### 使用方法
```js
Usage: wtu [options]

Options:

  -V, --version          output the version number [版本信息]
  -i, --input <target>   the input path for weixin miniprogram project [输入目录]
  -h, --help             output usage information [帮助信息]
  -c, --cli              the type of output project is vue-cli, which default value is false [是否转换为vue-cli项目，默认false]
  -m, --merge            merge wxss file into vue file, which default value is false [是否合并wxss到vue文件，默认false]
  -t, --template         transform template and include to component, which default value is false [转换template和include为单独组件，默认false]

```
### 实例
#### 默认转换
```js
$ wtu -i "./miniprogram-project"
```
#### 将 wxss 合并入 vue 文件:
```js
$ wtu -i "./miniprogram-project" -m
```
#### 转换项目为 vue-cli 项目:
```js
$ wtu -i "./miniprogram-project" -c
```
#### 将 template 里面的 import/template 和 include 标签转换为单独组件(实验性):
```
$ wtu -i "./miniprogram-project" -t
```
待命令行运行结束，会在小程序项目的同级目录有以 小程序项目名 + "_uni" 或 小程序目录名 + "_uni-cli" 目录，即是转换好的 uni-app 项目，转换好后，请使用 HBuilderX 导入并运行。引用地址 https://github.com/zhangdaren/miniprogram-to-uniapp


## uniapp开发转vscode

### 创建一个基于Vue.js的uni-app项目
```js
vue create -p dcloudio/uni-preset-vue my-project
```
选择Hello uni-app模板，之后删除src下文件，将uniapp的所有文件移到src下，除了.hbuilderx和unpackage。

### 安装依赖
```
npm install
```
最后根据package.json中的命令执行

### 常见报错
```
Syntax Error: Error: PostCSS plugin autoprefixer requires PostCSS 8.
```
```
Failed to resolve loader: less-loader
You may need to install it.
```

### 解决方法
```js
npm install postcss@8 autoprefixer

npm install less-loader less
```

在postcss.config中配置
```js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('less')
      .oneOf('vue')
      .use('less-loader')
      .loader('less-loader')
      .end();
  }
}
```