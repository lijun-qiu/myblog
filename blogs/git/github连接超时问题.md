---
title: github连接超时问题
date: 2024-01-30
tags:
 - git
categories:
 - github连接超时
---

## 最近发现github突然拉取不了代码了
ping github.com也显示超时

## 解决方案修改host文件：
打开 C:\Windows\System32\drivers\etc\hosts，文件末尾添加如下内容：
```js
#github IP地址
199.232.69.194 github.global.ssl.fastly.net
140.82.113.3 github.com
140.82.112.4 www.github.com
185.199.108.153 assets-cdn.github.com
185.199.109.153 assets-cdn.github.com
185.199.110.153 assets-cdn.github.com
185.199.111.153 assets-cdn.github.com
185.199.108.153 documentcloud.github.com
185.199.109.153 documentcloud.github.com
185.199.110.153 documentcloud.github.com
185.199.111.153 documentcloud.github.com
140.82.114.3 gist.github.com
185.199.108.153 help.github.com
185.199.109.153 help.github.com
185.199.110.153 help.github.com
185.199.111.153 help.github.com
140.82.112.9 nodeload.github.com
199.232.68.133 raw.github.com
140.82.112.18 status.github.com
140.82.113.18 training.github.com
199.232.68.133 raw.githubusercontent.com
199.232.68.133 user-images.githubusercontent.com
199.232.68.133 avatars1.githubusercontent.com
199.232.68.133 avatars2.githubusercontent.com
199.232.68.133 avatars3.githubusercontent.com
199.232.68.133 cloud.githubusercontent.com
140.82.113.6 api.github.com
```
之后在命令窗口使用ipconfig刷新一下，我的就解决了