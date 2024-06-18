#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

git status
git add .
git status
git commit -m 'nodejs'

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:lijun-qiu/myblog.git master



# 生成静态文件
npm run build

# 进入生成的文件夹
cd public

git init
git add .
git commit -m 'ssh提交'

# 如果发布到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:lijun-qiu/lijun.github.io.git master

cd -