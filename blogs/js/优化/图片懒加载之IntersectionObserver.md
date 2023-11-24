---
title: 图片懒加载之IntersectionObserver 
date: 2023-05-18
tags:
 - js
categories:
 - 图片懒加载
---

## 俩种方式实现懒加载，深入浅出IntersectionObserver

懒加载是一种前端常见优化性能技术，其核心思想是将页面中的资源延迟加载，即按需加载。这种方式有助于减少初始页面加载时间，减轻服务器和带宽的压力，从而加速页面加载速度
举个🌰
比方说当我们开发一个有很多图片的长网页时，一般先加载出现在视口内的几张图片，当滚动条滚动到相应图片的位置时再去加载别的图片，这种延迟加载的方式称之为 ~
大抵有俩种方式实现懒加载，一个是监听onscroll属性，另外一个是文章的重点，IntersectionObserver实现

## 代碼

````html
  <style>
     *, *::before, *::after{
          padding : 0;
          margin : 0;
        }
        #app{
          margin:10px;
        }
        .demo{
          height: 20vh;
          background-color: rgb(197, 181, 181);
        }
        .demo + .demo {
          margin-top:10px;
        }
        img{
          width: 100%;
        }
  </style>
     <div id='app'>
      <div class="demo"></div>
      <div class="demo"></div>
      <div class="demo"></div>
      <div class="demo"></div>
      <div class="demo"></div>
      
      
      <img data-src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05539d7daa484ef3a08a5c6267594698~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1280&h=717&s=862809&e=png&a=1&b=23201d"/>
      </div>
      
        <img data-src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ccd400a2b39a4c05bb75681ba12525f1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1280&h=717&s=699777&e=png&a=1&b=daa909"/>
      
         <img data-src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8ddb49cccb76437babff4fbbffa11cbd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1280&h=717&s=670428&e=png&a=1&b=171514"/>
      </div>
````

### 监听onscroll属性实现
````js
 const imgs = document.querySelectorAll('img');
      const lazyLoad = () =>{
      // 浏览器滚动过的高度
        let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        // 可视区域的高度
        let winTop = window.innerHeight; 
        for(let i=0 ;i < imgs.length; i++){
          // 当图片距离页面顶部的距离 < 浏览器滚动过的高度 +  可视区域的高度
          if(imgs[i].offsetTop < scrollTop + winTop){
            imgs[i].src = imgs[i].getAttribute('data-src');
            console.log('第'+ i +'张图片已加载')
          } 
        }
      }
          // 节流函数
      const throttle = (fn, delay) => {
          let currentTime = Date.now()
          return (...args) => {
            nowTime = Date.now()
            if (nowTime - currentTime > delay) {
              fn(...args)
              currentTime = Date.now()
            }
          }
        }
        window.onscroll = throttle(lazyLoad, 500);
````

### IntersectionObserver
````js
 const imgs = document.querySelectorAll('[data-src]')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(item => {
        if (item.isIntersecting) {
          item.target.src = item.target.dataset.src 
          observer.unobserve(item.target) // 停止观察当前元素 避免不可见时候再次调用callback函数
          console.log(item.target.dataset.src  +'图片已加载')
        }
      })
    })
    imgs.forEach(item => {
      observer.observe(item)
    })
    // observer.disconnect() // 离开页面或者不需要observer时
````