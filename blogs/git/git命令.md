---
title: git命令
date: 2024-03-28
tags:
 - git
categories:
 - git命令
---

## 1解决当前分支出现很多修改文件方法
git fetch --all
git reset --hard origin/master

重新拉master代码

## 2回退分支
git log
git reset --hard  6e4b13c58b48e874f3c76fdbd7400a71d3cd0b5d

找到最近提交的分支回退