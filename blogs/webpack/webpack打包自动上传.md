---
title: webpack打包自动上传
date: 2024-04-29
tags:
 - webpack
categories:
 - webpack打包自动上传
---

## 实现一个功能：打包自动上传到指定目录文件
### webpack打包生成一个静态目录文件,可以通过webpack将打包的文件移到指定目录文件进行提交,自动化构建上传

编写一个webpack插件

build.after.js
```js
const pluginName = 'ConsoleLogOnBuildWebpackPlugin';
let fs = require('fs-extra');
const process = require('process');
const exeShell = require('./shell');



class ConsoleLogOnBuildWebpackPlugin {

    constructor(staticDir,staticPath,remoteConfig) {
        this.staticDir = staticDir || 'vue'; //指定文件名
        this.staticPath = staticPath || 'E:/blog/my_vue/disttest';//指定目录
        if(remoteConfig) {
            this.remoteConfig = remoteConfig;
        } else {
            this.remoteConfig = {
                "username":"xxx",
                "password":"xxx",
                "host":"xxx",
                "port":"xxx"
            };
        }
    }

    apply(compiler) {

        compiler.hooks.run.tap(pluginName, compilation => {
            console.log("webpack 构建过程开始！");
        });

        compiler.hooks.done.tap(pluginName,compilation=>{
            let distPath = compilation.compilation.outputOptions.path;
            console.log(distPath);
            console.log("webpack 构建结束,自动复制代码");

            var buildCDN = ()=>{
                console.log('开始处理cdn文件...');
                process.chdir(this.staticPath);
                return exeShell("git",['pull','--rebase','origin','master']).then(()=>{
                    console.log('更新文件成功...');
                    return fs.remove(this.staticPath + '/' + this.staticDir)
                }).then(() => {
                    return fs.copy(distPath, this.staticPath + '/' + this.staticDir);
                }).then(() => {
                    console.log('文件复制成功!');
                    console.log('提交静态文件...');
                    process.chdir(this.staticPath);
                    return exeShell('git', ['add', '.'])
                }).then(function () {
                    console.log('add success');
                    return exeShell('git', ['commit', '-m', 'vue-build dev_test']);
                }).then(function () {
                    console.log('commit success ');
                    return exeShell("git", ['pull', '--rebase', 'origin', 'master']);
                }).then(function () {
                    console.log('pull success ');
                    return exeShell("git", ['push', 'origin', 'master']);
                }).then(function () {
                    console.log('push success ');
                })
            };

            buildCDN();
        });
    }
}
module.exports = ConsoleLogOnBuildWebpackPlugin;
```
此处上传本地目录文件，要是上传cdn就通过登录cdn这一操作来实现

### 优化,本地测试
```js
const pluginName = 'ConsoleLogOnBuildWebpackPlugin';
let fs = require('fs-extra');
const process = require('process');
const exeShell = require('./shell');
const extract = require('extract-zip');
const test = true //控制是否是测试环境


class ConsoleLogOnBuildWebpackPlugin {

    constructor(staticDir,staticPath,remoteConfig) {
        this.staticDir = staticDir || 'vue'; //指定文件名
        this.staticPath = staticPath || 'E:/blog/my_vue/disttest';//指定目录
        if(remoteConfig) {
            this.remoteConfig = remoteConfig;
        } else {
            this.remoteConfig = {
                "username":"xxx",
                "password":"xxx",
                "host":"xxx",
                "port":"xxx"
            };
        }
    }

    apply(compiler) {

        compiler.hooks.run.tap(pluginName, compilation => {
            console.log("webpack 构建过程开始！");
        });

        compiler.hooks.done.tap(pluginName,compilation=>{
            let distPath = compilation.compilation.outputOptions.path;
            console.log(distPath);
            console.log("webpack 构建结束,自动复制代码");

            var buildCDN = ()=>{
                console.log('开始处理cdn文件...');
                process.chdir(this.staticPath);
                return exeShell("git",['pull','--rebase','origin','master']).then(()=>{
                    console.log('更新文件成功...');
                    return fs.remove(this.staticPath + '/' + this.staticDir)
                }).then(() => {
                    return fs.copy(distPath, this.staticPath + '/' + this.staticDir);
                }).then(() => {
                    console.log('文件复制成功!');
                    console.log('提交静态文件...');
                    process.chdir(this.staticPath);
                    return exeShell('git', ['add', '.'])
                }).then(function () {
                    console.log('add success');
                    return exeShell('git', ['commit', '-m', 'vue-build dev_test']);
                }).then(function () {
                    console.log('commit success ');
                    return exeShell("git", ['pull', '--rebase', 'origin', 'master']);
                }).then(function () {
                    console.log('pull success ');
                    return exeShell("git", ['push', 'origin', 'master']);
                }).then(function () {
                    console.log('push success ');
                })
            };

            var buildTest = function(){
                var client = require('scp2');
                var compressing = require('compressing');
                const { Client } = require('ssh2');
                const cliProgress = require('cli-progress');

                create a new progress bar instance and use shades_classic theme
                console.log("打包文件...");
                compressing.zip.compressDir(distPath,'static.zip').then( ()=> {
                    console.log("压缩成功!开始上传....");
                    var staticDir = `/home/www/web-php-test-${testNo}/vue-static`;
                    var descPadth = `${this.remoteConfig.username}:${this.remoteConfig.password}@${this.remoteConfig.host}:${this.remoteConfig.port}:`+staticDir;
    
                    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
                    bar1.start(100, 0);
                    client.on('transfer',(buffer,uploaded,total)=>{
                        bar1.update(uploaded / total * 100);
                    })
                    client.scp('static.zip',descPadth,client, (error)=> {
                        bar1.stop();
                        console.log("复制",error || '成功！');
                        const conn = new Client();
                        conn.on('ready',()=>{
                            console.log('Client :: ready');
                            conn.exec(`cd ${staticDir} && rm -rf dist && unzip static.zip && rm -rf ${this.staticDir.slice(0,-1)} && mv dist ${this.staticDir.slice(0,-1)} && rm -rf static.zip`, (err, stream) => {
                                if (err) throw err;
                                stream.on('close', (code, signal) => {
                                    console.log('success');
                                    conn.end();
                                }).on('data', (data) => {
                                    console.log('STDOUT: ' + data);
                                }).stderr.on('data', (data) => {
                                    console.log('STDERR: ' + data);
                                });
                            });
                        }).connect({
                            host: this.remoteConfig.host,
                            port: this.remoteConfig.port,
                            username: this.remoteConfig.username,
                            password:this.remoteConfig.password
                        });

                    });
                },function () {
                    console.log('error');

                doCliProgress()
                console.log("压缩成功!开始复制到本地目录....");
                const staticDir = 'E:/blog/my_vue';
                process.chdir(staticDir);
                fs.remove(staticDir + '/dist').then((res)=>{
                  if(!fs.existsSync(staticDir + '/dist')){
                    fs.mkdir(staticDir + '/dist')
                  }
                  fs.copyFile('E:/blog/my_vue/static.zip', staticDir+'/dist/static.zip', (error) => {
                    if (error) {
                      console.log("复制失败！", error);
                    } else {
                      console.log("复制成功！");
                
                      const unzipPath = `${staticDir}/dist`;
                      //解压
                      unzipFile(unzipPath);
   
                    }
                  });
                })
  
              }, () => {
                console.log('压缩失败！');
              })
              }

              if(test){
                buildTest()
              }else{
                buildCDN();
              }    
        });
    }
}

function unzipFile(unzipPath) {
  console.log('解压操作已启动');
  try {
    // 将压缩包解压到 test 文件夹中
    var compressing = require('compressing');
    compressing.zip.uncompress(unzipPath+'/static.zip','./').then(() => {
      console.log('解压完成')
      //移除压缩文件
      process.chdir(unzipPath);
      fs.remove(unzipPath+'/static.zip').then(()=>{
        console.log('移除压缩文件成功')
      })
    }).catch(() => {
      console.log('解压失败')
    })
  } catch (error) {
    console.error('解压失败！', error);
  }
}

function doCliProgress(){
  const cliProgress = require('cli-progress');

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

  const sourceFile = 'E:/blog/my_vue/static.zip';
  const destinationFile = 'E:/blog/zip/dist/static.zip';

  // 获取源文件的大小
  const sourceFileSize = fs.statSync(sourceFile).size;

  // 创建读取流和写入流
  const readStream = fs.createReadStream(sourceFile);
  const writeStream = fs.createWriteStream(destinationFile);

  // 监听读取流的`data`事件，计算当前复制的字节数并更新进度条
  let copiedBytes = 0;
  readStream.on('data', (chunk) => {
    copiedBytes += chunk.length;
    const progress = (copiedBytes / sourceFileSize) * 100;
    progressBar.update(progress);
  });

  // 监听读取流的`end`事件，表示复制完成
  readStream.on('end', () => {
    progressBar.stop();
    console.log('复制成功！');
  });

  // 复制文件
  console.log('开始复制文件...');
  progressBar.start(100, 0);
  readStream.pipe(writeStream);

  return {
    readStream,
    progressBar
  }
}

module.exports = ConsoleLogOnBuildWebpackPlugin;
```

### shell.js
```js
function exeShell(path,params) {
    return new Promise(function (res,rej) {
        var spawn = require('child_process').spawn;
        var addProcess = spawn(path,params);

        var resultBuffer = [];
        addProcess.stderr.on('data',function (data) {
            resultBuffer.push(data);
        });
        addProcess.stdout.on('data',function (data) {
            resultBuffer.push(data);
        });
        addProcess.on('exit',function () {
            res(Buffer.concat(resultBuffer).toString())
        })
    });
}
module.exports = exeShell;
```

### vue.config.js配置使用
```js
const BuildAfter = require('./src/build/build.after');

  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugin('build-after').use(BuildAfter, ['', '', '']);
    }
  },
```
